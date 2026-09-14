import "server-only";
import { unstable_cache } from "next/cache";

import { notionService } from "@/services/notion.service";
import { publishedPosts } from "./blog-query";

const getPosts = unstable_cache(() => notionService.getPosts(), ["blog-posts"], { revalidate: 300 });
const getCategories = unstable_cache(() => notionService.getCategories(), ["blog-categories"], { revalidate: 300 });
const getTags = unstable_cache(() => notionService.getTags(), ["blog-tags"], { revalidate: 300 });

export async function getBlogData() {
  // Catch outside the cache so a temporary failure is retried on the next visit.
  const [posts, categories, tags] = await Promise.allSettled([getPosts(), getCategories(), getTags()]);
  return {
    posts: posts.status === "fulfilled" ? publishedPosts(posts.value) : [],
    categories: categories.status === "fulfilled" ? categories.value : [],
    tags: tags.status === "fulfilled" ? tags.value : [],
    hasError: posts.status === "rejected",
  };
}
