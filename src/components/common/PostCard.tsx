import * as React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";

import Badge from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import type { Post } from "@/types/post";

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden hover:border-primary/50 transition-colors">
      <div className="relative flex h-32 items-center justify-center bg-linear-to-br from-primary/20 via-primary/10 to-transparent text-muted-foreground">
        {"</>"}
        {post.category ? (
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 text-[10px]"
          >
            {post.category}
          </Badge>
        ) : null}
      </div>
      <CardHeader className="space-y-1">
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        <CardTitle className="text-base leading-snug">
          <Link
            href={ROUTES.BLOG_DETAIL(post.slug)}
            className="hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {post.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(post.publishedAt)}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />{" "}
          {Math.max(1, Math.round(post.content.length / 800))} min read
        </span>
      </CardContent>
    </Card>
  );
}
