"use client";

import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import Image from "next/image";

import Badge from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { formatMonthYear } from "@/i18n/format";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { safeImageSource } from "@/lib/notion-media";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  variant?: "default" | "featured";
}

const PLACEHOLDER_IMAGE = "/logo/logo_shanverse_horizontal.png";

export function ProjectCard({
  project,
  variant = "default",
}: ProjectCardProps) {
  const { locale, t } = useI18n();
  const thumbnailImage =
    safeImageSource(project.thumbnailImage) ??
    safeImageSource(project.coverImage) ??
    PLACEHOLDER_IMAGE;
  const isPlaceholder = thumbnailImage === PLACEHOLDER_IMAGE;
  const technologies = [
    ...new Set(project.techStack.map((item) => item.trim()).filter(Boolean)),
  ];
  const displayedTech = technologies.slice(0, 3);
  const remainingTech = technologies.length - displayedTech.length;
  const hasProjectDate = Boolean(project.date);
  const dateValue = project.date || project.updatedAt || project.createdAt;
  const date = formatMonthYear(dateValue, locale);
  const featured = variant === "featured";
  const cardText = project.summary?.trim() || project.description.trim();

  return (
    <Card
      role="article"
      aria-label={project.title}
      className={cn(
        "brand-card-border group relative flex h-full min-w-0 flex-col overflow-hidden",
        featured && "md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
      )}
    >
      <div
        className={cn(
          "relative aspect-[2/1] overflow-hidden border-b border-border bg-surface sm:aspect-video",
          featured && "md:aspect-auto md:min-h-80 md:border-b-0 md:border-r",
        )}
      >
        <Image
          src={thumbnailImage}
          alt={t("projects.thumbnailAlt", { title: project.title })}
          className={cn(
            isPlaceholder ? "object-contain p-[12%]" : "object-cover",
          )}
          fill
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 55vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <CardHeader className="flex flex-1 flex-col gap-3 border-b-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {project.status ? (
              <Badge variant="outline" className="bg-surface">{project.status}</Badge>
            ) : null}
            {featured && project.featured ? (
              <Badge className="gap-1 bg-primary/10 text-primary">
                {t("projects.featured")}
              </Badge>
            ) : null}
            {date ? (
              <span className="text-xs text-muted">
                {hasProjectDate ? null : <>{t("common.updatedLabel")}{" "}</>}
                <time dateTime={dateValue}>{date}</time>
              </span>
            ) : null}
          </div>
          <CardTitle
            className={`${featured ? "text-2xl" : "text-xl"} line-clamp-2 p-0 leading-snug wrap-anywhere`}
          >
            {/* The title link covers the whole card, so the card opens the project page. */}
            <Link
              href={ROUTES.PROJECT_DETAIL(project.slug)}
              aria-label={t("projects.viewProject", { title: project.title })}
              className="rounded-sm transition-colors after:absolute after:inset-0 after:rounded-card group-hover:text-primary focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
            >
              {project.title}
            </Link>
          </CardTitle>
          {cardText ? (
            <CardDescription
              className={`${featured ? "line-clamp-3 sm:line-clamp-4" : "line-clamp-2 sm:line-clamp-3"} p-0 leading-relaxed text-foreground-secondary wrap-anywhere`}
            >
              {cardText}
            </CardDescription>
          ) : null}
        </CardHeader>
        {displayedTech.length ? (
          <CardContent className="flex flex-wrap items-center gap-1.5 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
            {displayedTech.map((technology) => (
              <Badge
                key={technology}
                variant="outline"
                className="max-w-full bg-surface text-foreground-secondary"
              >
                <span className="truncate">{technology}</span>
              </Badge>
            ))}
            {remainingTech > 0 ? (
              <Badge
                variant="outline"
                aria-label={t("projects.moreTechnologies", { count: remainingTech })}
                className="bg-surface text-foreground-secondary"
              >
                +{remainingTech}
              </Badge>
            ) : null}
          </CardContent>
        ) : null}
      </div>
    </Card>
  );
}
