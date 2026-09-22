import assert from "node:assert/strict";
import test from "node:test";

import type { Post } from "@/types/post";
import {
  createViewKey,
  isPublishedPostSlug,
  normalizeViewSlug,
} from "./view-key";

const post = (overrides: Partial<Post> = {}): Post => ({
  id: "post-1",
  title: "Post",
  slug: "hello-world",
  excerpt: "",
  content: "",
  readingTimeMinutes: null,
  thumbnailImage: null,
  coverImage: null,
  category: null,
  tags: [],
  authorName: null,
  authorAvatar: null,
  createdAt: "2026-01-01",
  publishedAt: null,
  updatedAt: "2026-01-01",
  featured: false,
  published: true,
  url: "",
  ...overrides,
});

test("normalizes safe slugs and creates an internal Redis key", () => {
  assert.equal(normalizeViewSlug("  Hello-World  "), "hello-world");
  assert.equal(createViewKey("Hello-World"), "post:views:hello-world");
});

test("rejects invalid slugs", () => {
  for (const value of ["", "../post", "post:key", "post name", "https://x.test"]) {
    assert.equal(normalizeViewSlug(value), null);
  }
});

test("only accepts published posts with title and matching slug", () => {
  assert.equal(isPublishedPostSlug([post()], "hello-world"), true);
  assert.equal(
    isPublishedPostSlug([post({ published: false })], "hello-world"),
    false,
  );
  assert.equal(isPublishedPostSlug([post({ title: "" })], "hello-world"), false);
  assert.equal(isPublishedPostSlug([post()], "missing"), false);
});
