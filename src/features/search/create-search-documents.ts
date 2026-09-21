import { ROUTES } from "@/constants/routes";
import type { NotionCategory, NotionTag } from "@/types/notion";
import type { Post } from "@/types/post";
import type { Project } from "@/types/project";
import type { SearchDocument } from "./search.types";

const DESCRIPTION_LIMIT = 180;

export function normalizeSearchDescription(value: string): string {
  const normalized = value.replace(/\s+/gu, " ").trim();
  return normalized.length > DESCRIPTION_LIMIT
    ? `${normalized.slice(0, DESCRIPTION_LIMIT - 1).trimEnd()}…`
    : normalized;
}

function timestamp(value: string | null | undefined, fallback: string): number {
  const preferred = Date.parse(value ?? "");
  const secondary = Date.parse(fallback);
  return Number.isFinite(preferred)
    ? preferred
    : Number.isFinite(secondary)
      ? secondary
      : 0;
}

type CreateSearchDocumentsInput = {
  posts?: Post[];
  projects?: Project[];
  categories?: NotionCategory[];
  tags?: NotionTag[];
  categoryHref?: (category: NotionCategory) => string;
  tagHref?: (tag: NotionTag) => string;
};

export function createSearchDocuments({
  posts = [],
  projects = [],
  categories = [],
  tags = [],
  categoryHref = (category) =>
    `${ROUTES.BLOG}?category=${encodeURIComponent(category.slug)}`,
  tagHref = (tag) => `${ROUTES.BLOG}?tag=${encodeURIComponent(tag.slug)}`,
}: CreateSearchDocumentsInput): SearchDocument[] {
  const postDocuments = posts
    .filter(
      (post) => post.published && post.title.trim() && post.slug.trim(),
    )
    .map<SearchDocument>((post) => ({
      id: `post-${post.id}`,
      type: "post",
      title: post.title.trim(),
      description: normalizeSearchDescription(post.excerpt),
      href: ROUTES.BLOG_DETAIL(post.slug),
      category: post.category?.trim() || undefined,
      tags: post.tags.map((tag) => tag.trim()).filter(Boolean),
      featured: post.featured,
      timestamp: timestamp(post.publishedAt, post.createdAt),
    }));

  const projectDocuments = projects
    .filter(
      (project) =>
        project.published && project.title.trim() && project.slug.trim(),
    )
    .map<SearchDocument>((project) => ({
      id: `project-${project.id}`,
      type: "project",
      title: project.title.trim(),
      description: normalizeSearchDescription(project.description),
      href: ROUTES.PROJECT_DETAIL(project.slug),
      tags: project.tags.map((tag) => tag.trim()).filter(Boolean),
      techStack: project.techStack.map((item) => item.trim()).filter(Boolean),
      featured: project.featured,
      timestamp: timestamp(project.updatedAt, project.createdAt),
    }));

  const categoryDocuments = categories
    .filter((category) => category.name.trim() && category.slug.trim())
    .map<SearchDocument>((category) => ({
      id: `category-${category.id}`,
      type: "category",
      title: category.name.trim(),
      description: normalizeSearchDescription(category.description),
      href: categoryHref(category),
      category: category.name.trim(),
      tags: [],
    }));

  const tagDocuments = tags
    .filter((tag) => tag.name.trim() && tag.slug.trim())
    .map<SearchDocument>((tag) => ({
      id: `tag-${tag.id}`,
      type: "tag",
      title: tag.name.trim(),
      description: normalizeSearchDescription(tag.description),
      href: tagHref(tag),
      tags: [tag.name.trim()],
    }));

  return [
    ...postDocuments,
    ...projectDocuments,
    ...categoryDocuments,
    ...tagDocuments,
  ];
}
