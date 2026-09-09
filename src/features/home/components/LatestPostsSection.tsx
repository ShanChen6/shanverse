import * as React from "react";

import { PostCard } from "@/features/home/common/PostCard";
import type { Post } from "@/types/post";

interface LatestPostsSectionProps {
  posts: Post[];
}

export function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Fresh from the Desk
        </p>
        <h2 className="text-2xl font-bold tracking-tight">Latest Posts</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
