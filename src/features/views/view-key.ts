import type { Post } from "@/types/post";

const MAX_SLUG_LENGTH = 160;
const VALID_SLUG = /^[\p{L}\p{N}]+(?:[-_][\p{L}\p{N}]+)*$/u;

export function normalizeViewSlug(value: string): string | null {
  const slug = value.trim().normalize("NFKC").toLocaleLowerCase("en-US");
  if (!slug || slug.length > MAX_SLUG_LENGTH || !VALID_SLUG.test(slug)) return null;
  return slug;
}

export function createViewKey(slug: string): string {
  const normalized = normalizeViewSlug(slug);
  if (!normalized) throw new TypeError("Invalid post slug");
  return `post:views:${normalized}`;
}

export function isPublishedPostSlug(posts: Post[], slug: string): boolean {
  const normalized = normalizeViewSlug(slug);
  if (!normalized) return false;
  return posts.some((post) =>
    post.published === true &&
    post.title.trim().length > 0 &&
    normalizeViewSlug(post.slug) === normalized
  );
}
