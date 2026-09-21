import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { notionService } from "@/services/notion.service";
import type { Post } from "@/types/post";

const getCachedPost = unstable_cache(
  (slug: string) => notionService.getPostBySlug(slug),
  ["blog-post-detail"],
  { revalidate: 300, tags: ["notion-posts"] },
);

export const getBlogPost = cache(async (slug: string): Promise<Post | null> => {
  const post = await getCachedPost(slug);
  return post?.published === true && post.title.trim() && post.slug.trim()
    ? post
    : null;
});

