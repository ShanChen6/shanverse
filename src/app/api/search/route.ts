import { getSearchIndex } from "@/features/search/get-search-index";

export const runtime = "nodejs";

/** Search index for the header search dialog. It is loaded on first open, not with every page. */
export async function GET() {
  try {
    const index = await getSearchIndex();
    return Response.json(index, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return Response.json({ documents: [], categories: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
