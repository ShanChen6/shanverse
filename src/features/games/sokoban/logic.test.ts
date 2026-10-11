import assert from "node:assert/strict";
import test from "node:test";

import { LEVELS } from "./levels";
import { cratesOnGoals, isSolved, move, parseLevel, rating, stuckCrates } from "./logic";
import { solve } from "./solver";

test("parses walls, pads, crates, the player and the inside of the station", () => {
  const state = parseLevel([
    "  ####",
    "###@ #",
    "#.$ *#",
    "######",
  ]);
  assert.equal(state.width, 6);
  assert.equal(state.height, 4);
  assert.equal(state.player, 1 * 6 + 3);
  assert.deepEqual(state.goals, [2 * 6 + 1, 2 * 6 + 4]);
  assert.deepEqual(state.crates, [2 * 6 + 2, 2 * 6 + 4]);
  assert.equal(state.inside[0], false);
  assert.equal(state.inside[2 * 6 + 3], true);
});

test("rejects broken levels", () => {
  assert.throws(() => parseLevel(["#####", "# $.#", "#####"]), /no player/);
  assert.throws(() => parseLevel(["#####", "#@$ #", "#####"]), /as many crates/);
  assert.throws(() => parseLevel(["#####", "#@@.#", "#####"]), /more than one player/);
  assert.throws(() => parseLevel(["#####", "#@$ .", "#####"]), /not enclosed/);
});

test("walks, pushes one crate and counts moves and pushes", () => {
  const start = parseLevel(["#######", "#@ $ .#", "#######"]);
  let result = move(start, "right");
  assert.equal(result.moved, true);
  assert.equal(result.pushed, false);
  result = move(result.state, "right");
  assert.equal(result.pushed, true);
  assert.equal(result.state.crates[0], start.crates[0] + 1);
  assert.equal(result.state.moves, 2);
  assert.equal(result.state.pushes, 1);
  assert.equal(result.state.facing, "right");
});

test("walls and double crates block, and only turn the player", () => {
  const start = parseLevel(["######", "#@$$.#", "#   .#", "######"]);
  const blocked = move(start, "right");
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.state.player, start.player);
  assert.equal(blocked.state.moves, 0);
  const wall = move(start, "up");
  assert.equal(wall.blocked, true);
  assert.equal(wall.state.facing, "up");
});

test("solved when every crate is on a pad", () => {
  const start = parseLevel(["#######", "#@ $ .#", "#######"]);
  let state = start;
  for (const d of ["right", "right", "right"] as const) state = move(state, d).state;
  assert.equal(isSolved(state), true);
  assert.equal(cratesOnGoals(state), 1);
  assert.equal(isSolved(start), false);
});

test("reports crates stuck in a corner, but not on a pad or along a wall", () => {
  const corner = parseLevel(["#####", "#$ .#", "# @ #", "#####"]);
  assert.deepEqual(stuckCrates(corner), corner.crates);
  const onPad = parseLevel(["#####", "#* .#", "#@$ #", "#####"]);
  assert.deepEqual(stuckCrates(onPad), []);
  const alongWall = parseLevel(["######", "# $ .#", "# @  #", "######"]);
  assert.deepEqual(stuckCrates(alongWall), []);
});

test("rating gives three stars at or near par", () => {
  assert.equal(rating(20, 20), 3);
  assert.equal(rating(23, 20), 3);
  assert.equal(rating(30, 20), 2);
  assert.equal(rating(60, 20), 1);
});

test("every level parses, is unique and is solvable at exactly its par", () => {
  assert.ok(LEVELS.length >= 10);
  assert.equal(new Set(LEVELS.map((l) => l.id)).size, LEVELS.length);
  for (const level of LEVELS) {
    const state = parseLevel(level.map);
    assert.equal(isSolved(state), false, `${level.id} starts solved`);
    assert.deepEqual(stuckCrates(state), [], `${level.id} starts stuck`);
    const solution = solve(state);
    assert.ok(solution, `${level.id} is not solvable`);
    assert.equal(solution.length, level.par, `${level.id} par should be ${solution.length}`);
    // Replaying the solution through the real rules solves it.
    let replay = state;
    for (const direction of solution) replay = move(replay, direction).state;
    assert.equal(isSolved(replay), true, `${level.id} replay`);
  }
});
