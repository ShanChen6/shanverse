import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
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
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Selected Writing
          </p>
          <h2 className="text-2xl font-bold tracking-tight">Featured Posts</h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            Selected ideas and practical notes from Shanverse.
          </p>
        </div>
        <Link
          href={ROUTES.BLOG}
          className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
        >
          View all <Sparkles className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-6">
        <PostCard post={leadPost} variant="featured" />

        {supportingPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {supportingPosts.slice(0, 2).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
