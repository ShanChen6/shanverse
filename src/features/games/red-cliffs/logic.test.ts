import assert from "node:assert/strict";
import test from "node:test";

import { generate, MAX_CLICKS, MIN_CLICKS } from "./generator";
import { CELLS, fire, isCleared, parseBoard, shipsLeft, type Board } from "./logic";
import { canClear, findSolution } from "./solver";

/** A board from a few "x,y:strength" entries; everything else is open water. */
function board(entries: Record<string, number>): number[] {
  const cells = new Array<number>(CELLS).fill(0);
  for (const [at, strength] of Object.entries(entries)) {
    const [x, y] = at.split(",").map(Number);
    cells[y * 6 + x] = strength;
  }
  return cells;
}
const at = (x: number, y: number) => y * 6 + x;
const play = (start: Board, clicks: number[]) => clicks.reduce<Board>((b, cell) => fire(b, cell).board, start);

test("a hit takes one step off a ship that is not burnt out", () => {
  const start = board({ "2,2": 3 });
  const result = fire(start, at(2, 2), true);
  assert.equal(result.board[at(2, 2)], 2);
  assert.equal(result.sunk, 0);
  assert.equal(result.frames.length, 1, "no torches fly");
});

test("clicking open water does nothing", () => {
  const start = board({ "2,2": 3 });
  assert.deepEqual(fire(start, at(0, 0)).board, start);
});

test("a burnt-out ship sinks and its torches set off a chain", () => {
  const start = board({ "0,0": 1, "1,0": 1, "1,1": 2 });
  const result = fire(start, at(0, 0), true);
  assert.equal(result.board[at(0, 0)], 0);
  assert.equal(result.board[at(1, 0)], 0, "hit by the right-hand torch on tick 1");
  assert.equal(result.board[at(1, 1)], 1, "hit by the second ship's downward torch");
  assert.equal(result.sunk, 2);
});

test("torches fly over open water, one cell per tick, to the first ship", () => {
  const start = board({ "0,0": 1, "3,0": 2, "5,0": 2 });
  const result = fire(start, at(0, 0), true);
  assert.equal(result.board[at(3, 0)], 1);
  assert.equal(result.board[at(5, 0)], 2, "the torch was spent on the first ship");
  const hitTick = result.frames.find((frame) => frame.hits.includes(at(3, 0)))?.tick;
  assert.equal(hitTick, 3, "three cells away means tick 3");
});

test("a torch that leaves the board is lost", () => {
  const start = board({ "0,0": 1 });
  const result = fire(start, at(0, 0), true);
  assert.ok(isCleared(result.board));
  assert.equal(result.frames.at(-1)?.torches.length, 0);
});

// Two torches launched on tick 2 reach the burnt-out ship T on tick 4: one
// flying down (from Q), one flying right (from P). Down goes first, sinks
// T, and the right-hand torch flies straight through T's cell to hit R.
// T's own right-hand torch then hits R as well, so R takes two hits.
test("when a ship sinks, other torches arriving that tick fly through", () => {
  const start = board({
    "0,0": 1, // S: clicked
    "0,2": 1, // P: hit by S's downward torch on tick 2
    "2,0": 1, // Q: hit by S's right-hand torch on tick 2
    "2,2": 1, // T: reached by P's right torch and Q's down torch on tick 4
    "4,2": 3, // R
  });
  const result = fire(start, at(0, 0), true);
  const tick4 = result.frames.find((frame) => frame.tick === 4);
  assert.deepEqual(tick4?.hits, [at(2, 2)], "T is hit once, not twice");
  assert.equal(result.board[at(4, 2)], 1, "R takes the pass-through torch and T's torch");
  assert.equal(shipsLeft(result.board), 1);
});

// Same set-up as above, but T has strength 2: both torches arriving on tick
// 4 are needed to sink it, so neither flies through, and R only takes T's
// own torch.
test("torches arriving together all count while the ship is still afloat", () => {
  const start = board({ "0,0": 1, "0,2": 1, "2,0": 1, "2,2": 2, "4,2": 3 });
  const result = fire(start, at(0, 0), true);
  const tick4 = result.frames.find((frame) => frame.tick === 4);
  assert.deepEqual(tick4?.hits, [at(2, 2), at(2, 2)], "T takes both torches");
  assert.deepEqual(tick4?.sunk, [at(2, 2)]);
  assert.equal(result.board[at(4, 2)], 2, "only T's torch reaches R");
});

test("fire is pure: the input board is not changed", () => {
  const start = board({ "0,0": 1, "1,0": 2 });
  const copy = start.slice();
  fire(start, at(0, 0));
  assert.deepEqual(start, copy);
});

test("canClear is exact for small click counts", () => {
  assert.equal(canClear(board({ "3,3": 1 }), 0), false);
  assert.equal(canClear(board({ "3,3": 1 }), 1), true);
  assert.equal(canClear(board({ "3,3": 4 }), 3), false);
  assert.equal(canClear(board({ "3,3": 4 }), 4), true);
  // Two far-apart ships in different rows and columns need two clicks.
  assert.equal(canClear(board({ "0,0": 1, "3,4": 1 }), 1), false);
  assert.equal(canClear(board({ "0,0": 1, "3,4": 1 }), 2), true);
});

test("findSolution returns a sequence that really clears the board", () => {
  const start = parseBoard("110000 220000 000000 000300 000110 000001");
  const solution = findSolution(start, 8);
  assert.ok(solution);
  assert.ok(isCleared(play(start, solution)));
});

test("parseBoard reads 36 digits and rejects anything else", () => {
  assert.equal(parseBoard("123401 ".repeat(6)).length, 36);
  assert.throws(() => parseBoard("12345"));
  assert.throws(() => parseBoard("5".repeat(36)));
});

test("generated boards are winnable in 4 to 8 clicks, never in 3, and rebuild from their seed", () => {
  for (const seed of [1, 2, 3]) {
    const game = generate(seed);
    assert.ok(game.solution.length >= MIN_CLICKS && game.solution.length <= MAX_CLICKS, `seed ${seed}: ${game.solution.length} clicks`);
    assert.ok(isCleared(play(game.board, game.solution)), `seed ${seed}: the solution clears the board`);
    assert.equal(canClear(game.board, MIN_CLICKS - 1), false, `seed ${seed}: not solvable in 3`);
    assert.deepEqual(generate(game.seed).board, game.board, `seed ${seed}: same seed, same board`);
  }
});

test("each frame records the torches that struck a ship, at that ship's cell", () => {
  const start = board({ "0,0": 1, "3,0": 2, "0,4": 1 });
  const result = fire(start, at(0, 0), true);
  for (const frame of result.frames.slice(1)) {
    assert.equal(frame.strikes.length, frame.hits.length, `tick ${frame.tick}`);
    assert.deepEqual(frame.strikes.map((s) => s.y * 6 + s.x), frame.hits, `tick ${frame.tick}`);
  }
  const strike = result.frames.find((frame) => frame.hits.includes(at(3, 0)))?.strikes[0];
  assert.deepEqual(strike, { x: 3, y: 0, direction: 3, origin: at(0, 0) }, "flying right from the clicked ship");
});
