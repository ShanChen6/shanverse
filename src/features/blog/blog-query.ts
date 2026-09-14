import type { Post } from "@/types/post";

export const POSTS_PER_PAGE = 6;

export type BlogSearchParams = Record<string, string | string[] | undefined>;
export type BlogQuery = { q: string; category: string; tag: string; page: number };

export function parseBlogQuery(params: BlogSearchParams): BlogQuery {
  const value = (key: string) => {
    const entry = params[key];
    return (Array.isArray(entry) ? entry[0] : entry)?.trim() ?? "";
  };
  const page = Number(value("page"));
  return {
    q: value("q"),
    category: value("category"),
    tag: value("tag"),
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function blogHref(query: BlogQuery, changes: Partial<BlogQuery> = {}): string {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  for (const key of ["q", "category", "tag"] as const) {
    if (next[key]) params.set(key, next[key]);
  }
  if (next.page > 1) params.set("page", String(next.page));
  return `/blog${params.size ? `?${params.toString()}` : ""}`;
}

export function publishedPosts(posts: Post[]): Post[] {
  const timestamp = (post: Post) => {
    const published = Date.parse(post.publishedAt ?? "");
    const created = Date.parse(post.createdAt);
    return Number.isFinite(published) ? published : Number.isFinite(created) ? created : 0;
  };
  return posts
    .filter((post) => post.published === true && post.title.trim() && post.slug.trim())
    .sort((a, b) => timestamp(b) - timestamp(a) || a.id.localeCompare(b.id));
}

export function filterPosts(posts: Post[], query: BlogQuery): Post[] {
  const q = query.q.toLowerCase();
  return posts.filter((post) =>
    (!query.category || post.category?.toLowerCase() === query.category.toLowerCase()) &&
    (!query.tag || post.tags.some((tag) => tag.toLowerCase() === query.tag.toLowerCase())) &&
    (!q || [post.title, post.excerpt, post.category ?? "", ...post.tags].some((value) => value.toLowerCase().includes(q))),
  );
}

export function getFilterNames(names: string[], postNames: string[]): string[] {
  const unique = new Map<string, string>();
  for (const name of [...names, ...postNames]) {
    const trimmed = name.trim();
    if (trimmed && !unique.has(trimmed.toLowerCase())) unique.set(trimmed.toLowerCase(), trimmed);
  }
  return [...unique.values()].sort((a, b) => a.localeCompare(b, "en"));
}
