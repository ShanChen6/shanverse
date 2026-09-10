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
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import type { Post } from "@/types/post";

function formatDate(value: string | null): string {
  if (!value) return "Unpublished";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unpublished";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

interface PostCardProps {
  post: Post;
  variant?: "default" | "featured";
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  const authorName = post.authorName ?? "Shan Kinh Can";
  const tags = post.tags.filter(Boolean);
  const visibleTags = tags.slice(0, 2);
  const extraTagCount = Math.max(0, tags.length - visibleTags.length);
  const thumbnailImage = post.thumbnailImage ?? post.coverImage;

  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden hover:border-primary/50 transition-colors",
        variant === "featured" && "md:grid md:grid-cols-12 md:items-stretch",
      )}
    >
      <div
        className={cn(
          "relative flex h-60 items-center justify-center overflow-hidden bg-linear-to-br from-primary/20 via-primary/10 to-transparent text-muted-foreground",
          variant === "featured" && "md:col-span-5 md:h-full md:min-h-72",
        )}
      >
        {thumbnailImage ? (
          <Image
            src={thumbnailImage}
            alt=""
            className="h-full w-full object-cover"
            fill
            unoptimized
            loading="lazy"
          />
        ) : (
          <Image
            src="https://res.cloudinary.com/mvzqdllb/image/upload/v1788945427/s0x8c5x20xuuyqek2egk.png"
            alt="not-found"
            className="h-full w-full object-cover"
            fill
            unoptimized
            loading="lazy"
          />
        )}
        {post.category ? (
          <Badge
            variant="default"
            className="absolute left-3 top-3 text-[10px]"
          >
            {post.category}
          </Badge>
        ) : null}
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          variant === "featured" && "md:col-span-7",
        )}
      >
        <CardHeader className="space-y-3">
          <div className="flex min-h-6 flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {extraTagCount > 0 ? (
              <Badge variant="secondary" className="text-[10px]">
                +{extraTagCount}
              </Badge>
            ) : null}
          </div>
          <CardTitle className="p-0 leading-snug line-clamp-2">
            <Link
              href={ROUTES.BLOG_DETAIL(post.slug)}
              className="block hover:text-primary transition-colors"
            >
              {post.title}
            </Link>
          </CardTitle>
          <CardDescription className="p-0 line-clamp-3">
            {post.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto min-h-6 space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {post.authorAvatar ? (
              <img
                src={post.authorAvatar}
                alt=""
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <UserRound className="h-3.5 w-3.5" />
            )}
            <span className="truncate">{authorName}</span>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />{" "}
              {formatDate(post.createdAt)}
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />{" "}
              {Math.max(1, Math.round(post.content.length / 800))} min read
            </span>
          </div>
          <Link
            href={ROUTES.BLOG_DETAIL(post.slug)}
            className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline"
          >
            Read article <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
