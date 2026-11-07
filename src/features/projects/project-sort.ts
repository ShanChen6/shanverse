import type { Project } from "@/types/project";

const time = (value: string | null | undefined) => {
  const parsed = Date.parse(value ?? "");
  return Number.isNaN(parsed) ? 0 : parsed;
};

/** When the project was made: its own date if set in Notion, else the page's creation time. */
export const projectTime = (project: Pick<Project, "date" | "createdAt">) => time(project.date) || time(project.createdAt);

/**
 * Display order: projects with an Order number first (smallest first),
 * then the rest, newest project date first.
 */
export function compareProjects(
  a: Pick<Project, "order" | "date" | "createdAt" | "title">,
  b: Pick<Project, "order" | "date" | "createdAt" | "title">,
): number {
  const hasA = a.order !== null && a.order !== undefined;
  const hasB = b.order !== null && b.order !== undefined;
  if (hasA && hasB && a.order !== b.order) return (a.order as number) - (b.order as number);
  if (hasA !== hasB) return hasA ? -1 : 1;
  return projectTime(b) - projectTime(a) || a.title.localeCompare(b.title);
}
