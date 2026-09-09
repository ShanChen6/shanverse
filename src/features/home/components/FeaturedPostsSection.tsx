import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { PostCard } from "@/features/home/common/PostCard";
import { ROUTES } from "@/constants/routes";
import type { Post } from "@/types/post";

interface FeaturedPostsSectionProps {
  posts: Post[];
}

export function FeaturedPostsSection({ posts }: FeaturedPostsSectionProps) {
  if (posts.length === 0) return null;

  const [leadPost, ...supportingPosts] = posts;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Selected Writing
          </p>
          <h2 className="text-2xl font-bold tracking-tight">Featured Posts</h2>
        </div>
        <Link
          href={ROUTES.BLOG}
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          View all <Sparkles className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-6">
        <PostCard post={leadPost} variant="featured" />

        {supportingPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {supportingPosts.slice(0, 3).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
