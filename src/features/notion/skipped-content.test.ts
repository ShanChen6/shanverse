import assert from "node:assert/strict";
import test from "node:test";

import { duplicateSlugs, reportContentProblems, skippedItems } from "./skipped-content";

const item = (id: string, title: string, slug: string, published = true) => ({ id, title, slug, published });

test("published items missing a title or slug are reported; unpublished ones are not", () => {
  assert.deepEqual(
    skippedItems([item("1", "Ok", "ok"), item("2", "No slug", " "), item("3", "", "x"), item("4", "", "", false)]),
    [
      { id: "2", title: "No slug", missing: ["slug"] },
      { id: "3", title: "(no title)", missing: ["title"] },
    ],
  );
});

test("a slug used by two published items is reported once, ignoring case and unpublished copies", () => {
  const duplicates = duplicateSlugs([
    item("1", "A", "hello"),
    item("2", "B", "Hello"),
    item("3", "Draft", "hello", false),
    item("4", "C", "other"),
  ]);
  assert.deepEqual(duplicates, [{ slug: "hello", items: [{ id: "1", title: "A" }, { id: "2", title: "B" }] }]);
});

test("items that are already hidden for another reason are not also called duplicates", () => {
  assert.deepEqual(duplicateSlugs([item("1", "", "same"), item("2", "Real", "same")]), []);
});

test("one warning per kind of problem, and none when the content is fine", () => {
  const lines: string[] = [];
  const logger = { warn: (message: string) => void lines.push(message) };
  reportContentProblems("posts", [item("1", "A", "a"), item("2", "B", "b")], logger);
  assert.deepEqual(lines, []);
  reportContentProblems("posts", [item("1", "A", "same"), item("2", "B", "same"), item("3", "", "c")], logger);
  assert.equal(lines.length, 2);
  assert.match(lines[0], /posts hidden/);
  assert.match(lines[1], /share a slug/);
});
