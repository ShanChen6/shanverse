import assert from "node:assert/strict";
import test from "node:test";

import { createBlogViewSession } from "./blog-view-session";

function requests() {
  const pending: {
    url: string;
    options: RequestInit | undefined;
    resolve: (response: Response) => void;
    reject: (error: Error) => void;
  }[] = [];
  const fetcher: typeof fetch = (input, options) => new Promise<Response>((resolve, reject) => {
    pending.push({ url: String(input), options, resolve, reject });
  });
  return { pending, fetcher };
}

function response(views: number, counted = false) {
  return Response.json({ views, counted });
}

test("initial loading only reads, encodes the slug, and disables fetch caching", async () => {
  const { pending, fetcher } = requests();
  const session = createBlogViewSession("next js/căn bản", fetcher);
  const first = session.load();
  assert.equal(session.load(), first);
  assert.equal(pending.length, 1);
  assert.equal(pending[0].url, "/api/blog/next%20js%2Fc%C4%83n%20b%E1%BA%A3n/views");
  assert.equal(pending[0].options?.method, "GET");
  assert.equal(pending[0].options?.cache, "no-store");
  assert.equal(pending[0].options?.credentials, "same-origin");
  pending[0].resolve(response(4));
  await first;
  assert.deepEqual(session.getSnapshot(), { views: 4, status: "ready" });
});

test("effect replay and repeated visibility callbacks share one POST and its response", async () => {
  const { pending, fetcher } = requests();
  const session = createBlogViewSession("post", fetcher);
  let oldNotifications = 0;
  const unsubscribe = session.subscribe(() => { oldNotifications += 1; });
  const first = session.count();
  unsubscribe();
  let newNotifications = 0;
  session.subscribe(() => { newNotifications += 1; });
  assert.equal(session.count(), first);
  assert.equal(pending.length, 1);
  assert.equal(pending[0].options?.method, "POST");
  assert.equal(pending[0].options?.body, undefined);
  pending[0].resolve(response(5, true));
  await first;
  assert.equal(session.count(), first);
  assert.equal(pending.length, 1);
  assert.equal(oldNotifications, 0);
  assert.equal(newNotifications, 1);
  assert.deepEqual(session.getSnapshot(), { views: 5, status: "ready" });
});

test("a slow GET cannot overwrite the new count from POST", async () => {
  const { pending, fetcher } = requests();
  const session = createBlogViewSession("post", fetcher);
  const read = session.load();
  const count = session.count();
  pending[1].resolve(response(6, true));
  await count;
  pending[0].resolve(response(5));
  await read;
  assert.deepEqual(session.getSnapshot(), { views: 6, status: "ready" });
});

test("changing the slug and revisiting creates independent request sessions", async () => {
  const { pending, fetcher } = requests();
  const first = createBlogViewSession("first", fetcher);
  const second = createBlogViewSession("second", fetcher);
  const revisit = createBlogViewSession("first", fetcher);
  const writes = [first.count(), second.count(), revisit.count()];
  assert.equal(pending.length, 3);
  pending[0].resolve(response(10, true));
  pending[1].resolve(response(2, true));
  pending[2].resolve(response(10, false));
  await Promise.all(writes);
  assert.equal(first.getSnapshot().views, 10);
  assert.equal(second.getSnapshot().views, 2);
  assert.equal(revisit.getSnapshot().views, 10);
});

test("a failed POST preserves the last read value without automatic repeated writes", async () => {
  const { pending, fetcher } = requests();
  const session = createBlogViewSession("post", fetcher);
  const read = session.load();
  pending[0].resolve(response(8));
  await read;
  const count = session.count();
  pending[1].reject(new Error("Network unavailable"));
  await count;
  assert.deepEqual(session.getSnapshot(), { views: 8, status: "error" });
  assert.equal(session.count(), count);
  assert.equal(pending.length, 2);
});

test("missing articles and invalid API responses never appear as zero views", async () => {
  for (const result of [
    Response.json({ views: null, counted: false, error: "Not found" }, { status: 404 }),
    Response.json({ views: -1, counted: false }),
    Response.json({ views: "12", counted: false }),
  ]) {
    const session = createBlogViewSession("post", async () => result);
    await session.count();
    assert.deepEqual(session.getSnapshot(), { views: null, status: "error" });
  }
});
