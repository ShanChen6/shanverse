import assert from "node:assert/strict";
import test from "node:test";

import { createRevalidateHandler, parseScope, readSecret, tagsForScope } from "./revalidate";

const call = async (request: Request, secret: string | null = "s3cret") => {
  const refreshed: string[] = [];
  const handle = createRevalidateHandler({ secret: secret ?? undefined, revalidate: (tag) => refreshed.push(tag) });
  const response = await handle(request);
  return { status: response.status, body: (await response.json()) as Record<string, unknown>, refreshed };
};

test("scopes map to the cache tags used by the Notion loaders", () => {
  assert.deepEqual(tagsForScope("projects"), ["notion-projects"]);
  assert.deepEqual(tagsForScope("posts"), ["notion-posts", "notion-categories", "notion-tags"]);
  assert.equal(tagsForScope("all").length, 5);
  assert.equal(parseScope(undefined), "all");
  assert.equal(parseScope("Projects"), "projects");
  assert.equal(parseScope("nope"), null);
});

test("without a configured secret nothing is refreshed", async () => {
  const result = await call(new Request("https://x.test/api/revalidate", { method: "POST" }), null);
  assert.equal(result.status, 503);
  assert.deepEqual(result.refreshed, []);
});

test("a wrong or missing secret is refused", async () => {
  const wrong = await call(new Request("https://x.test/api/revalidate", { method: "POST", headers: { authorization: "Bearer nope" } }));
  assert.equal(wrong.status, 401);
  const missing = await call(new Request("https://x.test/api/revalidate", { method: "POST" }));
  assert.equal(missing.status, 401);
  assert.deepEqual([...wrong.refreshed, ...missing.refreshed], []);
});

test("a POST with the bearer secret refreshes the requested scope", async () => {
  const request = new Request("https://x.test/api/revalidate", {
    method: "POST",
    headers: { authorization: "Bearer s3cret", "content-type": "application/json" },
    body: JSON.stringify({ scope: "projects" }),
  });
  const result = await call(request);
  assert.equal(result.status, 200);
  assert.deepEqual(result.refreshed, ["notion-projects"]);
});

test("a GET link with ?secret= and ?scope= works, and the default scope is everything", async () => {
  const linked = await call(new Request("https://x.test/api/revalidate?secret=s3cret&scope=posts"));
  assert.equal(linked.status, 200);
  assert.equal(linked.refreshed.length, 3);
  const all = await call(new Request("https://x.test/api/revalidate", { headers: { "x-revalidate-secret": "s3cret" } }));
  assert.equal(all.refreshed.length, 5);
});

test("an unknown scope is a client error and refreshes nothing", async () => {
  const result = await call(new Request("https://x.test/api/revalidate?secret=s3cret&scope=everything"));
  assert.equal(result.status, 400);
  assert.deepEqual(result.refreshed, []);
});

test("the secret is read from the Authorization header first", () => {
  const headers = new Headers({ authorization: "bearer abc", "x-revalidate-secret": "other" });
  assert.equal(readSecret(headers, new URL("https://x.test/?secret=query")), "abc");
});
