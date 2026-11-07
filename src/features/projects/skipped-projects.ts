import type { Project } from "@/types/project";

/** Projects that are published but cannot be shown, with the reason, so a missing page is easy to explain. */
export function skippedProjects(projects: Pick<Project, "id" | "title" | "slug" | "published">[]) {
  return projects.flatMap((project) => {
    if (!project.published) return [];
    const missing = [!project.title.trim() ? "title" : null, !project.slug.trim() ? "slug" : null].filter(Boolean);
    return missing.length ? [{ id: project.id, title: project.title.trim() || "(no title)", missing }] : [];
  });
}
