import assert from "node:assert/strict";
import test from "node:test";

import {
  DISK_OPTIONS,
  MAX_DISKS,
  MIN_DISKS,
  canMove,
  createGame,
  minMoves,
  move,
  movesLeft,
  nextBestMove,
  rating,
  undo,
  type HanoiState,
} from "./logic";

function solveWithHints(state: HanoiState): HanoiState {
  let current = state;
  for (let guard = 0; !current.won && guard < 1000; guard++) {
    const next = nextBestMove(current.pegs, current.disks);
    assert.ok(next, "a hint exists until the tower is solved");
    const after = move(current, next.from, next.to);
    assert.notEqual(after, current, "the hint is a legal move");
    current = after;
  }
  return current;
}

test("a new game stacks every disk on the left peg, largest at the bottom", () => {
  const state = createGame(4);
  assert.deepEqual(state.pegs, [[4, 3, 2, 1], [], []]);
  assert.equal(state.moves, 0);
  assert.equal(state.won, false);
  assert.throws(() => createGame(MIN_DISKS - 1));
  assert.throws(() => createGame(MAX_DISKS + 1));
  assert.deepEqual(DISK_OPTIONS, [3, 4, 5, 6, 7, 8]);
});

test("minimum moves is 2^n - 1", () => {
  assert.equal(minMoves(3), 7);
  assert.equal(minMoves(8), 255);
});

test("a disk cannot go onto a smaller one, from an empty peg, or onto its own peg", () => {
  const state = move(createGame(3), 0, 2);
  assert.equal(canMove(state.pegs, 0, 2), false);
  assert.equal(canMove(state.pegs, 1, 0), false);
  assert.equal(canMove(state.pegs, 0, 0), false);
  assert.equal(canMove(state.pegs, 0, 5), false);
  assert.equal(canMove(state.pegs, 0, 1), true);
  assert.equal(move(state, 0, 2), state);
});

test("moving counts a move and keeps the old layout for undo", () => {
  const start = createGame(3);
  const once = move(start, 0, 2);
  assert.deepEqual(once.pegs, [[3, 2], [], [1]]);
  assert.equal(once.moves, 1);
  assert.deepEqual(start.pegs, [[3, 2, 1], [], []], "the old state is not changed");
  const back = undo(once);
  assert.deepEqual(back.pegs, start.pegs);
  assert.equal(back.moves, 2, "undo counts as a move");
  assert.equal(undo(start), start, "nothing to undo");
});

test("hints solve every size in exactly the minimum number of moves", () => {
  for (const disks of DISK_OPTIONS) {
    const solved = solveWithHints(createGame(disks));
    assert.equal(solved.won, true);
    assert.equal(solved.moves, minMoves(disks));
    assert.equal(nextBestMove(solved.pegs, disks), null);
  }
});

test("hints recover from a detour and movesLeft matches the hinted path", () => {
  let state = createGame(5);
  for (const [from, to] of [[0, 1], [0, 2], [1, 2], [0, 1], [2, 0]] as const) state = move(state, from, to);
  const expected = movesLeft(state.pegs, state.disks);
  const before = state.moves;
  const solved = solveWithHints(state);
  assert.equal(solved.moves - before, expected);
  assert.equal(movesLeft(createGame(6).pegs, 6), minMoves(6));
});

test("a solved game ignores further moves and undo", () => {
  const solved = solveWithHints(createGame(3));
  assert.equal(move(solved, 2, 0), solved);
  assert.equal(undo(solved), solved);
});

test("rating rewards solving close to the minimum", () => {
  assert.equal(rating(7, 3), 3);
  assert.equal(rating(11, 3), 2);
  assert.equal(rating(12, 3), 1);
});
