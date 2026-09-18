import "server-only";

import { getCachedBlogPosts, getCachedCategories } from "@/features/blog/blog-data";
import { getProjectData } from "@/features/projects/project-data";
import type { NotionCategory } from "@/types/notion";
import type { Post } from "@/types/post";

export async function getHomeData() {
  const [posts, projects, categories] = await Promise.allSettled([
    getCachedBlogPosts(),
    getProjectData(),
    getCachedCategories(),
  ]);

  return {
    posts: posts.status === "fulfilled" ? posts.value : ([] as Post[]),
    projects: projects.status === "fulfilled" ? projects.value.projects : [],
    categories: categories.status === "fulfilled" ? categories.value : ([] as NotionCategory[]),
  };
}
