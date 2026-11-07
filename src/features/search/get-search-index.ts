import { getHomeData } from "@/features/home/home-data";
import type { Post } from "@/types/post";

import { createSearchDocuments } from "./create-search-documents";
import type { SearchCategory, SearchDocument } from "./search.types";

export type SearchIndex = {
  documents: SearchDocument[];
  categories: SearchCategory[];
};

const isPublishedPost = (post: Post) => post.published && post.title.trim().length > 0 && post.slug.trim().length > 0;

/** Everything the site search needs: published posts and projects, categories and tags. */
export async function getSearchIndex(): Promise<SearchIndex> {
  const { posts, projects, categories } = await getHomeData();
  const publishedPosts = posts.filter(isPublishedPost);
  const publishedProjects = projects.filter(
    (project) => project.published && project.title.trim().length > 0 && project.slug.trim().length > 0,
  );

  const searchCategories: SearchCategory[] = Array.from(
    new Map(
      categories
        .filter((category) => category.name.trim() && category.slug.trim())
        .map((category) => [
          category.slug.trim().toLowerCase(),
          { id: `category-${category.slug.trim()}`, name: category.name.trim(), slug: category.slug.trim() },
        ]),
    ).values(),
  );

  const tags = Array.from(
    new Map(
      publishedPosts
        .flatMap((post) => post.tags)
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => [name.toLowerCase(), name]),
    ).entries(),
  ).map(([id, name]) => ({ id, name, slug: name, description: "", icon: null, url: "" }));

  return {
    documents: createSearchDocuments({ posts: publishedPosts, projects: publishedProjects, categories, tags }),
    categories: searchCategories,
  };
}
