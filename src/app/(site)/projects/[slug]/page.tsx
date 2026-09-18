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

type Props = { params: Promise<{ slug: string }> };

const brandImage = "/logo/logo_shanverse.png";

function siteUrl() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
    return ["http:", "https:"].includes(url.protocol)
      ? url.origin
      : "http://localhost:3000";
  } catch {
    return "http://localhost:3000";
  }
}

function canonicalUrl(slug: string) {
  return new URL(`/projects/${encodeURIComponent(slug)}`, siteUrl()).toString();
}

function metadataImage(value: string | null) {
  if (!value) return new URL(brandImage, siteUrl()).toString();
  try {
    const url = new URL(value, siteUrl());
    const privateHost = ["notion.so", "notion.site", "notion-static.com", "amazonaws.com"].some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    );
    return privateHost || url.searchParams.has("X-Amz-Credential")
      ? new URL(brandImage, siteUrl()).toString()
      : url.toString();
  } catch {
    return new URL(brandImage, siteUrl()).toString();
  }
}

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
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
    const image = metadataImage(project.coverImage ?? project.thumbnailImage);
    return {
      title: `${project.title} | Shanverse`,
      description,
      alternates: { canonical: canonicalUrl(project.slug) },
      keywords: [...new Set([...project.techStack, ...project.tags])],
      openGraph: {
        type: "website",
        url: canonicalUrl(project.slug),
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

  return (
    <article className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        <header className="mx-auto max-w-5xl space-y-6">
          <Breadcrumb
            items={[
              { label: "Home", href: ROUTES.HOME },
              { label: "Projects", href: ROUTES.PROJECTS },
              { label: project.title },
            ]}
          />
          <Link href={ROUTES.PROJECTS} className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">
            <ArrowLeft aria-hidden="true" className="size-4" /> Quay lại Projects
          </Link>

          <div className="space-y-6">
            {project.featured ? (
              <Badge className="bg-primary/10 text-primary">
                <Sparkles aria-hidden="true" className="mr-1 size-3.5" /> Featured
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
              <div aria-label="Tech Stack" className="flex flex-wrap gap-2">
                {project.techStack.map((technology) => (
                  <Badge key={technology} variant="outline" className="bg-surface">
                    {technology}
                  </Badge>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-border py-4 text-sm text-foreground-secondary">
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4" /> Created <time dateTime={project.createdAt}>{formatDate(project.createdAt)}</time>
              </span>
              {!sameDay(project.createdAt, project.updatedAt) ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw aria-hidden="true" className="size-4" /> Updated <time dateTime={project.updatedAt}>{formatDate(project.updatedAt)}</time>
                </span>
              ) : null}
            </div>
            {(liveUrl || githubUrl) && (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {liveUrl ? (
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Xem Live Demo của ${project.title}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    <ExternalLink aria-hidden="true" className="size-4" /> Xem Live Demo
                  </a>
                ) : null}
                {githubUrl ? (
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`Xem mã nguồn của ${project.title}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">
                    <Code2 aria-hidden="true" className="size-4" /> Xem mã nguồn
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </header>

        <figure className="relative mx-auto aspect-[16/8] max-w-6xl overflow-hidden rounded-3xl border border-border bg-surface">
          <Image src={cover} alt={`Cover image for ${project.title}`} fill priority unoptimized sizes="(min-width: 1280px) 1152px, 100vw" className="object-cover" />
        </figure>

        {toc.length >= 2 ? (
          <details className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-5 lg:hidden">
            <summary className="cursor-pointer font-semibold">Table of contents</summary>
            <nav aria-label="Table of contents" className="mt-4"><TocList items={toc} /></nav>
          </details>
        ) : null}

        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,800px)_260px]">
          <main className="min-w-0 space-y-8">
            <section aria-labelledby="overview-heading" className="rounded-2xl border border-border bg-surface p-6">
              <h2 id="overview-heading" className="flex items-center gap-2 text-xl font-semibold">
                <FolderKanban aria-hidden="true" className="size-5 text-primary" /> Project overview
              </h2>
              <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
                {project.role ? <MetadataItem label="Role" value={project.role} /> : null}
                {project.timeline ? <MetadataItem label="Timeline" value={project.timeline} /> : null}
                {project.status ? <MetadataItem label="Status" value={project.status} /> : null}
                <MetadataItem label="Created" value={formatDate(project.createdAt)} />
                <MetadataItem label="Last updated" value={formatDate(project.updatedAt)} />
              </dl>
            </section>

            {blocks.length ? (
              <NotionRenderer blocks={blocks} headingIds={headingIds} articleTitle={project.title} />
            ) : (
              <section className="rounded-2xl border border-dashed border-border bg-surface p-6 text-foreground-secondary">
                <h2 className="font-semibold text-foreground">Case study đang được cập nhật</h2>
                <p className="mt-2">Nội dung kỹ thuật chi tiết của dự án sẽ sớm được bổ sung.</p>
              </section>
            )}
          </main>

          <aside className="space-y-5 lg:sticky lg:top-24">
            {toc.length >= 2 ? (
              <div className="hidden rounded-2xl border border-border bg-surface p-5 lg:block">
                <p className="mb-4 font-semibold">On this page</p>
                <nav aria-label="Table of contents"><TocList items={toc} /></nav>
              </div>
            ) : null}
            {project.tags.length ? (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="flex items-center gap-2 font-semibold"><Tags aria-hidden="true" className="size-4 text-primary" /> Tags</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        {relatedProjects.length ? (
          <section aria-labelledby="related-projects-heading" className="mx-auto max-w-6xl space-y-6 border-t border-border pt-10">
            <div><p className="text-sm font-medium text-primary">Explore more</p><h2 id="related-projects-heading" className="text-2xl font-semibold tracking-tight">Related Projects</h2></div>
            <div className="grid gap-6 md:grid-cols-3">{relatedProjects.map((related) => <ProjectCard key={related.id} project={related} />)}</div>
          </section>
        ) : null}

        <section className="mx-auto max-w-6xl rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-surface to-background px-6 py-10 text-center sm:px-10 sm:py-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Bạn có một ý tưởng muốn cùng xây dựng?</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-foreground-secondary">Mình luôn sẵn sàng trao đổi về sản phẩm, công nghệ và những cơ hội hợp tác thú vị.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={ROUTES.CONTACT} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary">Liên hệ với mình <ArrowRight aria-hidden="true" className="size-4" /></Link>
            <Link href={ROUTES.PROJECTS} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft aria-hidden="true" className="size-4" /> Quay lại Projects</Link>
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
