import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Code2,
  ExternalLink,
  Sparkles,
  Tags,
} from "lucide-react";

import { NotionRenderer } from "@/components/common/notion/renderer";
import { createTableOfContents } from "@/components/common/notion/table-of-contents";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Badge from "@/components/ui/badge";
import { ProjectCard } from "@/features/home/common/ProjectCard";
import { splitCaseStudy } from "@/features/projects/case-study";
import { ProjectActionBar } from "@/features/projects/components/ProjectActionBar";
import { CaseStudyView } from "@/features/projects/components/CaseStudyView";
import {
  getProjectDetail,
  getAdjacentProjects,
  getRelatedProjects,
} from "@/features/projects/project-detail-data";
import { ROUTES } from "@/constants/routes";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildAbsoluteUrl, safeMetadataImage, SEO_CONFIG } from "@/config/seo.config";
import { formatDate } from "@/i18n/format";
import { getTranslator } from "@/i18n/server";

type Props = { params: Promise<{ slug: string }> };

const brandImage = "/logo/logo_shanverse.png";

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { locale, t } = await getTranslator();
  try {
    const project = await getProjectDetail(slug);
    if (!project) {
      return {
        title: t("metadata.projectNotFound"),
        robots: { index: false, follow: false },
      };
    }
    const description =
      project.description || t("metadata.projectCaseStudy", { title: project.title });
    const canonical = buildAbsoluteUrl(`/${locale}/projects/${encodeURIComponent(project.slug)}`);
    const image = safeMetadataImage(project.coverImage ?? project.thumbnailImage);
    return {
      title: { absolute: `${project.title} | Shanverse` },
      description,
      alternates: { canonical, languages: { vi: buildAbsoluteUrl(`/vi/projects/${encodeURIComponent(project.slug)}`), en: buildAbsoluteUrl(`/en/projects/${encodeURIComponent(project.slug)}`), "x-default": buildAbsoluteUrl(`/vi/projects/${encodeURIComponent(project.slug)}`) } },
      keywords: [...new Set([...project.techStack, ...project.tags])],
      openGraph: {
        type: "website",
        url: canonical, siteName: SEO_CONFIG.siteName, locale: locale === "vi" ? "vi_VN" : "en_US",
        title: project.title,
        description,
        images: [{ url: image, alt: project.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: t("metadata.projectFallbackTitle"),
      description: t("metadata.projectFallbackDescription"),
      robots: { index: false, follow: false },
    };
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectDetail(slug);
  if (!project) notFound();

  const blocks = project.contentBlocks ?? [];
  const { items: toc, headingIds } = createTableOfContents(blocks);
  const caseStudy = splitCaseStudy(blocks);
  const relatedProjects = await getRelatedProjects(project).catch(() => []);
  const { previous, next } = await getAdjacentProjects(project).catch(() => ({ previous: null, next: null }));
  const cover = project.coverImage ?? project.thumbnailImage ?? brandImage;
  const githubUrl = safeExternalUrl(project.githubUrl);
  const liveUrl = safeExternalUrl(project.liveUrl);
  const { locale, t } = await getTranslator();
  const displayDate = (value: string) => formatDate(value, locale) || t("common.unknownDate");
  const canonical = buildAbsoluteUrl(`/${locale}/projects/${encodeURIComponent(project.slug)}`);

  return (
    <article className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        <JsonLd data={[{ "@context": "https://schema.org", "@type": "SoftwareSourceCode", name: project.title, description: project.description, image: safeMetadataImage(project.coverImage ?? project.thumbnailImage), dateCreated: project.createdAt, dateModified: project.updatedAt, author: { "@type": "Person", name: SEO_CONFIG.author }, url: canonical, codeRepository: githubUrl ?? undefined, runtimePlatform: project.techStack.join(", "), keywords: [...project.techStack, ...project.tags].join(", ") }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: buildAbsoluteUrl(`/${locale}`) }, { "@type": "ListItem", position: 2, name: "Projects", item: buildAbsoluteUrl(`/${locale}/projects`) }, { "@type": "ListItem", position: 3, name: project.title, item: canonical }] }]} />
        <header className="mx-auto max-w-5xl space-y-6">
          <Breadcrumb
            items={[
              { label: t("common.home"), href: ROUTES.HOME },
              { label: t("common.projects"), href: ROUTES.PROJECTS },
              { label: project.title },
            ]}
          />
          <Link href={ROUTES.PROJECTS} className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">
            <ArrowLeft aria-hidden="true" className="size-4" /> {t("projects.back")}
          </Link>

          <div className="space-y-6">
            {project.featured ? (
              <Badge className="bg-primary/10 text-primary">
                <Sparkles aria-hidden="true" className="mr-1 size-3.5" /> {t("projects.featured")}
              </Badge>
            ) : null}
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {project.title}
            </h1>
            {project.description ? (
              <p className="max-w-3xl text-pretty text-lg leading-8 text-foreground-secondary">
                {project.description}
              </p>
            ) : null}
            {(liveUrl || githubUrl) && (
              <div id="project-actions" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {liveUrl ? (
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" aria-label={t("projects.liveDemoOf", { title: project.title })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    <ExternalLink aria-hidden="true" className="size-4" /> {t("projects.viewLiveDemo")}
                  </a>
                ) : null}
                {githubUrl ? (
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label={t("projects.sourceOnGitHub", { title: project.title })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">
                    <Code2 aria-hidden="true" className="size-4" /> {t("projects.viewSource")}
                  </a>
                ) : null}
              </div>
            )}
            {project.techStack.length ? (
              <div aria-label={t("projects.techStack")} className="flex flex-wrap gap-2">
                {project.techStack.map((technology) => (
                  <Badge key={technology} variant="outline" className="bg-surface">
                    {technology}
                  </Badge>
                ))}
              </div>
            ) : null}
            {project.date || project.role || project.timeline || project.status ? (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-border py-4 text-sm text-foreground-secondary">
                {project.date ? (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays aria-hidden="true" className="size-4" /> <span className="sr-only">{t("projects.projectDateLabel")}</span> <time dateTime={project.date}>{displayDate(project.date)}</time>
                  </span>
                ) : null}
                {project.role ? <span><span className="font-medium text-foreground">{t("projects.role")}:</span> {project.role}</span> : null}
                {project.timeline ? <span><span className="font-medium text-foreground">{t("projects.timeline")}:</span> {project.timeline}</span> : null}
                {project.status ? <span><span className="font-medium text-foreground">{t("projects.status")}:</span> {project.status}</span> : null}
              </div>
            ) : null}
          </div>
        </header>

        <figure className="relative mx-auto aspect-[16/8] max-w-6xl overflow-hidden rounded-3xl border border-border bg-surface">
          <Image src={cover} alt={t("projects.coverAlt", { title: project.title })} fill priority unoptimized={!cover.startsWith("/")} sizes="(min-width: 1280px) 1152px, 100vw" className="object-cover" />
        </figure>

        {project.highlights.length ? (
          <dl aria-label={t("projects.highlightsLabel")} className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-4">
            {project.highlights.map((highlight) => (
              <div key={highlight.label} className="rounded-card border border-border bg-surface p-4 text-center sm:p-5">
                <dd className="text-2xl font-extrabold text-primary sm:text-3xl">{highlight.value}</dd>
                <dt className="mt-1 text-xs text-foreground-secondary sm:text-sm">{highlight.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}

        {toc.length >= 2 ? (
          <details className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-5 lg:hidden">
            <summary className="cursor-pointer font-semibold">{t("blog.toc")}</summary>
            <nav aria-label={t("blog.toc")} className="mt-4"><TocList items={toc} /></nav>
          </details>
        ) : null}

        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,800px)_260px]">
          <main className="min-w-0 space-y-8">
            {blocks.length ? (
              caseStudy ? (
                <CaseStudyView study={caseStudy} headingIds={headingIds} title={project.title} />
              ) : (
                <NotionRenderer blocks={blocks} headingIds={headingIds} articleTitle={project.title} galleries />
              )
            ) : (
              <section className="rounded-2xl border border-dashed border-border bg-surface p-6 text-foreground-secondary">
                <h2 className="font-semibold text-foreground">{t("projects.caseStudyPendingTitle")}</h2>
                <p className="mt-2">{t("projects.caseStudyPendingDescription")}</p>
              </section>
            )}
          </main>

          <aside className="space-y-5 lg:sticky lg:top-24">
            {toc.length >= 2 ? (
              <div className="hidden rounded-2xl border border-border bg-surface p-5 lg:block">
                <p className="mb-4 font-semibold">{t("blog.onThisPage")}</p>
                <nav aria-label={t("blog.toc")}><TocList items={toc} /></nav>
              </div>
            ) : null}
            {project.tags.length ? (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="flex items-center gap-2 font-semibold"><Tags aria-hidden="true" className="size-4 text-primary" /> {t("blog.tags")}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        {previous || next ? (
          <nav aria-label={t("projects.adjacentLabel")} className="mx-auto grid max-w-6xl gap-4 border-t border-border pt-8 sm:grid-cols-2">
            {previous ? (
              <Link href={ROUTES.PROJECT_DETAIL(previous.slug)} rel="prev" className="group flex min-h-16 min-w-0 flex-col gap-1 rounded-card border border-border bg-surface p-4 transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary">
                <span className="text-xs font-medium text-muted">&larr; {t("projects.previousProject")}</span>
                <span className="line-clamp-2 font-semibold group-hover:text-primary">{previous.title}</span>
              </Link>
            ) : <span aria-hidden="true" className="hidden sm:block" />}
            {next ? (
              <Link href={ROUTES.PROJECT_DETAIL(next.slug)} rel="next" className="group flex min-h-16 min-w-0 flex-col gap-1 rounded-card border border-border bg-surface p-4 text-left transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary sm:text-right">
                <span className="text-xs font-medium text-muted">{t("projects.nextProject")} &rarr;</span>
                <span className="line-clamp-2 font-semibold group-hover:text-primary">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}

        {relatedProjects.length ? (
          <section aria-labelledby="related-projects-heading" className="mx-auto max-w-6xl space-y-6 border-t border-border pt-10">
            <div><p className="text-sm font-medium text-primary">{t("projects.exploreMore")}</p><h2 id="related-projects-heading" className="text-2xl font-semibold tracking-tight">{t("projects.related")}</h2></div>
            <div className="grid gap-6 md:grid-cols-3">{relatedProjects.map((related) => <ProjectCard key={related.id} project={related} />)}</div>
          </section>
        ) : null}

        <section className="mx-auto max-w-6xl rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-surface to-background px-6 py-10 text-center sm:px-10 sm:py-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("projects.ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-foreground-secondary">{t("projects.ctaDescription")}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={ROUTES.CONTACT} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary">{t("common.contactMe")} <ArrowRight aria-hidden="true" className="size-4" /></Link>
            <Link href={ROUTES.PROJECTS} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft aria-hidden="true" className="size-4" /> {t("projects.back")}</Link>
          </div>
        </section>
        {liveUrl || githubUrl ? (
          <ProjectActionBar
            targetId="project-actions"
            liveUrl={liveUrl}
            githubUrl={githubUrl}
            liveLabel={t("projects.viewLiveDemo")}
            sourceLabel={t("projects.viewSource")}
            groupLabel={t("projects.quickLinks", { title: project.title })}
          />
        ) : null}
    </article>
  );
}

function TocList({ items }: { items: ReturnType<typeof createTableOfContents>["items"] }) {
  return <ol className="space-y-2 text-sm">{items.map((item) => <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}><a href={`#${item.id}`} className="block rounded-sm py-1 text-foreground-secondary transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">{item.text}</a></li>)}</ol>;
}
