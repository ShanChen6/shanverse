import * as React from "react";
import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import {
  BookOpen,
  SearchX,
  Sparkles,
  Sprout,
  Tags,
} from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Pagination } from "@/components/layout/pagination";
import { ROUTES } from "@/constants/routes";
import { getBlogData } from "@/features/blog/blog-data";
import {
  blogHref,
  filterPosts,
  parseBlogQuery,
  postTime,
  POSTS_PER_PAGE,
  type BlogSearchParams,
} from "@/features/blog/blog-query";
import {
  buildBlogFilterOptions,
  resolveBlogFilterName,
  type BlogSearchSuggestion,
} from "@/features/blog/blog-search";
import { BlogSearchPanel } from "@/features/blog/components/BlogSearchPanel";
import { PostCard } from "@/features/home/common/PostCard";
import { cn } from "@/lib/cn";
import { getTranslator } from "@/i18n/server";
import { localizeHref } from "@/i18n/config";

const description =
  "Explore Shan's notes on Frontend, Backend, System Design, and the lessons learned from building real products.";

export const metadata: Metadata = {
  title: "Blog | Shanverse",
  description,
  openGraph: { title: "Blog | Shanverse", description, type: "website" },
};

const linkClass =
  "rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}) {
  const query = parseBlogQuery(await searchParams);
  const { locale, t } = await getTranslator();
  const data = await getBlogData();
  const categories = buildBlogFilterOptions(
    data.categories,
    data.posts.flatMap((post) => (post.category ? [post.category] : [])),
    (name) =>
      data.posts.filter(
        (post) => post.category?.toLowerCase() === name.toLowerCase(),
      ).length,
  );
  const tags = buildBlogFilterOptions(
    data.tags,
    data.posts.flatMap((post) => post.tags),
    (name) =>
      data.posts.filter((post) =>
        post.tags.some((tag) => tag.toLowerCase() === name.toLowerCase()),
      ).length,
  );
  const resolvedQuery = {
    ...query,
    category: resolveBlogFilterName(categories, query.category),
    tag: resolveBlogFilterName(tags, query.tag),
  };
  const filteredPosts = filterPosts(data.posts, resolvedQuery);
  const suggestions: BlogSearchSuggestion[] = [
    ...data.posts.slice(0, 80).map((post) => ({
      id: `article-${post.slug}`,
      type: "article" as const,
      title: post.title,
      description: post.excerpt.replace(/\s+/gu, " ").trim().slice(0, 140),
      href: ROUTES.BLOG_DETAIL(post.slug),
      keywords: [post.category ?? "", ...post.tags],
      slug: post.slug,
      category: post.category,
      publishedAt: post.publishedAt ?? post.createdAt,
      readingTimeMinutes: post.readingTimeMinutes,
      featured: post.featured,
      timestamp: postTime(post),
    })),
    ...categories.map((category) => ({
      id: `category-${category.slug}`,
      type: "category" as const,
      title: category.name,
      description: `${category.count} ${category.count === 1 ? "article" : "articles"}`,
      href: blogHref(query, { category: category.slug, page: 1 }),
      keywords: [category.slug],
      slug: category.slug,
    })),
    ...tags.map((tag) => ({
      id: `tag-${tag.slug}`,
      type: "tag" as const,
      title: tag.name,
      description: `${tag.count} ${tag.count === 1 ? "article" : "articles"}`,
      href: blogHref(query, { tag: tag.slug, page: 1 }),
      keywords: [tag.slug],
      slug: tag.slug,
    })),
  ].slice(0, 120);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(query.page, totalPages);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );
  const hasFilters = Boolean(query.q || query.category || query.tag);
  // Featured and latest share the same page of six: every result appears once.
  const featuredPosts = hasFilters
    ? []
    : pagePosts.filter((post) => post.featured);
  const latestPosts = hasFilters
    ? pagePosts
    : pagePosts.filter((post) => !post.featured);

  return (
    <LandingLayout>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12 lg:space-y-12">
        <Breadcrumb
          items={[{ label: t("common.home"), href: localizeHref(ROUTES.HOME, locale) }, { label: t("common.blog") }]}
        />

        <header className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-background p-6 sm:p-10 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-primary/10 sm:size-96"
          />
          <div className="relative max-w-3xl space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-xs font-medium text-primary">
              <Sprout className="size-4" aria-hidden="true" /> Shan&apos;s digital
              garden
            </p>
            <h1
              lang="vi"
              className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              {t("blog.title")}
            </h1>
            <p
              lang="vi"
              className="max-w-2xl text-pretty leading-relaxed text-foreground-secondary sm:text-lg"
            >
              {t("blog.description")}
            </p>
          </div>
        </header>

        {locale === "en" ? (
          <p role="note" className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground-secondary">
            {t("blog.vietnameseOnly")}
          </p>
        ) : null}

        <BlogSearchPanel
          query={query}
          categories={categories}
          suggestions={suggestions}
          totalPosts={data.posts.length}
        />
        {data.hasError ? (
          <section
            role="status"
            className="rounded-2xl border border-border bg-surface px-6 py-16 text-center"
          >
            <BookOpen
              aria-hidden="true"
              className="mx-auto mb-4 size-9 text-primary"
            />
            <h2 className="text-2xl font-semibold">
              The garden is taking a little break
            </h2>
            <p className="mx-auto mb-6 mt-3 max-w-lg text-foreground-secondary">
              We couldn&apos;t load the articles right now. Please try again in a
              moment.
            </p>
            <a href={localizeHref(blogHref(query), locale)} className={linkClass}>
              {t("common.retry")}
            </a>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
              <p role="status" className="text-sm text-foreground-secondary">
                {query.q ? (
                  t(filteredPosts.length === 1 ? "blog.resultsForOne" : "blog.resultsForOther", { count: filteredPosts.length, query: query.q })
                ) : (
                  t(filteredPosts.length === 1 ? "blog.articleCountOne" : "blog.articleCountOther", { count: filteredPosts.length })
                )}
              </p>
              {filteredPosts.length > 0 && (
                <p className="text-xs text-muted">
                  {query.q ? t("blog.bestMatch") : t("blog.newest")} · Page {currentPage} of {totalPages}
                </p>
              )}
            </div>

            {featuredPosts.length > 0 && (
              <section aria-labelledby="featured-heading" className="space-y-5">
                <div className="flex items-center gap-2">
                  <Sparkles aria-hidden="true" className="size-5 text-primary" />
                  <h2
                    id="featured-heading"
                    className="text-2xl font-semibold tracking-tight"
                  >
                    {t("blog.featured")}
                  </h2>
                </div>
                <div className="space-y-6">
                  {featuredPosts.map((post) => (
                    <PostCard key={post.id} post={post} variant="featured" />
                  ))}
                </div>
              </section>
            )}

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
              <div className="min-w-0 space-y-8">
                {filteredPosts.length === 0 ? (
                  <section
                    role="status"
                    className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center"
                  >
                    {data.posts.length === 0 ? <Sprout
                      aria-hidden="true"
                      className="mx-auto mb-4 size-9 text-primary"
                    /> : <SearchX aria-hidden="true" className="mx-auto mb-4 size-9 text-primary" />}
                    <h2 className="text-2xl font-semibold">
                      {data.posts.length === 0
                        ? "New ideas are taking root"
                        : t("blog.noResults")}
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-foreground-secondary">
                      {data.posts.length === 0
                        ? "There are no published articles yet. Come back soon for fresh notes and ideas."
                        : query.q
                          ? `No articles matched “${query.q}”. Try another keyword or clear the current filters.`
                          : "Try clearing the current filters to explore more writing."}
                    </p>
                    {hasFilters ? (
                      <div className="mt-6 flex flex-wrap justify-center gap-4">
                        {query.q ? <Link href={localizeHref(blogHref(query, { q: "", page: 1 }), locale)} className={linkClass}>{t("blog.clearSearch")}</Link> : null}
                        {query.category || query.tag ? <Link href={localizeHref(blogHref(query, { category: "", tag: "", page: 1 }), locale)} className={linkClass}>{t("blog.clearFilters")}</Link> : null}
                      </div>
                    ) : null}
                  </section>
                ) : latestPosts.length > 0 ? (
                  <section aria-labelledby="latest-heading" className="space-y-5">
                    <div className="flex items-center gap-2">
                      <BookOpen aria-hidden="true" className="size-5 text-primary" />
                      <h2
                        id="latest-heading"
                        className="text-2xl font-semibold tracking-tight"
                      >
                        {t("blog.latest")}
                      </h2>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {latestPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </section>
                ) : null}

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hrefBuilder={(page) => blogHref(query, { page })}
                    className="justify-center border-t border-border pt-6"
                  />
                )}
              </div>

              <aside
                aria-labelledby="tags-heading"
                className="min-w-0 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-24"
              >
                <h2
                  id="tags-heading"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Tags aria-hidden="true" className="size-4 text-primary" /> Explore
                  tags
                </h2>
                <p className="mb-5 mt-2 text-sm leading-relaxed text-foreground-secondary">
                  Follow a thread that sparks your curiosity.
                </p>
                {tags.length > 0 ? (
                  <nav
                    aria-label="Filter by tag"
                    className="flex max-h-96 flex-wrap gap-2 overflow-y-auto p-1 -m-1"
                  >
                    {tags.map((tag) => {
                      const active =
                        resolvedQuery.tag.toLowerCase() === tag.name.toLowerCase();
                      return (
                      <Link
                        key={tag.slug}
                        href={localizeHref(blogHref(query, {
                          tag: active ? "" : tag.slug,
                          page: 1,
                        }), locale)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "inline-flex min-h-9 max-w-full items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                          active
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary",
                        )}
                      >
                        <span className="break-words [overflow-wrap:anywhere]">
                          #{tag.name}
                        </span>
                        <span className="text-[10px] opacity-70">{tag.count}</span>
                      </Link>
                    )})}
                  </nav>
                ) : (
                  <p className="text-sm text-muted">
                    Topics will appear as the garden grows.
                  </p>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </LandingLayout>
  );
}
