import "server-only";
import { unstable_cache } from "next/cache";

import { reportContentProblems } from "@/features/notion/skipped-content";
import { logger } from "@/lib/logger";
import { notionService } from "@/services/notion.service";
import { publishedPosts } from "./blog-query";

export const getCachedBlogPosts = unstable_cache(
  async () => {
    const posts = await notionService.getPosts();
    // Runs when the cache refreshes, not on every visit, so the log stays short.
    reportContentProblems("posts", posts, logger);
    return posts;
  },
  ["blog-posts"],
  { revalidate: 300, tags: ["notion-posts"] },
);
export const getCachedCategories = unstable_cache(() => notionService.getCategories(), ["blog-categories"], { revalidate: 300, tags: ["notion-categories"] });
export const getCachedTags = unstable_cache(() => notionService.getTags(), ["blog-tags"], { revalidate: 300, tags: ["notion-tags"] });

export async function getBlogData() {
  // Catch outside the cache so a temporary failure is retried on the next visit.
  const [posts, categories, tags] = await Promise.allSettled([getCachedBlogPosts(), getCachedCategories(), getCachedTags()]);
  return {
    posts: posts.status === "fulfilled" ? publishedPosts(posts.value) : [],
    categories: categories.status === "fulfilled" ? categories.value : [],
    tags: tags.status === "fulfilled" ? tags.value : [],
    hasError: posts.status === "rejected",
  };
}
