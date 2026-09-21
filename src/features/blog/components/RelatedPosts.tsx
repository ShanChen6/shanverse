import * as React from "react";

import { getCachedBlogPosts } from "@/features/blog/blog-data";
import { getRelatedPosts } from "@/features/blog/related-posts";
import { PostCard } from "@/features/home/common/PostCard";
import { getTranslator } from "@/i18n/server";
import type { Post } from "@/types/post";

export async function RelatedPosts({ currentPost }: { currentPost: Post }) {
  const [{ t }, posts] = await Promise.all([
    getTranslator(),
    getCachedBlogPosts().catch(() => [] as Post[]),
  ]);
  const relatedPosts = getRelatedPosts(currentPost, posts, 3);
  if (relatedPosts.length === 0) return null;
  return <section aria-labelledby="related-posts-heading" className="mx-auto max-w-6xl space-y-6 border-t border-border pt-10"><div><h2 id="related-posts-heading" className="text-2xl font-semibold tracking-tight">{t("blog.relatedPosts")}</h2><p className="mt-2 text-sm leading-relaxed text-foreground-secondary">{t("blog.relatedPostsDescription")}</p></div><div className="grid gap-6 md:grid-cols-3">{relatedPosts.map((post) => <PostCard key={post.id} post={post} />)}</div></section>;
}
