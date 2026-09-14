import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Search,
  Sparkles,
  Sprout,
  Tags,
  X,
} from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Pagination } from "@/components/layout/pagination";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { getBlogData } from "@/features/blog/blog-data";
import {
  blogHref,
  filterPosts,
  getFilterNames,
  parseBlogQuery,
  POSTS_PER_PAGE,
  type BlogSearchParams,
} from "@/features/blog/blog-query";
import { PostCard } from "@/features/home/common/PostCard";
import { cn } from "@/lib/cn";

const description =
  "Explore Shan's notes on Frontend, Backend, System Design, and the lessons learned from building real products.";

export const metadata: Metadata = {
  title: "Blog | Shanverse",
  description,
  openGraph: { title: "Blog | Shanverse", description, type: "website" },
};

const filterClass =
  "inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const linkClass =
  "rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}) {
  const query = parseBlogQuery(await searchParams);
  const data = await getBlogData();
  const categories = getFilterNames(
    data.categories.map((category) => category.name),
    data.posts.flatMap((post) => (post.category ? [post.category] : [])),
  );
  const tags = getFilterNames(
    data.tags.map((tag) => tag.name),
    data.posts.flatMap((post) => post.tags),
  );
  const filteredPosts = filterPosts(data.posts, query);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(query.page, totalPages);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );
  // Featured and latest share the same page of six: every result appears once.
  const featuredPosts = pagePosts.filter((post) => post.featured);
  const latestPosts = pagePosts.filter((post) => !post.featured);
  const hasFilters = Boolean(query.q || query.category || query.tag);

  return (
    <LandingLayout>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12 lg:space-y-12">
        <Breadcrumb
          items={[{ label: "Home", href: ROUTES.HOME }, { label: "Blog" }]}
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
              Ý tưởng, trải nghiệm và những điều mình học được.
            </h1>
            <p
              lang="vi"
              className="max-w-2xl text-pretty leading-relaxed text-foreground-secondary sm:text-lg"
            >
              Ghi chép chuyên sâu về Frontend, Backend, System Design và hành trình
              xây dựng sản phẩm thực tế.
            </p>
          </div>
        </header>

        <section aria-label="Search and filter articles" className="space-y-6">
          <form
            action={ROUTES.BLOG}
            method="get"
            role="search"
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <label htmlFor="blog-search" className="sr-only">
                Search articles
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-3.5 size-5 text-muted"
              />
              <Input
                key={query.q}
                id="blog-search"
                name="q"
                type="search"
                defaultValue={query.q}
                placeholder="Search ideas, topics, or technologies…"
                className="h-12 pl-12"
              />
            </div>
            {query.category && (
              <input type="hidden" name="category" value={query.category} />
            )}
            {query.tag && <input type="hidden" name="tag" value={query.tag} />}
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-6 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary"
            >
              Search <ArrowUpRight aria-hidden="true" className="size-4" />
            </button>
          </form>

          <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
            <Link
              href={blogHref(query, { category: "", page: 1 })}
              aria-current={!query.category ? "true" : undefined}
              className={cn(
                filterClass,
                !query.category
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-surface text-foreground-secondary hover:border-primary/40 hover:text-primary",
              )}
            >
              All categories
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={blogHref(query, { category, page: 1 })}
                aria-current={
                  query.category.toLowerCase() === category.toLowerCase()
                    ? "true"
                    : undefined
                }
                className={cn(
                  filterClass,
                  query.category.toLowerCase() === category.toLowerCase()
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-surface text-foreground-secondary hover:border-primary/40 hover:text-primary",
                )}
              >
                <span className="break-words [overflow-wrap:anywhere]">
                  {category}
                </span>
              </Link>
            ))}
          </nav>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-foreground-secondary">Active filters:</span>
              {(["q", "category", "tag"] as const)
                .filter((key) => query[key])
                .map((key) => (
                  <Link
                    key={key}
                    href={blogHref(query, { [key]: "", page: 1 })}
                    aria-label={`Remove ${key === "q" ? "search" : key} filter: ${query[key]}`}
                    className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-foreground hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="break-words [overflow-wrap:anywhere]">
                      {query[key]}
                    </span>
                    <X aria-hidden="true" className="size-3.5" />
                  </Link>
                ))}
              <Link href={ROUTES.BLOG} className={linkClass}>
                Clear filters
              </Link>
            </div>
          )}
        </section>

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
            <a href={blogHref(query)} className={linkClass}>
              Try again
            </a>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
              <p role="status" className="text-sm text-foreground-secondary">
                <span className="font-semibold text-foreground">
                  {filteredPosts.length}
                </span>{" "}
                {filteredPosts.length === 1 ? "article" : "articles"} found
              </p>
              {filteredPosts.length > 0 && (
                <p className="text-xs text-muted">
                  Newest first · Page {currentPage} of {totalPages}
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
                    Featured writing
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
                    <Sprout
                      aria-hidden="true"
                      className="mx-auto mb-4 size-9 text-primary"
                    />
                    <h2 className="text-2xl font-semibold">
                      {data.posts.length === 0
                        ? "New ideas are taking root"
                        : "No matching articles"}
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-foreground-secondary">
                      {data.posts.length === 0
                        ? "There are no published articles yet. Come back soon for fresh notes and ideas."
                        : "Try a different search or clear your filters to explore more writing."}
                    </p>
                    {hasFilters && (
                      <Link
                        href={ROUTES.BLOG}
                        className={cn(linkClass, "mt-6 inline-block")}
                      >
                        Clear filters
                      </Link>
                    )}
                  </section>
                ) : latestPosts.length > 0 ? (
                  <section aria-labelledby="latest-heading" className="space-y-5">
                    <div className="flex items-center gap-2">
                      <BookOpen aria-hidden="true" className="size-5 text-primary" />
                      <h2
                        id="latest-heading"
                        className="text-2xl font-semibold tracking-tight"
                      >
                        Latest articles
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
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        href={blogHref(query, {
                          tag:
                            query.tag.toLowerCase() === tag.toLowerCase()
                              ? ""
                              : tag,
                          page: 1,
                        })}
                        aria-current={
                          query.tag.toLowerCase() === tag.toLowerCase()
                            ? "true"
                            : undefined
                        }
                        className={cn(
                          filterClass,
                          "px-3 py-1.5 text-xs",
                          query.tag.toLowerCase() === tag.toLowerCase()
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary",
                        )}
                      >
                        <span className="break-words [overflow-wrap:anywhere]">
                          #{tag}
                        </span>
                      </Link>
                    ))}
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
