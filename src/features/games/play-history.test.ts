import assert from "node:assert/strict";
import test from "node:test";

import { markPlayed, readLastPlayed, recentSlugs } from "./play-history";

function memoryStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => {
      value = next;
    },
  };
}

test("recentSlugs lists the newest opened games first and skips unknown ones", () => {
  const storage = memoryStorage();
  markPlayed("snake", 100, storage);
  markPlayed("2048", 300, storage);
  markPlayed("gone", 400, storage);
  markPlayed("memory", 200, storage);
  assert.deepEqual(recentSlugs(["snake", "2048", "memory"], 3, storage), ["2048", "memory", "snake"]);
  assert.deepEqual(recentSlugs(["snake", "2048", "memory"], 2, storage), ["2048", "memory"]);
});

test("opening a game again moves it to the front", () => {
  const storage = memoryStorage();
  markPlayed("a", 1, storage);
  markPlayed("b", 2, storage);
  markPlayed("a", 3, storage);
  assert.deepEqual(recentSlugs(["a", "b"], 3, storage), ["a", "b"]);
});

test("broken or hostile stored data is ignored", () => {
  assert.deepEqual(readLastPlayed(memoryStorage("not json")), {});
  assert.deepEqual(readLastPlayed(memoryStorage("[1,2]")), {});
  assert.deepEqual(readLastPlayed(memoryStorage('{"a":"x","b":5}')), { b: 5 });
  assert.deepEqual(recentSlugs(["a"], 3, null), []);
});

test("a storage that throws does not break playing", () => {
  const broken = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  };
  assert.doesNotThrow(() => markPlayed("a", 1, broken));
  assert.deepEqual(recentSlugs(["a"], 3, broken), []);
});
