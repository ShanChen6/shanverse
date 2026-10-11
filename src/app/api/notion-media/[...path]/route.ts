import { unstable_cache } from "next/cache";

import { parseNotionMediaPath, type NotionMediaTarget } from "@/lib/notion-media";
import { notionService } from "@/services/notion.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ path: string[] }> };

// Signed Notion links live about an hour; reuse one for at most 30 minutes so a
// cold CDN does not call the Notion API for every image request.
const cachedFreshUrl = unstable_cache(
	(target: NotionMediaTarget) => notionService.getFreshFileUrl(target),
	["notion-media-url"],
	{ revalidate: 1800 },
);

const IMMUTABLE = "public, max-age=31536000, immutable";
const SHORT = "public, max-age=300, s-maxage=3600";

function errorResponse(status: number) {
	return new Response(null, {
		status,
		headers: { "Cache-Control": status === 404 ? "public, max-age=60" : "no-store" },
	});
}

async function fetchImage(url: string | null) {
	if (!url?.startsWith("https://")) return null;
	const response = await fetch(url, { cache: "no-store" });
	const type = response.headers.get("content-type") ?? "";
	return response.ok && response.body && type.startsWith("image/") ? response : null;
}

export async function GET(request: Request, { params }: Props) {
	const target = parseNotionMediaPath((await params).path);
	if (!target) return errorResponse(404);

	try {
		const cachedUrl = await cachedFreshUrl(target);
		if (!cachedUrl) return errorResponse(404);

		// A cached link can still expire early; retry once with a brand-new one.
		const upstream =
			(await fetchImage(cachedUrl)) ??
			(await fetchImage(await notionService.getFreshFileUrl(target)));
		if (!upstream?.body) return errorResponse(502);

		const versioned = new URL(request.url).searchParams.has("v");
		const headers = new Headers({
			"Content-Type": upstream.headers.get("content-type") as string,
			"Cache-Control": versioned ? IMMUTABLE : SHORT,
			"X-Content-Type-Options": "nosniff",
			// Uploaded SVGs must not run scripts when opened directly.
			"Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
		});
		const length = upstream.headers.get("content-length");
		if (length) headers.set("Content-Length", length);

		return new Response(upstream.body, { headers });
	} catch {
		return errorResponse(502);
	}
}
