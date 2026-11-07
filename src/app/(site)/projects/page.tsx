import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import * as React from "react";
import { Suspense } from "react";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Layers3, Search, Sparkles, X } from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { Tianwu, TianwuShip } from "@/components/mascot/Tianwu";
import { Pagination, paginationLabels } from "@/components/layout/pagination";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { ProjectCard } from "@/features/home/common/ProjectCard";
import { getProjectData } from "@/features/projects/project-data";
import { filterProjects, parseProjectQuery, PROJECTS_PER_PAGE, projectHref, showProjectTools, type ProjectSearchParams, uniqueNames } from "@/features/projects/project-query";
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
const activeClass = "border-primary/30 bg-primary/10 text-primary";
const idleClass = "border-border bg-surface text-foreground-secondary hover:border-primary/40 hover:text-primary";
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
  const statuses = uniqueNames(data.projects.map((project) => project.status ?? ""));
  const hasFilters = Boolean(query.q || query.tech || query.tag || query.status);
  const showTools = showProjectTools(data.projects.length, hasFilters);

  return (
    <>
        {!data.hasError && showTools && (
          <dl aria-label={t("projects.statsLabel")} className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              [String(data.projects.length), t("projects.statsPublished")],
              [String(technologies.length), t("projects.statsTechnologies")],
              [String(data.projects.filter((project) => project.featured).length), t("projects.statsFeatured")],
            ].map(([value, label]) => (
              <div key={label} className="rounded-card border border-border bg-surface p-3 sm:p-5">
                <dd className="text-2xl font-bold text-primary sm:text-3xl">{value}</dd>
                <dt className="mt-1 text-xs text-foreground-secondary sm:text-sm">{label}</dt>
              </div>
            ))}
          </dl>
        )}

        {showTools ? <section aria-label={t("projects.searchSection")} className="space-y-6">
          <form action={localizeHref(ROUTES.PROJECTS, locale)} method="get" role="search" className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="project-search" className="sr-only">{t("projects.searchLabel")}</label>
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-3.5 size-5 text-muted" />
              <Input key={query.q} id="project-search" name="q" type="search" defaultValue={query.q} placeholder={t("projects.searchPlaceholder")} className="h-12 pl-12" />
            </div>
            {query.tech && <input type="hidden" name="tech" value={query.tech} />}
            {query.tag && <input type="hidden" name="tag" value={query.tag} />}
            {query.status && <input type="hidden" name="status" value={query.status} />}
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-6 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary">{t("blog.searchButton")} <ArrowUpRight aria-hidden="true" className="size-4" /></button>
          </form>

          <nav aria-label={t("projects.filtersLabel")} className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            <Link href={projectHref(query, { tech: "", tag: "", status: "", page: 1 })} aria-current={!query.tech && !query.tag && !query.status ? "true" : undefined} className={cn(filterClass, "shrink-0", !query.tech && !query.tag && !query.status ? activeClass : idleClass)}>{t("common.all")}</Link>
            {[
              { key: "status" as const, label: t("projects.status"), values: statuses },
              { key: "tech" as const, label: t("projects.techStack"), values: technologies },
              { key: "tag" as const, label: t("blog.tags"), values: tags },
            ].filter((group) => group.values.length > 0).map((group) => (
              <React.Fragment key={group.key}>
                <span aria-hidden="true" className="ml-2 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">{group.label}</span>
                {group.values.map((value) => {
                  const active = query[group.key].toLowerCase() === value.toLowerCase();
                  return (
                    <Link key={`${group.key}-${value}`} href={projectHref(query, { [group.key]: active ? "" : value, page: 1 })} aria-current={active ? "true" : undefined} aria-label={`${group.label}: ${value}`} className={cn(filterClass, "shrink-0", active ? activeClass : idleClass)}>
                      <span className="whitespace-nowrap">{value}</span>
                    </Link>
                  );
                })}
              </React.Fragment>
            ))}
          </nav>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-foreground-secondary">{t("projects.filters")}</span>
              {(["q", "tech", "tag", "status"] as const).filter((key) => query[key]).map((key) => (
                <Link key={key} href={projectHref(query, { [key]: "", page: 1 })} aria-label={t("projects.removeFilter", { value: `${key}: ${query[key]}` })} className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary"><span className="break-words [overflow-wrap:anywhere]">{query[key]}</span><X aria-hidden="true" className="size-3.5" /></Link>
              ))}
              <Link href={ROUTES.PROJECTS} className={textLinkClass}>{t("common.clearAll")}</Link>
            </div>
          )}
        </section> : null}

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

            <div className="min-w-0">
              <div className="min-w-0 space-y-8">
                {filteredProjects.length === 0 ? (
                  <EmptyState
                    illustration={data.projects.length === 0 ? <TianwuShip className="h-auto w-full" /> : <Tianwu pose="determined" className="h-auto w-full" />}
                    note={data.projects.length === 0 ? t("mascot.emptyComing") : t("mascot.emptySearching")}
                    title={data.projects.length === 0 ? t("projects.emptyNoneTitle") : t("projects.emptyNoMatchTitle")}
                    description={data.projects.length === 0 ? t("projects.emptyNoneDescription") : t("projects.emptyNoMatchDescription")}
                    action={hasFilters ? <Link href={ROUTES.PROJECTS} className={textLinkClass}>{t("blog.clearFilters")}</Link> : undefined}
                  />
                ) : pageProjects.length > 0 ? (
                  <section aria-labelledby="project-grid-heading" className="space-y-5">
                    <h2 id="project-grid-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-tight"><Layers3 aria-hidden="true" className="size-5 text-primary" /> {t("projects.otherProjects")}</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{pageProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
                  </section>
                ) : null}
                <Pagination currentPage={currentPage} totalPages={totalPages} hrefBuilder={(page) => projectHref(query, { page })} labels={paginationLabels(t)} className="justify-center border-t border-border pt-6" />
              </div>
            </div>
          </>
        )}

    </>
  );
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<ProjectSearchParams> }) {
  const query = parseProjectQuery(await searchParams);
  const { t } = await getTranslator();
  return <PageContainer>
    <Breadcrumb items={[{ label: t("common.home"), href: ROUTES.HOME }, { label: t("common.projects") }]} />
    <PageHeader eyebrow={t("home.featuredProjectsEyebrow")} icon={<Sparkles />} title={t("projects.title")} description={t("projects.description")} />
    <Suspense fallback={<ProjectsDataSkeleton label={t("common.loadingProjects")} />}><ProjectsDataSection query={query} /></Suspense>
    <section className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-surface to-background px-6 py-10 text-center sm:px-10 sm:py-14"><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("projects.ctaTitle")}</h2><p className="mx-auto mt-3 max-w-2xl leading-relaxed text-foreground-secondary">{t("projects.ctaDescription")}</p><Link href={ROUTES.CONTACT} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">{t("common.contactMe")} <ArrowRight aria-hidden="true" className="size-4" /></Link></section>
  </PageContainer>;
}
