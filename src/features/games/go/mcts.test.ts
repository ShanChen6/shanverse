import assert from "node:assert/strict";
import test from "node:test";

import { handle } from "./engine";
import { BLACK, PASS, WHITE, newGame, parsePoint, play, type Position } from "./logic";
import { createRng, estimateDead, search } from "./mcts";

function fromRows(rows: string[], toPlay: typeof BLACK | typeof WHITE, mode: "full" | "capture" = "full"): Position {
  const size = rows.length;
  const pos = newGame(size, mode);
  pos.board.fill(0);
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    pos.board[y * size + x] = ch === "X" ? BLACK : ch === "O" ? WHITE : 0;
  }));
  pos.toPlay = toPlay;
  pos.moveNumber = 20;
  return pos;
}

test("the random generator is repeatable", () => {
  const a = createRng(42);
  const b = createRng(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});

test("capture mode: takes a stone that is in atari", () => {
  const pos = fromRows([
    ".........",
    ".........",
    "...XO....",
    "..XO.X...",
    "...X.....",
    ".........",
    ".........",
    ".........",
    ".........",
  ], BLACK, "capture");
  // The white stone at D6 has a single liberty left, at E6.
  const result = search(pos, { playouts: 1500 }, createRng(1));
  const after = play(pos, result.move).position;
  assert.equal(after.winner, BLACK, `expected a capture, got ${result.move}`);
});

test("capture mode: escapes when its own stone is in atari", () => {
  const pos = fromRows([
    ".........",
    ".........",
    "...O.....",
    "..OXO....",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ], BLACK, "capture");
  const result = search(pos, { playouts: 3000 }, createRng(2));
  assert.equal(result.move, parsePoint("D5", 9), "extends the stone out of atari");
});

test("full game: captures a group that is in atari", () => {
  const pos = fromRows([
    ".........",
    "..OOO....",
    "..XXXO...",
    "..OOO....",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ], WHITE);
  // The three black stones have one liberty left, at B7.
  const result = search(pos, { playouts: 3000 }, createRng(3));
  const after = play(pos, result.move);
  assert.equal(after.captured, 3, `expected the capture, got ${result.move}`);
});

test("dead stones: lone stones inside the other side's area are dead", () => {
  const pos = fromRows([
    ".........",
    "..O......",
    ".........",
    "XXXXXXXXX",
    "OOOOOOOOO",
    ".........",
    "......X..",
    ".........",
    ".........",
  ], BLACK);
  const dead = estimateDead(pos, createRng(4), 200);
  assert.deepEqual(dead, [parsePoint("C8", 9), parsePoint("G3", 9)].sort((a, b) => a - b));
});

test("the engine answers with a legal move and never resigns at the start", () => {
  const moves = ["E5", "C3", "G7"].map((n) => parsePoint(n, 9));
  const response = handle({ id: 1, kind: "move", size: 9, mode: "full", moves, level: "easy", seed: 5, brain: "mcts" });
  assert.equal(response.kind, "move");
  if (response.kind !== "move") return;
  assert.equal(response.resign, false);
  let pos = newGame(9, "full");
  for (const m of moves) pos = play(pos, m).position;
  assert.equal(play(pos, response.move).legal, true);
});

test("the engine rejects an illegal move record", () => {
  const response = handle({ id: 2, kind: "move", size: 9, mode: "full", moves: [40, 40], level: "easy", seed: 1, brain: "mcts" });
  assert.equal(response.kind, "error");
});
