import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { NextRequest } from "next/server";

import { createRedisClient } from "@/lib/redis";
import { NotionService } from "@/services/notion.service";
import { createViewCountHandlers, VIEW_VISITOR_COOKIE } from "./view-count-api";
import { createViewCounter, VIEW_DEDUPE_SECONDS, type ViewCountRedis } from "./view-count";

const visitor = "0319cfe2-f677-4f4a-8a8c-22a4e04c9d28";
const otherVisitor = "2eecc463-3644-4826-9d8b-5b2a00a5f680";

class MemoryRedis implements ViewCountRedis {
  values = new Map<string, number>();
  expires = new Map<string, number>();
  calls: string[] = [];
  now = 0;
  failSet = false;
  failIncrement: "before" | "after" | undefined;

  async get(key: string) {
    this.calls.push(`GET ${key}`);
    return this.values.get(key) ?? null;
  }

  async set(key: string, value: number, options: { nx: true; ex: number }) {
    this.calls.push(`SET ${key}`);
    assert.deepEqual(options, { nx: true, ex: 86400 });
    if (this.failSet) throw new Error("Storage unavailable");
    if ((this.expires.get(key) ?? 0) > this.now) return null;
    // The claim changes synchronously, as Redis SET NX does atomically.
    this.values.set(key, value);
    this.expires.set(key, this.now + options.ex);
    return "OK";
  }

  async incr(key: string) {
    this.calls.push(`INCR ${key}`);
    if (this.failIncrement === "before") throw new Error("Increment failed");
    const views = (this.values.get(key) ?? 0) + 1;
    this.values.set(key, views);
    if (this.failIncrement === "after") throw new Error("Response lost");
    return views;
  }
}

function fixture() {
  const redis = new MemoryRedis();
  const counter = createViewCounter(() => redis);
  let published = true;
  const handlers = createViewCountHandlers({
    ...counter,
    isPublishedPostSlug: async (slug) => published && slug === "article",
  });
  return { redis, counter, handlers, unpublish: () => { published = false; } };
}

function context(slug = "article") {
  return { params: Promise.resolve({ slug }) };
}

function postRequest({
  origin = "https://shanverse.com",
  url = "https://shanverse.com/api/blog/article/views",
  cookie,
  headers,
}: { origin?: string; url?: string; cookie?: string; headers?: Record<string, string> } = {}) {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      ...(origin ? { origin } : {}),
      ...(cookie ? { cookie: `${VIEW_VISITOR_COOKIE}=${cookie}` } : {}),
      ...headers,
    },
    body: JSON.stringify({ views: 999999, visitorId: otherVisitor }),
  });
}

function assertNoCache(response: Response) {
  assert.match(response.headers.get("cache-control") ?? "", /no-store/u);
  assert.equal(response.headers.get("cdn-cache-control"), "no-store");
  assert.equal(response.headers.get("vercel-cdn-cache-control"), "no-store");
}

test("reads do not write; first view uses versioned keys and SHA-256 visitor ID", async () => {
  const { redis, counter } = fixture();
  assert.equal(await counter.getViews("article"), 0);
  assert.deepEqual(redis.calls, ["GET blog:views:v1:article"]);
  assert.deepEqual(await counter.incrView("article", visitor), { views: 1, counted: true });
  const hash = createHash("sha256").update(visitor).digest("hex");
  assert.ok(redis.values.has(`blog:view-dedupe:v1:article:${hash}`));
  assert.equal([...redis.values.keys()].some((key) => key.includes(visitor)), false);
  assert.equal(await counter.getViews("article"), 1);
});

test("reload and concurrent requests sharing a visitor cookie only count once", async () => {
  const { redis, counter } = fixture();
  const results = await Promise.all([
    counter.incrView("article", visitor),
    counter.incrView("article", visitor),
  ]);
  assert.equal(results.filter((result) => result.counted).length, 1);
  assert.equal(redis.calls.filter((call) => call.startsWith("INCR")).length, 1);
  assert.deepEqual(await counter.incrView("article", visitor), { views: 1, counted: false });
});

test("different visitors/slugs count independently and the claim expires after 24 hours", async () => {
  const { redis, counter } = fixture();
  await counter.incrView("article", visitor);
  assert.deepEqual(await counter.incrView("article", otherVisitor), { views: 2, counted: true });
  assert.deepEqual(await counter.incrView("another", visitor), { views: 1, counted: true });
  redis.now = VIEW_DEDUPE_SECONDS - 1;
  assert.equal((await counter.incrView("article", visitor)).counted, false);
  redis.now = VIEW_DEDUPE_SECONDS;
  assert.deepEqual(await counter.incrView("article", visitor), { views: 3, counted: true });
});

test("failed SET never increments and a failed/ambiguous INCR retains its claim", async () => {
  const { redis, counter } = fixture();
  redis.failSet = true;
  await assert.rejects(counter.incrView("article", visitor));
  assert.equal(redis.calls.some((call) => call.startsWith("INCR")), false);

  redis.failSet = false;
  redis.failIncrement = "before";
  await assert.rejects(counter.incrView("article", visitor));
  redis.failIncrement = undefined;
  assert.deepEqual(await counter.incrView("article", visitor), { views: 0, counted: false });

  redis.failIncrement = "after";
  await assert.rejects(counter.incrView("another", visitor));
  redis.failIncrement = undefined;
  assert.deepEqual(await counter.incrView("another", visitor), { views: 1, counted: false });
});

test("GET only reads and returns an uncached count without creating a visitor", async () => {
  const { redis, handlers } = fixture();
  const response = await handlers.GET(new NextRequest("https://shanverse.com/api/blog/article/views"), context());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { views: 0, counted: false });
  assert.equal(response.headers.get("set-cookie"), null);
  assert.deepEqual(redis.calls, ["GET blog:views:v1:article"]);
  assertNoCache(response);
});

test("POST issues an HttpOnly Lax visitor cookie, ignores client numbers, then deduplicates reload", async () => {
  const { handlers } = fixture();
  const first = await handlers.POST(postRequest(), context());
  assert.deepEqual(await first.json(), { views: 1, counted: true });
  assertNoCache(first);
  const cookie = first.headers.get("set-cookie") ?? "";
  assert.match(cookie, /HttpOnly/iu);
  assert.match(cookie, /SameSite=Lax/iu);
  assert.match(cookie, /Path=\//u);
  const visitorId = first.cookies.get(VIEW_VISITOR_COOKIE)?.value;
  assert.ok(visitorId);
  assert.notEqual(visitorId, otherVisitor);
  const reload = await handlers.POST(postRequest({ cookie: visitorId }), context());
  assert.deepEqual(await reload.json(), { views: 1, counted: false });
});

test("parallel API POSTs with the same established cookie count once", async () => {
  const { handlers } = fixture();
  const responses = await Promise.all([
    handlers.POST(postRequest({ cookie: visitor }), context()),
    handlers.POST(postRequest({ cookie: visitor }), context()),
  ]);
  const results = await Promise.all(responses.map((response) => response.json()));
  assert.equal(results.filter((result) => result.counted).length, 1);
  assert.ok(results.every((result) => result.views === 1));
});

test("POST rejects missing, null, foreign, same-site, malformed, protocol/port mismatched origins", async () => {
  const { redis, handlers } = fixture();
  const rejectedRequests: Parameters<typeof postRequest>[0][] = [
    { origin: "" },
    { origin: "null" },
    { origin: "https://evil.example" },
    { origin: "https://shanverse.com/path" },
    { origin: "http://shanverse.com" },
    { origin: "https://shanverse.com:444" },
    { headers: { "sec-fetch-site": "same-site" } },
    { headers: { "sec-fetch-site": "cross-site" } },
    { origin: "https://evil.example", headers: { "x-forwarded-host": "evil.example" } },
  ];
  for (const options of rejectedRequests) {
    const response = await handlers.POST(postRequest(options), context());
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { views: null, counted: false, error: "Same-origin request required." });
    assertNoCache(response);
  }
  assert.deepEqual(redis.calls, []);
});

test("same-origin custom, preview, and local request URLs are accepted", async () => {
  for (const origin of ["https://shanverse.com", "https://shanverse-preview.vercel.app", "http://localhost:3000"]) {
    const { handlers } = fixture();
    const response = await handlers.POST(postRequest({ origin, url: `${origin}/api/blog/article/views`, headers: { "sec-fetch-site": "same-origin" } }), context());
    assert.equal(response.status, 200);
  }
});

test("missing/unpublished slugs return 404 before Redis; publication is rechecked each request", async () => {
  const { redis, handlers, unpublish } = fixture();
  for (const method of ["GET", "POST"] as const) {
    const response = await handlers[method](postRequest(), context("missing"));
    assert.equal(response.status, 404);
    assertNoCache(response);
  }
  assert.deepEqual(redis.calls, []);
  await handlers.POST(postRequest({ cookie: visitor }), context());
  redis.calls.length = 0;
  unpublish();
  assert.equal((await handlers.POST(postRequest({ cookie: visitor }), context())).status, 404);
  assert.deepEqual(redis.calls, []);
});

test("API failure preserves the new cookie, returns null rather than a fabricated zero, and stays uncached", async () => {
  const { redis, handlers } = fixture();
  redis.failIncrement = "after";
  const response = await handlers.POST(postRequest(), context());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { views: null, counted: false, error: "Views are temporarily unavailable." });
  assert.ok(response.cookies.get(VIEW_VISITOR_COOKIE));
  assertNoCache(response);
});

test("production visitor cookie is Secure and malformed IDs are replaced", async () => {
  const previous = process.env.NODE_ENV;
  Object.defineProperty(process.env, "NODE_ENV", { value: "production", configurable: true, enumerable: true, writable: true });
  try {
    const { handlers } = fixture();
    const response = await handlers.POST(postRequest({ cookie: "arbitrary-client-value" }), context());
    assert.match(response.headers.get("set-cookie") ?? "", /Secure/iu);
    assert.notEqual(response.cookies.get(VIEW_VISITOR_COOKIE)?.value, "arbitrary-client-value");
  } finally {
    if (previous === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.defineProperty(process.env, "NODE_ENV", { value: previous, configurable: true, enumerable: true, writable: true });
  }
});

test("actual Upstash HTTP client never retries a lost INCR response and disables fetch caching", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (_input, init) => {
    calls += 1;
    assert.equal(init?.cache, "no-store");
    assert.deepEqual(JSON.parse(String(init?.body)), ["incr", "blog:views:v1:article"]);
    throw new TypeError("Simulated response loss after server committed");
  };
  try {
    const redis = createRedisClient("https://redis.invalid", "test-token");
    await assert.rejects(redis.incr("blog:views:v1:article"));
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fresh Notion publication checks reject drafts, archived/trashed pages, missing titles and unknown slugs", async () => {
  const service = new NotionService();
  const page = {
    archived: false,
    in_trash: false,
    properties: {
      Slug: { type: "rich_text", rich_text: [{ plain_text: "article" }] },
      Name: { type: "title", title: [{ plain_text: "Article" }] },
      Published: { type: "checkbox", checkbox: true },
    },
  };
  let pages = [page];
  let queries = 0;
  Object.defineProperty(service, "queryPages", { value: async () => { queries++; return pages; } });
  assert.equal(await service.isPublishedPostSlug("article"), true);
  assert.equal(await service.isPublishedPostSlug("missing"), false);
  page.properties.Published.checkbox = false;
  assert.equal(await service.isPublishedPostSlug("article"), false);
  page.properties.Published.checkbox = true;
  page.archived = true;
  assert.equal(await service.isPublishedPostSlug("article"), false);
  page.archived = false;
  page.in_trash = true;
  assert.equal(await service.isPublishedPostSlug("article"), false);
  page.in_trash = false;
  page.properties.Name.title = [];
  assert.equal(await service.isPublishedPostSlug("article"), false);
  pages = [];
  assert.equal(await service.isPublishedPostSlug("article"), false);
  assert.equal(queries, 7);
});
