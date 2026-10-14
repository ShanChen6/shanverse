import assert from "node:assert/strict";
import test from "node:test";

import { LOSSES_PER_SUMMON, afterGame, canField, newCollection, sanitize, unowned } from "./collection";
import { ELEMENTS, LEVELS, MONSTERS, STARTERS, monster } from "./monsters";

const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

test("ten starters: two per level, and each element twice", () => {
  assert.equal(STARTERS.length, 10);
  for (const level of LEVELS) assert.equal(STARTERS.filter((id) => monster(id).level === level).length, 2, `level ${level}`);
  for (const element of ELEMENTS) assert.equal(STARTERS.filter((id) => monster(id).element === element).length, 2, element);
  const c = newCollection();
  assert.equal(unowned(c).length, 40);
});

test("a win summons one new monster; a draw summons nothing", () => {
  const random = rng(4);
  const { collection, summoned } = afterGame(newCollection(), "win", random);
  assert.equal(summoned.length, 1);
  assert.ok(!STARTERS.includes(summoned[0]));
  assert.equal(collection.owned.length, 11);
  assert.equal(collection.wins, 1);
  assert.deepEqual(afterGame(collection, "draw", random).summoned, []);
});

test("every third loss summons one too", () => {
  const random = rng(5);
  let c = newCollection();
  const got: number[] = [];
  for (let i = 0; i < 6; i++) {
    const r = afterGame(c, "loss", random);
    c = r.collection;
    got.push(r.summoned.length);
  }
  assert.deepEqual(got, [0, 0, 1, 0, 0, 1]);
  assert.equal(c.losses, 6);
  assert.equal(c.lossStreak, 0);
  assert.equal(LOSSES_PER_SUMMON, 3);
});

test("summons never repeat and stop when all 50 are owned", () => {
  const random = rng(6);
  let c = newCollection();
  for (let i = 0; i < 45; i++) c = afterGame(c, "win", random).collection;
  assert.equal(new Set(c.owned).size, MONSTERS.length);
  assert.equal(c.owned.length, MONSTERS.length);
  assert.deepEqual(afterGame(c, "win", random).summoned, []);
});

test("stored data is cleaned: starters restored, unknown ids and bad counts dropped", () => {
  const c = sanitize({ owned: ["bach-ho", "not-a-monster", "lac-long-quan"], wins: -3, losses: 2.7, lossStreak: 9 });
  assert.ok(STARTERS.every((id) => c.owned.includes(id)));
  assert.ok(c.owned.includes("lac-long-quan") && !c.owned.includes("not-a-monster"));
  assert.deepEqual([c.wins, c.losses, c.lossStreak], [0, 2, LOSSES_PER_SUMMON - 1]);
  assert.deepEqual(sanitize(null).owned, STARTERS);
});

test("a team can only use owned monsters, one per level", () => {
  const c = newCollection();
  const team = LEVELS.map((level) => STARTERS.find((id) => monster(id).level === level) as string);
  assert.ok(canField(c, team));
  assert.ok(!canField(c, [...team.slice(0, 4), "son-tinh"]), "Sơn Tinh is not owned yet");
  assert.ok(!canField(c, team.slice(0, 4)));
});

test("every monster has its own portrait", async () => {
  const { PORTRAITS } = await import("./portraits");
  for (const m of MONSTERS) assert.equal(typeof PORTRAITS[m.id], "function", m.id);
  assert.equal(Object.keys(PORTRAITS).length, MONSTERS.length);
});
