import * as React from "react";
import { ArrowRight } from "lucide-react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
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
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("home.latestPostsEyebrow")}</p>
          <h2 id="home-writing-heading" className="text-2xl font-bold tracking-tight">{t("home.latestPosts")}</h2>
          <p className="mt-1 text-sm text-foreground-secondary">{t("home.latestPostsDescription")}</p>
        </div>
        <Link
          href={ROUTES.BLOG}
          className="inline-flex min-h-10 items-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
        >
          {t("home.viewAllPosts")} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <PostCard post={lead} variant="featured" />

      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
