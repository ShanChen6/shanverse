import "server-only";

import { getCachedBlogPosts } from "@/features/blog/blog-data";
import { publishedPosts } from "@/features/blog/blog-query";
import { getProjectData } from "@/features/projects/project-data";

export type AboutStats = {
  posts: number;
  projects: number;
  technologies: number;
};

export async function getAboutStats(): Promise<AboutStats | null> {
  try {
    const [posts, projectData] = await Promise.all([
      getCachedBlogPosts(),
      getProjectData(),
    ]);
    if (projectData.hasError) return null;

    const published = publishedPosts(posts);
    const technologies = new Set(
      projectData.projects.flatMap((project) =>
        project.techStack.map((technology) => technology.trim().toLowerCase()),
      ),
    );
    const stats = {
      posts: published.length,
      projects: projectData.projects.length,
      technologies: [...technologies].filter(Boolean).length,
    };

    return stats.posts || stats.projects || stats.technologies ? stats : null;
  } catch {
    return null;
  }
}
