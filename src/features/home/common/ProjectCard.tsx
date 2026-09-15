import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Code2, ExternalLink } from "lucide-react";

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
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  variant?: "default" | "featured";
}

const PLACEHOLDER_IMAGE =
  "https://res.cloudinary.com/mvzqdllb/image/upload/v1788945427/s0x8c5x20xuuyqek2egk.png";

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
    : new Intl.DateTimeFormat("en-EN", {
        month: "short",
        year: "numeric",
      }).format(date);
}

export function ProjectCard({ project, variant = "default" }: ProjectCardProps) {
  const thumbnailImage = project.thumbnailImage ?? project.coverImage;
  const githubUrl = safeExternalUrl(project.githubUrl);
  const liveUrl = safeExternalUrl(project.liveUrl);
  const displayedTech = project.techStack.slice(0, 4);
  const remainingTech = project.techStack.length - displayedTech.length;
  const date = formatProjectDate(project);
  const featured = variant === "featured";

  return (
    <Card
      className={`group flex h-full min-w-0 flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 ${featured ? "md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : ""}`}
    >
      <div className={`relative overflow-hidden bg-linear-to-br from-primary/20 via-primary/10 to-transparent ${featured ? "min-h-64 md:min-h-full" : "aspect-[16/10]"}`}>
        <Image
          src={thumbnailImage ?? PLACEHOLDER_IMAGE}
          alt={`${project.title} project thumbnail`}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          fill
          sizes={featured ? "(max-width: 768px) 100vw, 55vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          unoptimized
        />
      </div>
      <div className="flex min-w-0 flex-col">
      <CardHeader className="flex flex-1 flex-col space-y-3 border-b-0 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {featured && (
            <Badge className="bg-primary/10 text-primary">Dự án nổi bật</Badge>
          )}
          {date && <time className="text-xs text-muted">Updated {date}</time>}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {displayedTech.map((technology) => (
              <Badge
                key={technology}
                variant="outline"
                className="max-w-full text-[10px]"
              >
                <span className="truncate">{technology}</span>
              </Badge>
            ))}
            {remainingTech > 0 && <Badge variant="outline" className="text-[10px]">+{remainingTech}</Badge>}
        </div>
        <CardTitle className={`${featured ? "text-2xl" : "text-lg"} line-clamp-2 p-0 leading-snug`}>
          <Link
            href={ROUTES.PROJECT_DETAIL(project.slug)}
            className="block rounded-sm transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
          >
            {project.title}
          </Link>
        </CardTitle>
        <CardDescription className={`${featured ? "line-clamp-4" : "line-clamp-3"} p-0 leading-relaxed`}>
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 px-5 pb-4 pt-0 sm:px-6">
        {githubUrl ? (
          <Button asChild size="sm" variant="ghost" className="max-w-full">
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} source code on GitHub`}>
              <Code2 className="h-4 w-4 mr-1" /> Code
            </a>
          </Button>
        ) : null}
        {liveUrl ? (
          <Button asChild size="sm" variant="outline">
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open live demo for ${project.title}`}>
              <ExternalLink className="h-4 w-4 mr-1" /> Live Demo
            </a>
          </Button>
        ) : null}
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-end px-5 py-4 sm:px-6">
        <Link href={ROUTES.PROJECT_DETAIL(project.slug)} className="inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">
          Xem chi tiết <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </CardFooter>
      </div>
    </Card>
  );
}
