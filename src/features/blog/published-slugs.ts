import "server-only";

import { unstable_cache } from "next/cache";

import { notionService } from "@/services/notion.service";

export const PUBLISHED_SLUGS_REVALIDATE_SECONDS = 60;

// Shared across requests so the view-count API costs at most one Notion query
// per minute, however often it is called. Failures are not cached.
const getCachedPublishedPostSlugs = unstable_cache(
  () => notionService.getPublishedPostSlugs(),
  ["blog-published-slugs"],
  { revalidate: PUBLISHED_SLUGS_REVALIDATE_SECONDS, tags: ["notion-posts"] },
);

export async function isPublishedPostSlug(slug: string): Promise<boolean> {
  if (!slug.trim()) return false;
  return (await getCachedPublishedPostSlugs()).includes(slug);
}
