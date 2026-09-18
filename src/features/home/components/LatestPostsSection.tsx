import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ArrowRight } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { PostCard } from "@/features/home/common/PostCard";
import type { Post } from "@/types/post";

interface LatestPostsSectionProps {
  posts: Post[];
}

export function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  if (posts.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Fresh from the Desk
          </p>
          <h2 className="text-2xl font-bold tracking-tight">Latest Posts</h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            Recent lessons from building software and products.
          </p>
        </div>
        <Link
          href={ROUTES.BLOG}
          className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
        >
          View all posts <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
