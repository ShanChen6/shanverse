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
  FolderKanban,
  RefreshCw,
  Sparkles,
  Tags,
} from "lucide-react";

import { NotionRenderer } from "@/components/common/notion/renderer";
import { createTableOfContents } from "@/components/common/notion/table-of-contents";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Badge from "@/components/ui/badge";
import { ProjectCard } from "@/features/home/common/ProjectCard";
import {
  getProjectDetail,
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


function sameDay(first: string, second: string) {
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
  const { locale } = await getTranslator();
  try {
    const project = await getProjectDetail(slug);
    if (!project) {
      return {
        title: "Project not found | Shanverse",
        robots: { index: false, follow: false },
      };
    }
    const description =
      project.description || `Technical case study for ${project.title}.`;
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
      title: "Project | Shanverse",
      description: "Technical projects and case studies by Shan.",
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
  const relatedProjects = await getRelatedProjects(project).catch(() => []);
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
            {project.techStack.length ? (
              <div aria-label={t("projects.techStack")} className="flex flex-wrap gap-2">
                {project.techStack.map((technology) => (
                  <Badge key={technology} variant="outline" className="bg-surface">
                    {technology}
                  </Badge>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-border py-4 text-sm text-foreground-secondary">
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4" /> {t("common.createdLabel")} <time dateTime={project.createdAt}>{displayDate(project.createdAt)}</time>
              </span>
              {!sameDay(project.createdAt, project.updatedAt) ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw aria-hidden="true" className="size-4" /> {t("common.updatedLabel")} <time dateTime={project.updatedAt}>{displayDate(project.updatedAt)}</time>
                </span>
              ) : null}
            </div>
            {(liveUrl || githubUrl) && (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {liveUrl ? (
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" aria-label={t("projects.liveDemoOf", { title: project.title })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
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
          </div>
        </header>

        <figure className="relative mx-auto aspect-[16/8] max-w-6xl overflow-hidden rounded-3xl border border-border bg-surface">
          <Image src={cover} alt={t("projects.coverAlt", { title: project.title })} fill priority unoptimized sizes="(min-width: 1280px) 1152px, 100vw" className="object-cover" />
        </figure>

        {toc.length >= 2 ? (
          <details className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-5 lg:hidden">
            <summary className="cursor-pointer font-semibold">{t("blog.toc")}</summary>
            <nav aria-label={t("blog.toc")} className="mt-4"><TocList items={toc} /></nav>
          </details>
        ) : null}

        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,800px)_260px]">
          <main className="min-w-0 space-y-8">
            <section aria-labelledby="overview-heading" className="rounded-2xl border border-border bg-surface p-6">
              <h2 id="overview-heading" className="flex items-center gap-2 text-xl font-semibold">
                <FolderKanban aria-hidden="true" className="size-5 text-primary" /> {t("projects.overview")}
              </h2>
              <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
                {project.role ? <MetadataItem label={t("projects.role")} value={project.role} /> : null}
                {project.timeline ? <MetadataItem label={t("projects.timeline")} value={project.timeline} /> : null}
                {project.status ? <MetadataItem label={t("projects.status")} value={project.status} /> : null}
                <MetadataItem label={t("projects.createdLabel")} value={displayDate(project.createdAt)} />
                <MetadataItem label={t("projects.lastUpdated")} value={displayDate(project.updatedAt)} />
              </dl>
            </section>

            {blocks.length ? (
              <NotionRenderer blocks={blocks} headingIds={headingIds} articleTitle={project.title} />
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
            <Link href={ROUTES.CONTACT} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary">{t("projects.ctaContact")} <ArrowRight aria-hidden="true" className="size-4" /></Link>
            <Link href={ROUTES.PROJECTS} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft aria-hidden="true" className="size-4" /> {t("projects.back")}</Link>
          </div>
        </section>
    </article>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-medium text-muted">{label}</dt><dd className="mt-1 break-words font-semibold text-foreground">{value}</dd></div>;
}

function TocList({ items }: { items: ReturnType<typeof createTableOfContents>["items"] }) {
  return <ol className="space-y-2 text-sm">{items.map((item) => <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}><a href={`#${item.id}`} className="block rounded-sm py-1 text-foreground-secondary transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">{item.text}</a></li>)}</ol>;
}
