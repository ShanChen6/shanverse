import assert from "node:assert/strict";
import test from "node:test";

import { RedisViewStore } from "./redis-view-store";

test("uses Redis INCR for the persistent counter", async () => {
  const values = new Map<string, number>();
  const redis = {
    get: async (key: string) => values.get(key) ?? null,
    incr: async (key: string) => {
      const value = (values.get(key) ?? 0) + 1;
      values.set(key, value);
      return value;
    },
    expire: async () => 1,
  };
  const store = new RedisViewStore(redis);
  assert.equal(await store.increment("hello-world"), 1);
  assert.equal(await store.increment("hello-world"), 2);
  assert.equal(await store.get("hello-world"), 2);
});
