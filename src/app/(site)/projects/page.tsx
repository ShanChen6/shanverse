import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import * as React from "react";
import { Suspense } from "react";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Code2, Layers3, Search, Sparkles, Tags, X } from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination, paginationLabels } from "@/components/layout/pagination";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { ProjectCard } from "@/features/home/common/ProjectCard";
import { getProjectData } from "@/features/projects/project-data";
import { filterProjects, parseProjectQuery, PROJECTS_PER_PAGE, projectHref, type ProjectSearchParams, uniqueNames } from "@/features/projects/project-query";
import { cn } from "@/lib/cn";
import { localizeHref } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import { ProjectsDataSkeleton } from "@/components/common/PageSkeletons";
import { buildPageMetadata } from "@/config/seo.config";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({ locale, path: "/projects", title: t("metadata.projectsTitle"), description: t("projects.description"), keywords: ["software projects", "web development", "case studies"] });
}

const filterClass = "inline-flex min-w-0 items-center rounded-full border px-3.5 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const textLinkClass = "rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary";

async function ProjectsDataSection({ query }: { query: ReturnType<typeof parseProjectQuery> }) {
  const { locale, t } = await getTranslator();
  const data = await getProjectData();
  const technologies = uniqueNames(data.projects.flatMap((project) => project.techStack));
  const tags = uniqueNames(data.projects.flatMap((project) => project.tags));
  const filteredProjects = filterProjects(data.projects, query);
  const featuredProject = filteredProjects.find((project) => project.featured);
  const gridProjects = featuredProject ? filteredProjects.filter((project) => project.id !== featuredProject.id) : filteredProjects;
  const totalPages = Math.max(1, Math.ceil(gridProjects.length / PROJECTS_PER_PAGE));
  const currentPage = Math.min(query.page, totalPages);
  const pageProjects = gridProjects.slice((currentPage - 1) * PROJECTS_PER_PAGE, currentPage * PROJECTS_PER_PAGE);
  const hasFilters = Boolean(query.q || query.tech || query.tag);

  return (
    <>
        {!data.hasError && (
          <dl aria-label={t("projects.statsLabel")} className="grid gap-3 sm:grid-cols-3">
            {[
              [String(data.projects.length), t("projects.statsPublished")],
              [String(technologies.length), t("projects.statsTechnologies")],
              [String(data.projects.filter((project) => project.featured).length), t("projects.statsFeatured")],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-border bg-surface p-5">
                <dd className="text-3xl font-bold text-primary">{value}</dd>
                <dt className="mt-1 text-sm text-foreground-secondary">{label}</dt>
              </div>
            ))}
          </dl>
        )}

        <section aria-label={t("projects.searchSection")} className="space-y-6">
          <form action={localizeHref(ROUTES.PROJECTS, locale)} method="get" role="search" className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="project-search" className="sr-only">{t("projects.searchLabel")}</label>
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-3.5 size-5 text-muted" />
              <Input key={query.q} id="project-search" name="q" type="search" defaultValue={query.q} placeholder={t("projects.searchPlaceholder")} className="h-12 pl-12" />
            </div>
            {query.tech && <input type="hidden" name="tech" value={query.tech} />}
            {query.tag && <input type="hidden" name="tag" value={query.tag} />}
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-6 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary">{t("blog.searchButton")} <ArrowUpRight aria-hidden="true" className="size-4" /></button>
          </form>

          <div className="space-y-3">
            <p id="tech-filter-label" className="flex items-center gap-2 text-sm font-semibold"><Code2 aria-hidden="true" className="size-4 text-primary" /> {t("projects.techStack")}</p>
            <nav aria-labelledby="tech-filter-label" className="flex flex-wrap gap-2">
              <Link href={projectHref(query, { tech: "", page: 1 })} aria-current={!query.tech ? "true" : undefined} className={cn(filterClass, !query.tech ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-surface text-foreground-secondary hover:border-primary/40 hover:text-primary")}>{t("common.all")}</Link>
              {technologies.map((technology) => {
                const active = query.tech.toLowerCase() === technology.toLowerCase();
                return <Link key={technology} href={projectHref(query, { tech: active ? "" : technology, page: 1 })} aria-current={active ? "true" : undefined} className={cn(filterClass, active ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-surface text-foreground-secondary hover:border-primary/40 hover:text-primary")}><span className="break-words [overflow-wrap:anywhere]">{technology}</span></Link>;
              })}
            </nav>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-foreground-secondary">{t("projects.filters")}</span>
              {(["q", "tech", "tag"] as const).filter((key) => query[key]).map((key) => (
                <Link key={key} href={projectHref(query, { [key]: "", page: 1 })} aria-label={t("projects.removeFilter", { value: `${key}: ${query[key]}` })} className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary"><span className="break-words [overflow-wrap:anywhere]">{query[key]}</span><X aria-hidden="true" className="size-3.5" /></Link>
              ))}
              <Link href={ROUTES.PROJECTS} className={textLinkClass}>{t("common.clearAll")}</Link>
            </div>
          )}
        </section>

        {data.hasError ? (
          <section role="status" className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <BriefcaseBusiness aria-hidden="true" className="mx-auto mb-4 size-10 text-primary" />
            <h2 className="text-2xl font-semibold">{t("projects.loadErrorTitle")}</h2>
            <p className="mx-auto mb-6 mt-3 max-w-lg text-foreground-secondary">{t("errors.dataUnavailable")}</p>
            <Link href={projectHref(query)} className={textLinkClass}>{t("common.retry")}</Link>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
              <p role="status" className="text-sm text-foreground-secondary">{t(filteredProjects.length === 1 ? "projects.foundOne" : "projects.foundOther", { count: filteredProjects.length })}</p>
              {filteredProjects.length > 0 && <p className="text-xs text-muted">{t("blog.newest")} · {t("blog.pageOf", { page: currentPage, total: totalPages })}</p>}
            </div>

            {featuredProject && currentPage === 1 && (
              <section aria-labelledby="featured-project-heading" className="space-y-5">
                <h2 id="featured-project-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-tight"><Sparkles aria-hidden="true" className="size-5 text-primary" /> {t("projects.featured")}</h2>
                <ProjectCard project={featuredProject} variant="featured" />
              </section>
            )}

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
              <div className="min-w-0 space-y-8">
                {filteredProjects.length === 0 ? (
                  <EmptyState
                    icon={<Layers3 className="size-10" />}
                    title={data.projects.length === 0 ? t("projects.emptyNoneTitle") : t("projects.emptyNoMatchTitle")}
                    description={data.projects.length === 0 ? t("projects.emptyNoneDescription") : t("projects.emptyNoMatchDescription")}
                    action={hasFilters ? <Link href={ROUTES.PROJECTS} className={textLinkClass}>{t("blog.clearFilters")}</Link> : undefined}
                  />
                ) : pageProjects.length > 0 ? (
                  <section aria-labelledby="project-grid-heading" className="space-y-5">
                    <h2 id="project-grid-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-tight"><Layers3 aria-hidden="true" className="size-5 text-primary" /> {t("projects.otherProjects")}</h2>
                    <div className="grid gap-6 sm:grid-cols-2">{pageProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
                  </section>
                ) : null}
                <Pagination currentPage={currentPage} totalPages={totalPages} hrefBuilder={(page) => projectHref(query, { page })} labels={paginationLabels(t)} className="justify-center border-t border-border pt-6" />
              </div>

              <aside aria-labelledby="project-tags-heading" className="min-w-0 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-24">
                <h2 id="project-tags-heading" className="flex items-center gap-2 text-lg font-semibold"><Tags aria-hidden="true" className="size-4 text-primary" /> {t("blog.tags")}</h2>
                <p className="mb-5 mt-2 text-sm leading-relaxed text-foreground-secondary">{t("projects.tagsDescription")}</p>
                {tags.length > 0 ? (
                  <nav aria-label={t("projects.filterByTag")} className="-m-1 flex max-h-96 flex-wrap gap-2 overflow-y-auto p-1">
                    {tags.map((tag) => {
                      const active = query.tag.toLowerCase() === tag.toLowerCase();
                      return <Link key={tag} href={projectHref(query, { tag: active ? "" : tag, page: 1 })} aria-current={active ? "true" : undefined} className={cn(filterClass, "px-3 py-1.5 text-xs", active ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary")}><span className="break-words [overflow-wrap:anywhere]">#{tag}</span></Link>;
                    })}
                  </nav>
                ) : <p className="text-sm text-muted">{t("projects.noTags")}</p>}
              </aside>
            </div>
          </>
        )}

    </>
  );
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<ProjectSearchParams> }) {
  const query = parseProjectQuery(await searchParams);
  const { t } = await getTranslator();
  return <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12 lg:space-y-12">
    <Breadcrumb items={[{ label: t("common.home"), href: ROUTES.HOME }, { label: t("common.projects") }]} />
    <header className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-background p-6 sm:p-10 lg:p-12"><div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-primary/10 sm:size-96" /><div className="relative max-w-3xl space-y-6"><p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-primary"><Sparkles aria-hidden="true" className="size-4" /> {t("home.featuredProjectsEyebrow")}</p><h1 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("projects.title")}</h1><p className="max-w-2xl text-pretty leading-relaxed text-foreground-secondary sm:text-lg">{t("projects.description")}</p></div></header>
    <Suspense fallback={<ProjectsDataSkeleton label={t("common.loadingProjects")} />}><ProjectsDataSection query={query} /></Suspense>
    <section className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-surface to-background px-6 py-10 text-center sm:px-10 sm:py-14"><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("projects.ctaTitle")}</h2><p className="mx-auto mt-3 max-w-2xl leading-relaxed text-foreground-secondary">{t("projects.ctaDescription")}</p><Link href={ROUTES.CONTACT} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">{t("common.contactMe")} <ArrowRight aria-hidden="true" className="size-4" /></Link></section>
  </div>;
}
