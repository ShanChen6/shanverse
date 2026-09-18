import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import * as React from "react";
import { Suspense } from "react";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Code2, Layers3, Search, Sparkles, Tags, X } from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/layout/pagination";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { ProjectCard } from "@/features/home/common/ProjectCard";
import { getProjectData } from "@/features/projects/project-data";
import { filterProjects, parseProjectQuery, PROJECTS_PER_PAGE, projectHref, type ProjectSearchParams, uniqueNames } from "@/features/projects/project-query";
import { cn } from "@/lib/cn";
import { getTranslator } from "@/i18n/server";
import { ProjectsDataSkeleton } from "@/components/common/PageSkeletons";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return {
    title: t("metadata.projectsTitle"),
    description: t("projects.description"),
    alternates: { canonical: `/${locale}/projects`, languages: { vi: "/vi/projects", en: "/en/projects" } },
  };
}

const filterClass = "inline-flex min-w-0 items-center rounded-full border px-3.5 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const textLinkClass = "rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary";

async function ProjectsDataSection({ query }: { query: ReturnType<typeof parseProjectQuery> }) {
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
          <dl aria-label="Project statistics" className="grid gap-3 sm:grid-cols-3">
            {[
              [String(data.projects.length), "Dự án đã xuất bản"],
              [String(technologies.length), "Công nghệ"],
              [String(data.projects.filter((project) => project.featured).length), "Dự án nổi bật"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-border bg-surface p-5">
                <dd className="text-3xl font-bold text-primary">{value}</dd>
                <dt className="mt-1 text-sm text-foreground-secondary">{label}</dt>
              </div>
            ))}
          </dl>
        )}

        <section aria-label="Tìm kiếm và lọc dự án" className="space-y-6">
          <form action={ROUTES.PROJECTS} method="get" role="search" className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="project-search" className="sr-only">Tìm kiếm dự án</label>
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-3.5 size-5 text-muted" />
              <Input key={query.q} id="project-search" name="q" type="search" defaultValue={query.q} placeholder="Tìm theo dự án, công nghệ hoặc tag…" className="h-12 pl-12" />
            </div>
            {query.tech && <input type="hidden" name="tech" value={query.tech} />}
            {query.tag && <input type="hidden" name="tag" value={query.tag} />}
            <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-6 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary">Tìm kiếm <ArrowUpRight aria-hidden="true" className="size-4" /></button>
          </form>

          <div className="space-y-3">
            <p id="tech-filter-label" className="flex items-center gap-2 text-sm font-semibold"><Code2 aria-hidden="true" className="size-4 text-primary" /> Tech Stack</p>
            <nav aria-labelledby="tech-filter-label" className="flex flex-wrap gap-2">
              <Link href={projectHref(query, { tech: "", page: 1 })} aria-current={!query.tech ? "true" : undefined} className={cn(filterClass, !query.tech ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-surface text-foreground-secondary hover:border-primary/40 hover:text-primary")}>All</Link>
              {technologies.map((technology) => {
                const active = query.tech.toLowerCase() === technology.toLowerCase();
                return <Link key={technology} href={projectHref(query, { tech: active ? "" : technology, page: 1 })} aria-current={active ? "true" : undefined} className={cn(filterClass, active ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-surface text-foreground-secondary hover:border-primary/40 hover:text-primary")}><span className="break-words [overflow-wrap:anywhere]">{technology}</span></Link>;
              })}
            </nav>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-foreground-secondary">Bộ lọc:</span>
              {(["q", "tech", "tag"] as const).filter((key) => query[key]).map((key) => (
                <Link key={key} href={projectHref(query, { [key]: "", page: 1 })} aria-label={`Xóa bộ lọc ${key}: ${query[key]}`} className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary"><span className="break-words [overflow-wrap:anywhere]">{query[key]}</span><X aria-hidden="true" className="size-3.5" /></Link>
              ))}
              <Link href={ROUTES.PROJECTS} className={textLinkClass}>Xóa tất cả</Link>
            </div>
          )}
        </section>

        {data.hasError ? (
          <section role="status" className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <BriefcaseBusiness aria-hidden="true" className="mx-auto mb-4 size-10 text-primary" />
            <h2 className="text-2xl font-semibold">Chưa thể tải danh sách dự án</h2>
            <p className="mx-auto mb-6 mt-3 max-w-lg text-foreground-secondary">Kết nối dữ liệu đang tạm gián đoạn. Bạn có thể thử lại sau ít phút.</p>
            <Link href={projectHref(query)} className={textLinkClass}>Thử lại</Link>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
              <p role="status" className="text-sm text-foreground-secondary"><span className="font-semibold text-foreground">{filteredProjects.length}</span> dự án được tìm thấy</p>
              {filteredProjects.length > 0 && <p className="text-xs text-muted">Mới nhất trước · Trang {currentPage}/{totalPages}</p>}
            </div>

            {featuredProject && currentPage === 1 && (
              <section aria-labelledby="featured-project-heading" className="space-y-5">
                <h2 id="featured-project-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-tight"><Sparkles aria-hidden="true" className="size-5 text-primary" /> Featured Project</h2>
                <ProjectCard project={featuredProject} variant="featured" />
              </section>
            )}

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10">
              <div className="min-w-0 space-y-8">
                {filteredProjects.length === 0 ? (
                  <EmptyState
                    icon={<Layers3 className="size-10" />}
                    title={data.projects.length === 0 ? "Dự án mới đang được hoàn thiện" : "Không tìm thấy dự án phù hợp"}
                    description={data.projects.length === 0 ? "Hiện chưa có dự án nào được xuất bản. Hãy quay lại trong thời gian tới." : "Thử từ khóa khác hoặc xóa bộ lọc để xem thêm dự án."}
                    action={hasFilters ? <Link href={ROUTES.PROJECTS} className={textLinkClass}>Xóa bộ lọc</Link> : undefined}
                  />
                ) : pageProjects.length > 0 ? (
                  <section aria-labelledby="project-grid-heading" className="space-y-5">
                    <h2 id="project-grid-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-tight"><Layers3 aria-hidden="true" className="size-5 text-primary" /> Các dự án khác</h2>
                    <div className="grid gap-6 sm:grid-cols-2">{pageProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
                  </section>
                ) : null}
                <Pagination currentPage={currentPage} totalPages={totalPages} hrefBuilder={(page) => projectHref(query, { page })} className="justify-center border-t border-border pt-6" />
              </div>

              <aside aria-labelledby="project-tags-heading" className="min-w-0 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-24">
                <h2 id="project-tags-heading" className="flex items-center gap-2 text-lg font-semibold"><Tags aria-hidden="true" className="size-4 text-primary" /> Tags</h2>
                <p className="mb-5 mt-2 text-sm leading-relaxed text-foreground-secondary">Khám phá dự án theo chủ đề.</p>
                {tags.length > 0 ? (
                  <nav aria-label="Lọc dự án theo tag" className="-m-1 flex max-h-96 flex-wrap gap-2 overflow-y-auto p-1">
                    {tags.map((tag) => {
                      const active = query.tag.toLowerCase() === tag.toLowerCase();
                      return <Link key={tag} href={projectHref(query, { tag: active ? "" : tag, page: 1 })} aria-current={active ? "true" : undefined} className={cn(filterClass, "px-3 py-1.5 text-xs", active ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary")}><span className="break-words [overflow-wrap:anywhere]">#{tag}</span></Link>;
                    })}
                  </nav>
                ) : <p className="text-sm text-muted">Chưa có tag dự án.</p>}
              </aside>
            </div>
          </>
        )}

    </>
  );
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<ProjectSearchParams> }) {
  const query = parseProjectQuery(await searchParams);
  return <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12 lg:space-y-12">
    <Breadcrumb items={[{ label: "Home", href: ROUTES.HOME }, { label: "Projects" }]} />
    <header className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-background p-6 sm:p-10 lg:p-12"><div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-primary/10 sm:size-96" /><div className="relative max-w-3xl space-y-6"><p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-primary"><Sparkles aria-hidden="true" className="size-4" /> Selected work</p><h1 lang="vi" className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Những sản phẩm mình đã xây dựng.</h1><p lang="vi" className="max-w-2xl text-pretty leading-relaxed text-foreground-secondary sm:text-lg">Các dự án cá nhân, thử nghiệm kỹ thuật và sản phẩm được xây dựng trong quá trình học tập và phát triển.</p></div></header>
    <Suspense fallback={<ProjectsDataSkeleton />}><ProjectsDataSection query={query} /></Suspense>
    <section className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/10 via-surface to-background px-6 py-10 text-center sm:px-10 sm:py-14"><h2 lang="vi" className="text-2xl font-bold tracking-tight sm:text-3xl">Bạn có một ý tưởng muốn cùng xây dựng?</h2><p lang="vi" className="mx-auto mt-3 max-w-2xl leading-relaxed text-foreground-secondary">Mình luôn sẵn sàng trao đổi về sản phẩm, công nghệ và những cơ hội hợp tác thú vị.</p><Link href={ROUTES.CONTACT} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">Liên hệ với mình <ArrowRight aria-hidden="true" className="size-4" /></Link></section>
  </div>;
}
