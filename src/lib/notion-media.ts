// Stable URLs for files uploaded to Notion.
//
// The Notion API returns uploaded files as signed S3 links that expire after
// about an hour, so they must never reach HTML, Open Graph tags or caches.
// Instead we hand out /api/notion-media/... paths that the route handler turns
// back into a fresh signed link on request. The `v` query string changes when
// the Notion block or page is edited, so responses can be cached as immutable.
//
// To move images to your own storage later (R2, S3, Blob...), change what
// `notionMediaUrl` returns; nothing in the UI depends on this format.

export const NOTION_MEDIA_PREFIX = "/api/notion-media";

export const notionPageImageSlots = ["cover", "thumbnailImage", "coverImage"] as const;
export type NotionPageImageSlot = (typeof notionPageImageSlots)[number];

export type NotionMediaTarget =
	| { kind: "block"; id: string }
	| { kind: "page"; id: string; slot: NotionPageImageSlot };

const NOTION_ID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

const normalizeId = (id: string) => id.replace(/-/g, "").toLowerCase();

const version = (editedTime: string) => {
	const time = Date.parse(editedTime);
	return Number.isNaN(time) ? "0" : time.toString(36);
};

export function notionMediaUrl(target: NotionMediaTarget, editedTime: string): string {
	const path =
		target.kind === "block"
			? `block/${normalizeId(target.id)}`
			: `page/${normalizeId(target.id)}/${target.slot}`;
	return `${NOTION_MEDIA_PREFIX}/${path}?v=${version(editedTime)}`;
}

export function parseNotionMediaPath(segments: readonly string[]): NotionMediaTarget | null {
	const [kind, id, slot, ...rest] = segments;
	if (!id || !NOTION_ID.test(id) || rest.length) return null;
	if (kind === "block" && slot === undefined) return { kind, id: normalizeId(id) };
	if (kind === "page" && notionPageImageSlots.includes(slot as NotionPageImageSlot)) {
		return { kind, id: normalizeId(id), slot: slot as NotionPageImageSlot };
	}
	return null;
}

/** An image source that is either a same-origin path or an http(s) URL. */
export function safeImageSource(value: string | null | undefined): string | null {
	const source = value?.trim();
	if (!source) return null;
	if (source.startsWith("/") && !source.startsWith("//")) return source;
	try {
		const url = new URL(source);
		return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
	} catch {
		return null;
	}
}
