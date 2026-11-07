import type { Project } from "@/types/project";

export const PROJECTS_PER_PAGE = 6;

export type ProjectSearchParams = Record<string, string | string[] | undefined>;

export type ProjectQuery = {
  q: string;
  tech: string;
  tag: string;
  status: string;
  page: number;
};

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function parseProjectQuery(params: ProjectSearchParams): ProjectQuery {
  const page = Number.parseInt(firstValue(params.page) ?? "1", 10);

  return {
    q: (firstValue(params.q) ?? "").trim(),
    tech: (firstValue(params.tech) ?? "").trim(),
    tag: (firstValue(params.tag) ?? "").trim(),
    status: (firstValue(params.status) ?? "").trim(),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function projectHref(
  query: ProjectQuery,
  changes: Partial<ProjectQuery> = {},
) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.tech) params.set("tech", next.tech);
  if (next.tag) params.set("tag", next.tag);
  if (next.status) params.set("status", next.status);
  if (next.page > 1) params.set("page", String(next.page));

  const search = params.toString();
  return search ? `/projects?${search}` : "/projects";
}

export function filterProjects(projects: Project[], query: ProjectQuery) {
  const search = query.q.toLocaleLowerCase("en");
  const tech = query.tech.toLocaleLowerCase("en");
  const tag = query.tag.toLocaleLowerCase("en");
  const status = query.status.toLocaleLowerCase("en");

  return projects.filter((project) => {
    const matchesSearch =
      !search ||
      [
        project.title,
        project.description,
        project.summary ?? "",
        ...project.techStack,
        ...project.tags,
      ].some((value) => value.toLocaleLowerCase("en").includes(search));
    const matchesTech =
      !tech ||
      project.techStack.some(
        (value) => value.toLocaleLowerCase("en") === tech,
      );
    const matchesTag =
      !tag ||
      project.tags.some((value) => value.toLocaleLowerCase("en") === tag);

    const matchesStatus = !status || (project.status ?? "").toLocaleLowerCase("en") === status;

    return matchesSearch && matchesTech && matchesTag && matchesStatus;
  });
}

export function uniqueNames(values: string[]) {
  const names = new Map<string, string>();

  for (const value of values) {
    const name = value.trim();
    if (name) names.set(name.toLocaleLowerCase("en"), name);
  }

  return [...names.values()].sort((a, b) => a.localeCompare(b, "en"));
}

/** The filter bar and stats only earn their space once there are enough projects to sort through. */
export const PROJECT_TOOLS_MIN = 6;

export function showProjectTools(total: number, hasActiveFilters: boolean) {
  return total >= PROJECT_TOOLS_MIN || hasActiveFilters;
}
