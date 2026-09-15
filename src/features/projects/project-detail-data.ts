import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { notionService } from "@/services/notion.service";
import type { Project } from "@/types/project";
import { getProjectData } from "./project-data";

const loadProject = unstable_cache(
  (slug: string) => notionService.getProjectBySlug(slug),
  ["notion-project-detail"],
  { revalidate: 300, tags: ["notion-projects"] },
);

export const getProjectDetail = cache(
  async (slug: string): Promise<Project | null> => {
    const project = await loadProject(slug);
    return project?.published === true &&
      project.title.trim() &&
      project.slug.trim()
      ? project
      : null;
  },
);

export async function getRelatedProjects(project: Project): Promise<Project[]> {
  const { projects } = await getProjectData();
  const technologies = new Set(
    project.techStack.map((value) => value.toLocaleLowerCase("en")),
  );
  const tags = new Set(project.tags.map((value) => value.toLocaleLowerCase("en")));

  return projects
    .filter((candidate) => candidate.id !== project.id)
    .map((candidate) => ({
      candidate,
      techMatches: candidate.techStack.filter((value) =>
        technologies.has(value.toLocaleLowerCase("en")),
      ).length,
      tagMatches: candidate.tags.filter((value) =>
        tags.has(value.toLocaleLowerCase("en")),
      ).length,
    }))
    .sort(
      (a, b) =>
        b.techMatches - a.techMatches ||
        b.tagMatches - a.tagMatches ||
        Number(b.candidate.featured) - Number(a.candidate.featured) ||
        Date.parse(b.candidate.createdAt) - Date.parse(a.candidate.createdAt),
    )
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}
