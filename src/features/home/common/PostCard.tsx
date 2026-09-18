"use client";

import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Sparkles,
  UserRound,
} from "lucide-react";

import Badge from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import type { Post } from "@/types/post";
import { useI18n } from "@/i18n/client";
import { formatDate } from "@/i18n/format";

function imageSource(value: string | null): string | null {
  const source = value?.trim();
  if (!source) return null;
  if (source.startsWith("/") && !source.startsWith("//")) return source;

  try {
    const url = new URL(source);
    return url.protocol === "https:" || url.protocol === "http:"
      ? source
      : null;
  } catch {
    return null;
  }
}

interface PostCardProps {
  post: Post;
  variant?: "default" | "featured";
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  const { locale, t } = useI18n();
  const authorName = post.authorName?.trim() || "Shanverse";
  const authorAvatar = imageSource(post.authorAvatar);
  const tags = [...new Set(post.tags.map((tag) => tag.trim()).filter(Boolean))];
  const visibleTags = tags.slice(0, 2);
  const thumbnailImage =
    imageSource(post.thumbnailImage) ||
    imageSource(post.coverImage) ||
    "/logo/logo_shanverse.png";
  const dateValue =
    [post.publishedAt, post.createdAt].find(
      (value) => value && !Number.isNaN(new Date(value).getTime()),
    ) ?? null;
  const readingMinutes = Number.isInteger(post.readingTimeMinutes) && (post.readingTimeMinutes ?? 0) > 0
    ? post.readingTimeMinutes
    : null;
  const postHref = ROUTES.BLOG_DETAIL(post.slug);
  const linkFocus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated";

  return (
    <Card
      role="article"
      aria-label={post.title}
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-md focus-within:border-primary/60",
        variant === "featured" && "md:grid md:grid-cols-12 md:items-stretch",
      )}
    >
      <Link
        href={postHref}
        aria-label={`Read ${post.title}`}
        className={cn(
          "relative block aspect-video shrink-0 overflow-hidden border-b border-border bg-surface focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
          variant === "featured" &&
            "md:col-span-5 md:aspect-auto md:h-full md:min-h-80 md:border-b-0 md:border-r",
        )}
      >
        <Image
          src={thumbnailImage}
          alt={`Thumbnail for ${post.title}`}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          fill
          sizes={
            variant === "featured"
              ? "(min-width: 768px) 40vw, 100vw"
              : "(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          }
          loading="lazy"
        />
        {post.category ? (
          <Badge
            variant="outline"
            className="absolute left-4 top-4 max-w-[calc(100%-2rem)] border-primary/20 bg-surface-elevated/95 text-primary"
          >
            <span className="truncate">{post.category}</span>
          </Badge>
        ) : null}
      </Link>
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          variant === "featured" && "md:col-span-7",
        )}
      >
        <CardHeader className="flex flex-1 flex-col gap-3 border-b-0 p-5 sm:p-6">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {variant === "featured" && post.featured ? (
              <Badge className="gap-1 bg-primary/10 text-primary">
                <Sparkles className="size-3" aria-hidden="true" /> Featured
              </Badge>
            ) : null}
            {visibleTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="min-w-0 max-w-full bg-surface text-[10px] text-foreground-secondary"
              >
                <span className="truncate">#{tag}</span>
              </Badge>
            ))}
            {tags.length > visibleTags.length ? (
              <Badge
                variant="outline"
                aria-label={`${tags.length - visibleTags.length} more tags`}
                className="bg-surface text-[10px] text-foreground-secondary"
              >
                +{tags.length - visibleTags.length}
              </Badge>
            ) : null}
          </div>
          <h3
            className={cn(
              "line-clamp-2 text-xl font-semibold leading-7 tracking-tight wrap-anywhere",
              variant === "featured" && "md:text-2xl md:leading-8",
            )}
          >
            <Link
              href={postHref}
              className={cn(
                "rounded-sm transition-colors hover:text-primary",
                linkFocus,
              )}
            >
              {post.title}
            </Link>
          </h3>
          {post.excerpt.trim() ? (
            <CardDescription className="line-clamp-3 p-0 leading-6 text-foreground-secondary wrap-anywhere">
              {post.excerpt.trim()}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex min-w-0 items-center gap-2 px-5 pb-4 pt-0 text-xs text-foreground-secondary sm:px-6">
          {authorAvatar ? (
            <Image
              src={authorAvatar}
              alt={`${authorName}'s avatar`}
              width={28}
              height={28}
              className="size-7 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <UserRound className="size-3.5" />
            </span>
          )}
          <span className="truncate">{authorName}</span>
        </CardContent>
        <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-xs text-foreground-secondary sm:px-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <CalendarDays
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              {dateValue && formatDate(dateValue, locale) ? (
                <time dateTime={dateValue}>{formatDate(dateValue, locale)}</time>
              ) : null}
            </span>
            {readingMinutes ? (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t("blog.readingTime", { minutes: readingMinutes })}
              </span>
            ) : null}
          </div>
          <Link
            href={postHref}
            aria-label={`Read more: ${post.title}`}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-1 rounded-sm font-medium text-primary hover:underline",
              linkFocus,
            )}
          >
            {t("common.readMore")}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
