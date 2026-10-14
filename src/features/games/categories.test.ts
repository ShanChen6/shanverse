import assert from "node:assert/strict";
import test from "node:test";

import { CATEGORIES, categoriesOf, usedCategories } from "./categories";
import { GAMES } from "./games.config";

test("every game has a known main category and no repeated categories", () => {
  const ids = new Set<string>(CATEGORIES.map((category) => category.id));
  for (const game of GAMES) {
    const all = categoriesOf(game);
    assert.equal(all[0], game.category, `${game.slug}: main category comes first`);
    for (const id of all) assert.ok(ids.has(id), `${game.slug}: unknown category ${id}`);
    assert.equal(new Set(all).size, all.length, `${game.slug}: a category is listed twice`);
  }
});

test("only categories with games are shown, in the configured order", () => {
  const shown = usedCategories(GAMES).map((category) => category.id);
  const order = CATEGORIES.map((category) => category.id);
  assert.deepEqual(shown, order.filter((id) => shown.includes(id)), "display order follows CATEGORIES");
  assert.ok(!shown.includes("card"), "no card game yet, so Card Games is hidden");
  assert.ok(shown.includes("quiz-trivia"), "an extra category is enough to show it");
});

test("usedCategories ignores empty lists", () => {
  assert.deepEqual(usedCategories([]), []);
});
