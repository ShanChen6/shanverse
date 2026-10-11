import assert from "node:assert/strict";
import test from "node:test";

import {
  DIFFICULTIES,
  chord,
  createGame,
  minesLeft,
  neighbours,
  open,
  placeMines,
  reveal,
  toggleFlag,
  type GameState,
} from "./logic";

/** Builds a playing board from a picture: "*" is a mine, "." is safe. */
function board(picture: string[]): GameState {
  const rows = picture.length;
  const cols = picture[0].length;
  const mines = picture.join("").split("").filter((c) => c === "*").length;
  const state = createGame({ rows, cols, mines });
  const cells = state.cells.map((cell, i) => ({ ...cell, mine: picture[Math.floor(i / cols)][i % cols] === "*" }));
  for (let i = 0; i < cells.length; i++) {
    cells[i].adjacent = neighbours(state, i).filter((n) => cells[n].mine).length;
  }
  return { ...state, cells, status: "playing" };
}

const at = (state: GameState, row: number, col: number) => row * state.cols + col;
const view = (state: GameState) =>
  Array.from({ length: state.rows }, (_, r) =>
    state.cells
      .slice(r * state.cols, (r + 1) * state.cols)
      .map((c) => (c.state === "flagged" ? "F" : c.state === "hidden" ? "#" : c.mine ? "*" : String(c.adjacent)))
      .join(""),
  );

let seed = 1;
const seeded = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

test("difficulties have the classic sizes", () => {
  assert.deepEqual(
    Object.values(DIFFICULTIES).map(({ rows, cols, mines }) => [rows, cols, mines]),
    [[9, 9, 10], [16, 16, 40], [16, 30, 99]],
  );
});

test("neighbours handles corners, edges and the middle", () => {
  const state = createGame({ rows: 3, cols: 3, mines: 1 });
  assert.deepEqual(neighbours(state, 0).sort(), [1, 3, 4]);
  assert.equal(neighbours(state, 1).length, 5);
  assert.equal(neighbours(state, 4).length, 8);
});

test("the first click is always safe and opens an area", () => {
  for (const difficulty of Object.values(DIFFICULTIES)) {
    for (let run = 0; run < 25; run++) {
      const first = Math.floor(seeded() * difficulty.rows * difficulty.cols);
      const state = reveal(createGame(difficulty), first, seeded);
      assert.equal(state.status === "lost", false);
      assert.equal(state.cells[first].adjacent, 0);
      for (const n of neighbours(state, first)) assert.equal(state.cells[n].mine, false);
      assert.equal(state.cells.filter((cell) => cell.mine).length, difficulty.mines);
    }
  }
});

test("placeMines still works when the board is too small to keep the area clear", () => {
  const state = placeMines(createGame({ rows: 3, cols: 3, mines: 8 }), 4, seeded);
  assert.equal(state.cells[4].mine, false);
  assert.equal(state.cells.filter((cell) => cell.mine).length, 8);
});

test("revealing an empty cell flood-opens up to the numbers", () => {
  const start = board([
    "....",
    "....",
    "...*",
    "....",
  ]);
  const state = reveal(start, at(start, 0, 0));
  assert.deepEqual(view(state), [
    "0000",
    "0011",
    "001#",
    "001#",
  ]);
  assert.equal(state.revealed, 14);
});

test("revealing a number opens only that cell", () => {
  const start = board(["*..", "...", "..."]);
  const state = reveal(start, at(start, 0, 1));
  assert.deepEqual(view(state), ["#1#", "###", "###"]);
});

test("hitting a mine loses and shows every mine, keeping flags", () => {
  const start = toggleFlag(board(["*.*", "...", "..."]), 2);
  const state = reveal(start, 0);
  assert.equal(state.status, "lost");
  assert.equal(state.exploded, 0);
  assert.equal(state.cells[0].state, "revealed");
  assert.equal(state.cells[2].state, "flagged");
  assert.equal(reveal(state, 4), state);
});

test("opening every safe cell wins and flags the mines", () => {
  const start = board(["*..", "...", "..."]);
  const state = reveal(start, at(start, 2, 2));
  assert.equal(state.status, "won");
  assert.equal(state.cells[0].state, "flagged");
  assert.equal(minesLeft(state), 0);
});

test("flags block reveals and can be toggled off", () => {
  const start = board(["*..", "...", "..."]);
  const flagged = toggleFlag(start, 0);
  assert.equal(minesLeft(flagged), 0);
  assert.equal(reveal(flagged, 0), flagged);
  assert.equal(toggleFlag(flagged, 0).cells[0].state, "hidden");
});

test("flood fill does not open flagged cells", () => {
  const start = toggleFlag(board(["....", "....", "....", "...*"]), 1);
  const state = reveal(start, 0);
  assert.equal(state.cells[1].state, "flagged");
  assert.equal(state.status, "playing");
});

test("revealed cells cannot be flagged", () => {
  const start = reveal(board(["*..", "...", "..."]), 1);
  assert.equal(toggleFlag(start, 1), start);
});

test("chording opens the neighbours when the flags match", () => {
  const start = board([
    "*..",
    "...",
    "...",
  ]);
  const opened = toggleFlag(reveal(start, at(start, 1, 1)), 0);
  const state = chord(opened, at(start, 1, 1));
  assert.equal(state.status, "won");
});

test("chording with the wrong flag sets off the mine", () => {
  const start = board([
    "*..",
    "...",
    "...",
  ]);
  const opened = toggleFlag(reveal(start, at(start, 1, 1)), 1);
  const state = chord(opened, at(start, 1, 1));
  assert.equal(state.status, "lost");
  assert.equal(state.exploded, 0);
});

test("chording does nothing when the flag count does not match", () => {
  const start = board(["*..", "...", "..."]);
  const opened = reveal(start, at(start, 1, 1));
  assert.equal(chord(opened, at(start, 1, 1)), opened);
});

test("open reveals hidden cells and chords numbers", () => {
  const start = board(["*..", "...", "..."]);
  const once = open(start, at(start, 1, 1));
  assert.equal(once.cells[at(start, 1, 1)].state, "revealed");
  assert.equal(open(toggleFlag(once, 0), at(start, 1, 1)).status, "won");
});

test("a fresh game starts ready, and the first reveal starts it", () => {
  const fresh = createGame(DIFFICULTIES.easy);
  assert.equal(fresh.status, "ready");
  assert.equal(minesLeft(fresh), 10);
  assert.equal(reveal(fresh, 40, seeded).status === "ready", false);
  assert.throws(() => createGame({ rows: 2, cols: 2, mines: 4 }));
});
