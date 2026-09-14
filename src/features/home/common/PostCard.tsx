import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Clock, UserRound } from "lucide-react";

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

function formatDate(value: string | null): string {
  if (!value) return "Unpublished";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unpublished";
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function imageSource(value: string | null): string | null {
  const source = value?.trim();
  if (!source) return null;
  if (source.startsWith("/") && !source.startsWith("//")) return source;

  try {
    const url = new URL(source);
    return url.protocol === "https:" || url.protocol === "http:" ? source : null;
  } catch {
    return null;
  }
}

interface PostCardProps {
  post: Post;
  variant?: "default" | "featured";
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  const authorName = post.authorName?.trim() || "Shan Kinh Can";
  const visibleTags = [
    ...new Set(post.tags.map((tag) => tag.trim()).filter(Boolean)),
  ].slice(0, 2);
  const thumbnailImage =
    imageSource(post.thumbnailImage) ||
    imageSource(post.coverImage) ||
    "https://res.cloudinary.com/mvzqdllb/image/upload/v1788945427/s0x8c5x20xuuyqek2egk.png";
  const authorAvatar = imageSource(post.authorAvatar);
  const authorEmoji = post.authorAvatar?.trim();
  const dateValue =
    [post.publishedAt, post.createdAt].find(
      (value) => value && !Number.isNaN(new Date(value).getTime()),
    ) ?? null;
  const readingText = post.content.trim() || post.excerpt.trim();
  const wordCount = readingText ? readingText.split(/\s+/u).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const linkFocus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated";

  return (
    <Card
      role="article"
      aria-label={post.title}
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden transition-colors hover:border-primary/50",
        variant === "featured" && "md:grid md:grid-cols-12 md:items-stretch",
      )}
    >
      <div
        className={cn(
          "relative flex h-56 shrink-0 items-center justify-center overflow-hidden bg-surface",
          variant === "featured" && "md:col-span-5 md:h-full md:min-h-72",
        )}
      >
        <Image
          src={thumbnailImage}
          alt={`Thumbnail for ${post.title}`}
          className="object-cover"
          fill
          sizes={
            variant === "featured"
              ? "(min-width: 768px) 40vw, 100vw"
              : "(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          }
          unoptimized
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
      </div>
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          variant === "featured" && "md:col-span-7",
        )}
      >
        <CardHeader className="space-y-3 border-b-0 p-5">
          <div className="flex h-6 min-w-0 gap-1.5 overflow-hidden">
            {visibleTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="min-w-0 max-w-full bg-surface text-[10px] text-foreground-secondary"
              >
                <span className="truncate">{tag}</span>
              </Badge>
            ))}
          </div>
          <h3
            className={cn(
              "min-h-14 text-xl font-semibold leading-7 tracking-tight",
              variant === "featured" && "md:text-2xl md:leading-8",
            )}
          >
            <Link
              href={ROUTES.BLOG_DETAIL(post.slug)}
              className={cn(
                "line-clamp-2 wrap-anywhere rounded-sm transition-colors hover:text-primary",
                linkFocus,
              )}
            >
              {post.title}
            </Link>
          </h3>
          <CardDescription className="min-h-18 p-0 text-foreground-secondary leading-6 line-clamp-3 wrap-anywhere">
            {post.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto px-5 pb-5 pt-0 text-xs text-foreground-secondary">
          <div className="flex min-w-0 items-center gap-2">
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt={`${authorName}'s avatar`}
                width={28}
                height={28}
                unoptimized
                className="h-7 w-7 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                role="img"
                aria-label={`${authorName}'s avatar`}
              >
                {authorEmoji && /\p{Extended_Pictographic}/u.test(authorEmoji) ? (
                  <span aria-hidden="true">{authorEmoji}</span>
                ) : (
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </span>
            )}
            <span className="truncate">{authorName}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-xs text-foreground-secondary">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <CalendarDays
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              {dateValue ? (
                <time dateTime={dateValue}>{formatDate(dateValue)}</time>
              ) : (
                "Unpublished"
              )}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {readingMinutes} min read
            </span>
          </div>
          <Link
            href={ROUTES.BLOG_DETAIL(post.slug)}
            aria-label={`Read more: ${post.title}`}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-sm font-medium text-primary hover:underline",
              linkFocus,
            )}
          >
            Read more
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
