import { revalidateTag } from "next/cache";

import { createRevalidateHandler } from "@/features/notion/revalidate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST (header `Authorization: Bearer <REVALIDATE_SECRET>`) from a Notion automation or any script.
// GET works too, for a Notion "Open link" button; see docs/notion-projects.md.
const handle = createRevalidateHandler({
  secret: process.env.REVALIDATE_SECRET,
  // `expire: 0` drops the cached copy now, so the next visit reads Notion again.
  revalidate: (tag) => revalidateTag(tag, { expire: 0 }),
});

export const GET = handle;
export const POST = handle;
