import "server-only";
import { unstable_cache } from "next/cache";

import { notionService } from "@/services/notion.service";
import { publishedPosts } from "./blog-query";

export const getCachedBlogPosts = unstable_cache(() => notionService.getPosts(), ["blog-posts"], { revalidate: 300 });
export const getCachedCategories = unstable_cache(() => notionService.getCategories(), ["blog-categories"], { revalidate: 300 });
export const getCachedTags = unstable_cache(() => notionService.getTags(), ["blog-tags"], { revalidate: 300 });

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
