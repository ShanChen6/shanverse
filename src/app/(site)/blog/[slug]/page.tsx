import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  RefreshCw,
  Tag,
  UserRound,
} from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import Badge from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { getBlogPost } from "@/features/blog/blog-detail-data";
import { RelatedPosts } from "@/features/blog/components/RelatedPosts";
import { createTableOfContents } from "@/components/common/notion/table-of-contents";
import { ShareArticleButton } from "@/features/blog/components/ShareArticleButton";
import { calculateReadingTime } from "@/features/blog/calculate-reading-time";
import { NotionRenderer } from "@/components/common/notion/renderer";
import { getTranslator } from "@/i18n/server";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildAbsoluteUrl,
  safeMetadataImage,
  SEO_CONFIG,
} from "@/config/seo.config";

type Props = { params: Promise<{ slug: string }> };
function articleUrl(slug: string): string {
  return buildAbsoluteUrl(`/vi/blog/${encodeURIComponent(slug)}`);
}

function formatDate(value: string | null): string {
  if (!value) return "Unpublished";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unpublished";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function sameDay(first: string | null, second: string): boolean {
  if (!first) return false;
  const a = new Date(first);
  const b = new Date(second);
  return (
    !Number.isNaN(a.getTime()) &&
    !Number.isNaN(b.getTime()) &&
    a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10)
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPost(slug);
    if (!post)
      return {
        title: "Article not found | Shanverse",
        robots: { index: false, follow: false },
      };
    const canonical = articleUrl(post.slug);
    const image = safeMetadataImage(post.coverImage ?? post.thumbnailImage);
    const description =
      post.excerpt.replace(/\s+/gu, " ").trim() ||
      `Read ${post.title} on Shanverse.`;
    return {
      title: { absolute: `${post.title} | Shanverse` },
      description,
      alternates: {
        canonical,
        languages: { vi: canonical, "x-default": canonical },
      },
      authors: [{ name: post.authorName ?? SEO_CONFIG.author }],
      creator: post.authorName ?? SEO_CONFIG.author,
      publisher: SEO_CONFIG.siteName,
      keywords: post.tags,
      openGraph: {
        type: "article",
        url: canonical,
        siteName: SEO_CONFIG.siteName,
        locale: "vi_VN",
        title: post.title,
        description,
        images: [{ url: image, alt: post.title }],
        publishedTime: post.publishedAt ?? post.createdAt,
        modifiedTime: post.updatedAt,
        authors: [post.authorName ?? SEO_CONFIG.author],
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: "Blog article | Shanverse",
      description: "Read ideas and practical engineering notes from Shanverse.",
      robots: { index: false, follow: false },
    };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const { locale, t } = await getTranslator();
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const blocks = post.contentBlocks ?? [];
  const { items: toc, headingIds } = createTableOfContents(blocks);
  const publishedDate = post.publishedAt ?? post.createdAt;
  const readingMinutes = calculateReadingTime(post.content);
  const canonical = articleUrl(post.slug);
  const cover = post.coverImage ?? post.thumbnailImage;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
      <article lang="vi" className="space-y-10">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              image: safeMetadataImage(post.coverImage ?? post.thumbnailImage),
              datePublished: publishedDate,
              dateModified: post.updatedAt,
              author: {
                "@type": "Person",
                name: post.authorName ?? SEO_CONFIG.author,
              },
              publisher: { "@type": "Person", name: SEO_CONFIG.author },
              mainEntityOfPage: canonical,
              articleSection: post.category ?? undefined,
              keywords: post.tags.join(", "),
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: buildAbsoluteUrl("/vi"),
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog",
                  item: buildAbsoluteUrl("/vi/blog"),
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: post.title,
                  item: canonical,
                },
              ],
            },
          ]}
        />
        <header className="mx-auto max-w-4xl space-y-6">
          <Breadcrumb
            items={[
              { label: t("common.home"), href: ROUTES.HOME },
              { label: t("common.blog"), href: ROUTES.BLOG },
              { label: post.title },
            ]}
          />
          <Link
            href={ROUTES.BLOG}
            className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> {t("blog.back")}
          </Link>
          {locale === "en" ? (
            <p
              role="note"
              className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground-secondary"
            >
              This article is available in Vietnamese only.
            </p>
          ) : null}
          <div className="space-y-5">
            {post.category ? (
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 text-primary"
              >
                {post.category}
              </Badge>
            ) : null}
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="max-w-3xl text-pretty text-lg leading-8 text-foreground-secondary">
                {post.excerpt}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-border py-4 text-sm text-foreground-secondary">
              <span className="inline-flex items-center gap-2">
                {post.authorAvatar?.startsWith("http") ? (
                  <img
                    src={post.authorAvatar}
                    alt=""
                    className="size-6 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary"
                  >
                    {post.authorAvatar ?? <UserRound className="size-3.5" />}
                  </span>
                )}
                {post.authorName ?? "Shanverse"}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4" />
                <time dateTime={publishedDate}>
                  {formatDate(publishedDate)}
                </time>
              </span>
              {!sameDay(publishedDate, post.updatedAt) ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw aria-hidden="true" className="size-4" />
                  Updated{" "}
                  <time dateTime={post.updatedAt}>
                    {formatDate(post.updatedAt)}
                  </time>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <Clock aria-hidden="true" className="size-4" />
                {t("blog.readingTime", { minutes: readingMinutes })}
              </span>
            </div>
            {post.tags.length ? (
              <div aria-label="Article tags" className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-surface">
                    <Tag aria-hidden="true" className="mr-1 size-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        {cover ? (
          <figure className="relative mx-auto aspect-[16/8] max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface">
            <Image
              src={cover}
              alt={`Cover image for ${post.title}`}
              fill
              priority
              unoptimized
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
            />
          </figure>
        ) : null}
        {toc.length >= 2 ? (
          <details className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-5 lg:hidden">
            <summary className="cursor-pointer font-semibold">
              {t("blog.toc")}
            </summary>
            <nav aria-label={t("blog.toc")} className="mt-4">
              <TocList items={toc} />
            </nav>
          </details>
        ) : null}

        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,800px)_240px]">
          <main className="min-w-0">
            {blocks.length ? (
              <NotionRenderer
                blocks={blocks}
                headingIds={headingIds}
                articleTitle={post.title}
              />
            ) : (
              <p className="rounded-2xl border border-border bg-surface p-6 text-foreground-secondary">
                This article does not have any content yet.
              </p>
            )}
          </main>
          {toc.length >= 2 ? (
            <aside className="sticky top-24 hidden rounded-2xl border border-border bg-surface p-5 lg:block">
              <p className="mb-4 font-semibold">{t("blog.onThisPage")}</p>
              <nav aria-label={t("blog.toc")}>
                <TocList items={toc} />
              </nav>
            </aside>
          ) : null}
        </div>

        <footer className="mx-auto max-w-4xl space-y-10 border-t border-border pt-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <ShareArticleButton title={post.title} url={canonical} />
            <Link
              href={ROUTES.BLOG}
              className="inline-flex items-center gap-2 rounded-md font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("blog.back")}
            </Link>
          </div>
          <section
            aria-labelledby="author-heading"
            className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center"
          >
            {post.authorAvatar?.startsWith("http") ? (
              <img
                src={post.authorAvatar}
                alt={`${post.authorName ?? "Author"}'s avatar`}
                className="size-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl"
              >
                {post.authorAvatar ?? "S"}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-primary">
                {t("blog.writtenBy")}
              </p>
              <h2 id="author-heading" className="text-xl font-semibold">
                {post.authorName ?? "Shanverse"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-foreground-secondary">
                Software engineer sharing practical notes about building
                products and systems.
              </p>
            </div>
          </section>
        </footer>
      </article>
      <RelatedPosts currentPost={post} />
    </div>
  );
}

function TocList({
  items,
}: {
  items: ReturnType<typeof createTableOfContents>["items"];
}) {
  return (
    <ol className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
          <a
            href={`#${item.id}`}
            className="block rounded-sm py-1 text-foreground-secondary transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
