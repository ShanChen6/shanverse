import assert from "node:assert/strict";
import test from "node:test";

import {
  claimSessionView,
  confirmSessionView,
  releaseSessionView,
  VIEW_SESSION_PREFIX,
} from "./view-session";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
}

test("does not write the session marker before POST succeeds", () => {
  const storage = memoryStorage();
  assert.equal(claimSessionView(storage, "post"), true);
  assert.equal(storage.values.has(`${VIEW_SESSION_PREFIX}post`), false);
  assert.equal(claimSessionView(storage, "post"), false);
  confirmSessionView(storage, "post");
  assert.equal(storage.values.get(`${VIEW_SESSION_PREFIX}post`), "counted");
  assert.equal(claimSessionView(storage, "post"), false);
});

test("ignores a stale pending marker from the previous implementation", () => {
  const storage = memoryStorage();
  storage.setItem(`${VIEW_SESSION_PREFIX}legacy-post`, "pending");
  assert.equal(claimSessionView(storage, "legacy-post"), true);
  releaseSessionView("legacy-post");
});

test("allows retry after a failed increment releases the in-flight guard", () => {
  const storage = memoryStorage();
  assert.equal(claimSessionView(storage, "post-retry"), true);
  releaseSessionView("post-retry");
  assert.equal(claimSessionView(storage, "post-retry"), true);
  releaseSessionView("post-retry");
});
