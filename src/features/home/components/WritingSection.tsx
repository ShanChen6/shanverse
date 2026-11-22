import * as React from "react";
import { SectionHeader } from "@/components/layout/SectionHeader";

import { ROUTES } from "@/constants/routes";
import { PostCard } from "@/features/home/common/PostCard";
import { getTranslator } from "@/i18n/server";
import type { Post } from "@/types/post";

type WritingSectionProps = {
  /** The one post shown large: the featured one, else the newest. */
  lead: Post | null;
  /** The newest of the rest. */
  posts: Post[];
};

/** Home "Writing" block: one big featured post, then the latest posts. */
export async function WritingSection({ lead, posts }: WritingSectionProps) {
  if (!lead) return null;
  const { t } = await getTranslator();

  return (
    <section aria-labelledby="home-writing-heading" className="space-y-6">
      <SectionHeader titleId="home-writing-heading" title={t("home.latestPosts")} description={t("home.latestPostsDescription")} link={{ href: ROUTES.BLOG, label: t("home.viewAllPosts") }} />

      <PostCard post={lead} variant="featured" />

      {posts.length > 0 ? (
        <div className="grid grid-fill-last gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
