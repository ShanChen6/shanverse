import assert from "node:assert/strict";
import test from "node:test";

import { LEVELS } from "./levels";
import { cratesOnGoals, deadSquares, isSolved, move, parseLevel, planFromSolution, rating, stuckCrates, undoMove, type Direction, type SokobanState } from "./logic";
import { PLANS } from "./plans.generated";
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
  const onPad = parseLevel(["#####", "#* .#", "# $ #", "#  @#", "#####"]);
  assert.deepEqual(stuckCrates(onPad), []);
  const alongWall = parseLevel(["######", "# $ .#", "# @  #", "######"]);
  assert.deepEqual(stuckCrates(alongWall), []);
});

test("undo takes back walks and pushes exactly", () => {
  const start = parseLevel(["#######", "#@ $ .#", "#    .#", "#  $  #", "#######"]);
  const directions: Direction[] = ["right", "right", "down", "left", "up", "right"];
  const states: SokobanState[] = [start];
  const records = [];
  let state = start;
  for (const direction of directions) {
    const result = move(state, direction);
    if (!result.record) continue;
    records.push(result.record);
    state = result.state;
    states.push(state);
  }
  assert.ok(records.some((record) => record.crate !== -1), "the sequence pushes a crate");
  for (let i = records.length - 1; i >= 0; i--) {
    state = undoMove(state, records[i]);
    assert.deepEqual(state, states[i], `undo back to step ${i}`);
  }
});

test("a blocked move gives no undo record", () => {
  const start = parseLevel(["#######", "#@ $ .#", "#######"]);
  assert.equal(move(start, "up").record, undefined);
  assert.ok(move(start, "right").record);
});

test("dead squares are corners and wall runs with no pad, never pads", () => {
  const state = parseLevel([
    "#######",
    "#     #",
    "# $.@ #",
    "#     #",
    "#######",
  ]);
  const dead = deadSquares(state);
  const at = (x: number, y: number) => dead[y * state.width + x];
  assert.equal(at(1, 1), true, "corner");
  assert.equal(at(3, 1), true, "top wall run without a pad");
  assert.equal(at(1, 2), true, "left wall run without a pad");
  assert.equal(at(3, 2), false, "the pad");
  assert.equal(at(2, 2), false, "next to the pad");
  assert.equal(at(0, 0), false, "walls are not dead squares");
});

test("a crate pushed against a padless wall is stuck", () => {
  const state = parseLevel(["#######", "#  $  #", "#  @ .#", "#######"]);
  assert.deepEqual(stuckCrates(state), state.crates);
});

test("two crates side by side against a wall freeze each other", () => {
  const state = parseLevel([
    "#######",
    "#.$$ .#",
    "#  @  #",
    "#######",
  ]);
  // Crates on the top row: both against the wall, and they lock each other sideways.
  assert.equal(stuckCrates(state).length > 0, true);

  const free = parseLevel([
    "#######",
    "#     #",
    "# $$  #",
    "#. @ .#",
    "#######",
  ]);
  assert.deepEqual(stuckCrates(free), []);
});

test("a frozen pair is fine when both crates are on pads", () => {
  const state = parseLevel(["######", "#**  #", "# @  #", "######"]);
  assert.deepEqual(stuckCrates(state), []);
});

// Walks every state reachable within a few moves of each level's start and
// checks that whatever stuckCrates reports as lost really cannot be solved.
test("deadlock detection never reports a solvable state", () => {
  const directions: Direction[] = ["up", "down", "left", "right"];
  for (const level of LEVELS.slice(0, 6)) {
    let frontier = [parseLevel(level.map)];
    const seen = new Set<string>();
    for (let depth = 0; depth < 6; depth++) {
      const next: SokobanState[] = [];
      for (const state of frontier) {
        for (const direction of directions) {
          const result = move(state, direction);
          if (!result.moved) continue;
          const key = `${result.state.player}|${result.state.crates.join(",")}`;
          if (seen.has(key)) continue;
          seen.add(key);
          if (stuckCrates(result.state).length) {
            assert.equal(solveIgnoringDeadlocks(result.state), false, `${level.id}: flagged state is solvable`);
          } else {
            next.push(result.state);
          }
        }
      }
      frontier = next;
    }
  }
});

/** Plain breadth-first search with no pruning, to check pruning is sound. */
function solveIgnoringDeadlocks(start: SokobanState, limit = 200_000): boolean {
  const key = (s: SokobanState) => `${s.player}|${s.crates.slice().sort((a, b) => a - b).join(",")}`;
  const seen = new Set([key(start)]);
  let frontier = [start];
  while (frontier.length && seen.size < limit) {
    const next: SokobanState[] = [];
    for (const state of frontier) {
      for (const direction of ["up", "down", "left", "right"] as Direction[]) {
        const result = move(state, direction);
        if (!result.moved) continue;
        if (isSolved(result.state)) return true;
        const k = key(result.state);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push(result.state);
      }
    }
    frontier = next;
  }
  assert.ok(seen.size < limit, "search ran out of room, the check is inconclusive");
  return false;
}

test("a plan lists each crate's pad in the order the crates are finished", () => {
  const state = parseLevel(["#######", "#.   .#", "# $$  #", "#  @  #", "#######"]);
  const solution = solve(state);
  assert.ok(solution);
  const plan = planFromSolution(state, solution);
  assert.equal(plan.length, 2);
  assert.deepEqual(new Set(plan.map((s) => s.crate)), new Set(state.crates));
  assert.deepEqual(new Set(plan.map((s) => s.goal)), new Set(state.goals));
});

test("the generated hint plans match the solver, so they cannot drift from the levels", () => {
  assert.deepEqual(Object.keys(PLANS).sort(), LEVELS.map((l) => l.id).sort(), "run pnpm sokoban:plans");
  for (const level of LEVELS) {
    const state = parseLevel(level.map);
    const solution = solve(state);
    assert.ok(solution);
    assert.deepEqual(PLANS[level.id], planFromSolution(state, solution), `${level.id}: run pnpm sokoban:plans`);
  }
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
