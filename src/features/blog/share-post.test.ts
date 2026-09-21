import assert from "node:assert/strict";
import test from "node:test";

import { buildBlogPostCanonicalUrl } from "@/config/seo.config";
import { createSocialShareUrls, sharePost } from "./share-post";

test("builds the Vietnamese canonical URL and safely encodes the slug", () => {
  const canonical = new URL(buildBlogPostCanonicalUrl("next js/căn bản"));
  assert.equal(canonical.pathname, "/vi/blog/next%20js%2Fc%C4%83n%20b%E1%BA%A3n");
});

test("encodes canonical URLs and titles in social share links", () => {
  const canonicalUrl = "https://shanverse.com/vi/blog/a?b=c&d=e";
  const links = createSocialShareUrls({ title: "React & Next.js", canonicalUrl });
  assert.ok(links.facebook.includes(encodeURIComponent(canonicalUrl)));
  assert.ok(links.linkedIn.includes(encodeURIComponent(canonicalUrl)));
  assert.ok(links.x.includes(encodeURIComponent(canonicalUrl)));
  assert.ok(links.x.includes(encodeURIComponent("React & Next.js")));
});

test("copies the canonical URL when Web Share is unavailable", async () => {
  let copied = "";
  const result = await sharePost(
    { title: "Post", text: "Excerpt", url: "https://shanverse.com/vi/blog/post" },
    { writeText: async (value) => { copied = value; } },
  );
  assert.equal(result, "copied");
  assert.equal(copied, "https://shanverse.com/vi/blog/post");
});

test("treats AbortError as cancellation without copying or reporting failure", async () => {
  let copyCalled = false;
  const abortError = new Error("Cancelled");
  abortError.name = "AbortError";
  const result = await sharePost(
    { title: "Post", text: "Excerpt", url: "https://shanverse.com/vi/blog/post" },
    {
      share: async () => { throw abortError; },
      writeText: async () => { copyCalled = true; },
    },
  );
  assert.equal(result, "cancelled");
  assert.equal(copyCalled, false);
});

test("falls back to clipboard when Web Share fails", async () => {
  const result = await sharePost(
    { title: "Post", text: "Excerpt", url: "https://shanverse.com/vi/blog/post" },
    {
      share: async () => { throw new Error("Share unavailable"); },
      writeText: async () => undefined,
    },
  );
  assert.equal(result, "copied");
});
