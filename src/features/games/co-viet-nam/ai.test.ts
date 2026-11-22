import assert from "node:assert/strict";
import test from "node:test";

import { chooseMove, evaluate } from "./ai";
import { RED, isLegal, newGame, parseSquare, play, squareName, type Position } from "./logic";

const at = parseSquare;

function board(pieces: Record<string, string>, toMove = RED): Position {
  const grid: string[][] = Array.from({ length: 12 }, () => new Array(11).fill(""));
  for (const [name, text] of Object.entries(pieces)) {
    const s = at(name);
    grid[11 - Math.floor(s / 11)][s % 11] = text;
  }
  const rows = grid.map((row) => {
    let out = "";
    let empty = 0;
    for (const cell of row) {
      if (!cell) {
        empty++;
        continue;
      }
      if (empty) out += empty;
      empty = 0;
      out += cell;
    }
    return out + (empty ? empty : "");
  });
  const pos = newGame(rows.join("/"));
  pos.toMove = toMove;
  return pos;
}

test("the starting position is even", () => {
  const pos = newGame();
  assert.equal(evaluate(pos, "r") + evaluate(pos, "b"), 0);
});

test("every level returns a legal opening move", () => {
  const pos = newGame();
  for (const level of ["easy", "medium", "hard"] as const) {
    const { move } = chooseMove(pos, level, 7);
    assert.ok(move && isLegal(pos, move), level);
  }
});

test("takes a free piece", () => {
  // Red artillery can shoot an undefended blue ship.
  const pos = board({ k1: "C", c12: "c", e3: "A", e6: "n", k12: "i" });
  const { move } = chooseMove(pos, "medium", 3);
  assert.equal(squareName(move!.to), "e6");
});

test("finds checkmate in one", () => {
  const pos = board({ c1: "C", k12: "c", k10: "i", e12: "m", i11: "T", g12: "T" });
  const { move } = chooseMove(pos, "medium", 1);
  const after = play(pos, move!);
  assert.deepEqual(after.result, { winner: RED, reason: "checkmate" });
});

test("hard level stays within its time budget", () => {
  const started = Date.now();
  chooseMove(newGame(), "hard", 5);
  assert.ok(Date.now() - started < 4000);
});
