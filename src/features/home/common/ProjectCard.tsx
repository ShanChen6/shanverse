import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import Image from "next/image";
import { ArrowUpRight, Code2, ExternalLink, Sparkles } from "lucide-react";

import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  variant?: "default" | "featured";
}

const PLACEHOLDER_IMAGE = "/logo/logo_shanverse.png";

function safeExternalUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function formatProjectDate(project: Project) {
  const date = new Date(project.updatedAt || project.createdAt);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en", {
        month: "short",
        year: "numeric",
      }).format(date);
}

export function ProjectCard({
  project,
  variant = "default",
}: ProjectCardProps) {
  const thumbnailImage =
    safeExternalUrl(project.thumbnailImage) ??
    safeExternalUrl(project.coverImage) ??
    PLACEHOLDER_IMAGE;
  const githubUrl = safeExternalUrl(project.githubUrl);
  const liveUrl = safeExternalUrl(project.liveUrl);
  const technologies = [
    ...new Set(project.techStack.map((item) => item.trim()).filter(Boolean)),
  ];
  const displayedTech = technologies.slice(0, 4);
  const remainingTech = technologies.length - displayedTech.length;
  const date = formatProjectDate(project);
  const featured = variant === "featured";

  return (
    <Card
      role="article"
      aria-label={project.title}
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-md focus-within:border-primary/60",
        featured && "md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
      )}
    >
      <Link
        href={ROUTES.PROJECT_DETAIL(project.slug)}
        aria-label={`View project ${project.title}`}
        className={cn(
          "relative block aspect-video overflow-hidden border-b border-border bg-linear-to-br from-primary/20 via-primary/10 to-surface focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
          featured && "md:aspect-auto md:min-h-80 md:border-b-0 md:border-r",
        )}
      >
        <Image
          src={thumbnailImage}
          alt={`${project.title} project thumbnail`}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          fill
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 55vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <CardHeader className="flex flex-1 flex-col gap-3 border-b-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {featured && project.featured ? (
              <Badge className="gap-1 bg-primary/10 text-primary">
                <Sparkles className="size-3" aria-hidden="true" /> Featured
                project
              </Badge>
            ) : null}
            {date ? (
              <time className="text-xs text-muted">Updated {date}</time>
            ) : null}
          </div>
          <CardTitle
            className={`${featured ? "text-2xl" : "text-xl"} line-clamp-2 p-0 leading-snug wrap-anywhere`}
          >
            <Link
              href={ROUTES.PROJECT_DETAIL(project.slug)}
              className="block rounded-sm transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
            >
              {project.title}
            </Link>
          </CardTitle>
          {project.description.trim() ? (
            <CardDescription
              className={`${featured ? "line-clamp-4" : "line-clamp-3"} p-0 leading-relaxed text-foreground-secondary wrap-anywhere`}
            >
              {project.description.trim()}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex min-h-10 flex-wrap items-center gap-1.5 px-5 pb-4 pt-0 sm:px-6">
          {displayedTech.map((technology) => (
            <Badge
              key={technology}
              variant="outline"
              className="max-w-full bg-surface text-[10px] text-foreground-secondary"
            >
              <span className="truncate">{technology}</span>
            </Badge>
          ))}
          {remainingTech > 0 ? (
            <Badge
              variant="outline"
              aria-label={`${remainingTech} more technologies`}
              className="bg-surface text-[10px] text-foreground-secondary"
            >
              +{remainingTech}
            </Badge>
          ) : null}
        </CardContent>
        <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-2 px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-1">
            {githubUrl ? (
              <Button asChild size="sm" variant="ghost">
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.title} source code on GitHub`}
                >
                  <Code2 className="size-4" aria-hidden="true" /> Code
                </a>
              </Button>
            ) : null}
            {liveUrl ? (
              <Button asChild size="sm" variant="ghost">
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open live demo for ${project.title}`}
                >
                  <ExternalLink className="size-4" aria-hidden="true" /> Demo
                </a>
              </Button>
            ) : null}
          </div>
          <Link
            href={ROUTES.PROJECT_DETAIL(project.slug)}
            aria-label={`View details for ${project.title}`}
            className="ml-auto inline-flex min-h-11 items-center gap-1 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
          >
            Details <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
