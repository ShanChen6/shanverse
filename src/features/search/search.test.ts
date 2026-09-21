import assert from "node:assert/strict";
import test from "node:test";

import { createSearchDocuments, normalizeSearchDescription } from "./create-search-documents";
import { FUSE_SEARCH_OPTIONS } from "./search.config";
import { normalizeSearchText } from "./search-text";
import type { Post } from "@/types/post";
import type { Project } from "@/types/project";

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-id",
    title: "Trải nghiệm xây dựng Next.js",
    slug: "trai-nghiem-nextjs",
    excerpt: "Một bài viết   có nhiều khoảng trắng.",
    content: "content must not reach the index",
    contentBlocks: [],
    thumbnailImage: null,
    coverImage: null,
    category: "Frontend",
    tags: ["React", "Next.js"],
    authorName: null,
    authorAvatar: null,
    readingTimeMinutes: 5,
    createdAt: "2026-01-01T00:00:00.000Z",
    publishedAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
    featured: true,
    published: true,
    url: "private-notion-url",
    ...overrides,
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: "project-id",
    title: "Shanverse",
    slug: "shanverse",
    description: "Portfolio project",
    content: "content must not reach the index",
    contentBlocks: [],
    thumbnailImage: null,
    coverImage: null,
    techStack: ["Next.js"],
    tags: ["Web"],
    githubUrl: null,
    liveUrl: null,
    role: null,
    timeline: null,
    status: null,
    featured: false,
    published: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
    url: "private-notion-url",
    ...overrides,
  };
}

test("creates minimal documents without Notion content or private URLs", () => {
  const documents = createSearchDocuments({ posts: [post()], projects: [project()] });
  assert.equal(documents.length, 2);
  for (const document of documents) {
    assert.equal("content" in document, false);
    assert.equal("contentBlocks" in document, false);
    assert.equal("url" in document, false);
  }
});

test("excludes unpublished records and records without valid titles or slugs", () => {
  const documents = createSearchDocuments({
    posts: [post({ id: "draft", published: false }), post({ id: "empty", title: " " })],
    projects: [project({ id: "invalid", slug: " " })],
  });
  assert.deepEqual(documents, []);
});

test("normalizes whitespace and limits descriptions", () => {
  const value = normalizeSearchDescription(`  ${"word ".repeat(60)}  `);
  assert.equal(/\s{2,}/u.test(value), false);
  assert.ok(value.length <= 180);
  assert.ok(value.endsWith("…"));
});

test("supports Vietnamese queries without changing the displayed title", () => {
  const [document] = createSearchDocuments({ posts: [post()] });
  assert.equal(document.title, "Trải nghiệm xây dựng Next.js");
  assert.equal(normalizeSearchText("trải nghiệm"), normalizeSearchText("trai nghiem"));
  assert.equal(FUSE_SEARCH_OPTIONS.ignoreDiacritics, true);
});
