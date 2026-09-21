import assert from "node:assert/strict";
import test from "node:test";

import { getRelatedPosts } from "./related-posts";
import type { Post } from "@/types/post";

function post(overrides: Partial<Post> & Pick<Post, "id" | "slug">): Post {
  return { title: overrides.slug, excerpt: "", content: "", thumbnailImage: null, coverImage: null, category: null, tags: [], authorName: null, authorAvatar: null, readingTimeMinutes: null, createdAt: "2026-01-01T00:00:00.000Z", publishedAt: null, updatedAt: "2026-01-01T00:00:00.000Z", featured: false, published: true, url: "", ...overrides, id: overrides.id, slug: overrides.slug };
}

const current = post({ id: "current", slug: "current", category: "Frontend", tags: ["React", "Next.js"] });

test("prioritizes the same category", () => {
  const sameCategory = post({ id: "category", slug: "category", category: "frontend" });
  const oneTag = post({ id: "tag", slug: "tag", tags: ["React"] });
  assert.equal(getRelatedPosts(current, [oneTag, sameCategory])[0]?.id, sameCategory.id);
});

test("prioritizes more matching tags", () => {
  const one = post({ id: "one", slug: "one", tags: ["React"] });
  const two = post({ id: "two", slug: "two", tags: ["react", "NEXT.JS"] });
  assert.equal(getRelatedPosts(current, [one, two])[0]?.id, two.id);
});

test("excludes the current and unpublished posts", () => {
  const draft = post({ id: "draft", slug: "draft", published: false, category: "Frontend" });
  assert.deepEqual(getRelatedPosts(current, [current, draft]), []);
});

test("excludes posts without a title or slug", () => {
  const missingTitle = post({ id: "title", slug: "title", title: " " });
  const missingSlug = post({ id: "slug", slug: " " });
  assert.deepEqual(getRelatedPosts(current, [missingTitle, missingSlug]), []);
});

test("falls back to the newest posts when relevance is zero", () => {
  const older = post({ id: "older", slug: "older", publishedAt: "2026-01-01T00:00:00.000Z", featured: true });
  const newer = post({ id: "newer", slug: "newer", publishedAt: "2026-02-01T00:00:00.000Z" });
  assert.deepEqual(getRelatedPosts(current, [older, newer]).map(({ id }) => id), ["newer", "older"]);
});

test("honors the requested limit", () => {
  const candidates = [1, 2, 3, 4].map((value) => post({ id: String(value), slug: String(value), category: "Frontend" }));
  assert.equal(getRelatedPosts(current, candidates, 2).length, 2);
  assert.deepEqual(getRelatedPosts(current, candidates, 0), []);
});

test("uses stable slug and id tie-breakers", () => {
  const first = post({ id: "2", slug: "alpha", category: "Frontend" });
  const second = post({ id: "1", slug: "beta", category: "Frontend" });
  assert.deepEqual(getRelatedPosts(current, [second, first]).map(({ id }) => id), ["2", "1"]);
});
