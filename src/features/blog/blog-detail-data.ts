import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { notionService } from "@/services/notion.service";
import { getCachedBlogPosts } from "./blog-data";
import { publishedPosts } from "./blog-query";
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

export async function getRelatedPosts(post: Post): Promise<Post[]> {
  const posts = publishedPosts(await getCachedBlogPosts()).filter(
    (candidate) => candidate.id !== post.id,
  );
  const tags = new Set(post.tags.map((tag) => tag.toLowerCase()));

  return posts
    .map((candidate, index) => ({
      candidate,
      index,
      categoryMatch:
        Boolean(post.category) &&
        candidate.category?.toLowerCase() === post.category?.toLowerCase(),
      tagMatches: candidate.tags.filter((tag) => tags.has(tag.toLowerCase())).length,
    }))
    .sort(
      (a, b) =>
        Number(b.categoryMatch) - Number(a.categoryMatch) ||
        b.tagMatches - a.tagMatches ||
        a.index - b.index,
    )
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}
