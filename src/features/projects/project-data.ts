import "server-only";

import { unstable_cache } from "next/cache";

import { notionService } from "@/services/notion.service";
import type { Project } from "@/types/project";

const projectTime = (project: Project) => {
	const value = Date.parse(project.createdAt);
  return Number.isNaN(value) ? 0 : value;
};

const loadProjects = unstable_cache(
  () => notionService.getProjects(),
  ["notion-project-list"],
  { revalidate: 300, tags: ["notion-projects"] },
);

export async function getProjectData(): Promise<{
  projects: Project[];
  hasError: boolean;
}> {
  try {
    const projects = (await loadProjects())
      .filter(
        (project) =>
          project.published &&
          project.title.trim().length > 0 &&
          project.slug.trim().length > 0,
      )
      .sort((a, b) => projectTime(b) - projectTime(a));

    return { projects, hasError: false };
  } catch {
    return { projects: [], hasError: true };
  }
}
