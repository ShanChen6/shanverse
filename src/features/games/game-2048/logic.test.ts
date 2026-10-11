import assert from "node:assert/strict";
import test from "node:test";

import {
  addRandomTile,
  canMove,
  createGame,
  move,
  parseSavedGame,
  showsWinScreen,
  type GameState,
  type Tile,
} from "./logic";

/** Always picks the first empty cell and spawns a 2. */
const firstCellTwo = () => 0;

/** Builds a state from rows of numbers (0 = empty). */
function board(rows: number[][], extra: Partial<GameState> = {}): GameState {
  let id = 1;
  const tiles: Tile[] = [];
  rows.forEach((values, row) =>
    values.forEach((value, col) => {
      if (value) tiles.push({ id: id++, value, row, col });
    }),
  );
  return { tiles, score: 0, nextId: id, won: false, keepPlaying: false, over: false, ...extra };
}

/** Reads a state back into rows, ignoring the freshly spawned tile. */
function rows(state: GameState, { skipNew = true } = {}): number[][] {
  const grid = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  for (const tile of state.tiles) if (!(skipNew && tile.isNew)) grid[tile.row][tile.col] = tile.value;
  return grid;
}

test("a new game starts with two tiles", () => {
  const game = createGame();
  assert.equal(game.tiles.length, 2);
  assert.ok(game.tiles.every((tile) => tile.value === 2 || tile.value === 4));
  assert.equal(game.score, 0);
});

test("slides tiles left and merges equal pairs once", () => {
  const start = board([
    [2, 2, 2, 2],
    [2, 0, 2, 4],
    [4, 4, 8, 0],
    [0, 0, 0, 2],
  ]);
  const { state, moved, gained } = move(start, "left", firstCellTwo);
  assert.equal(moved, true);
  assert.deepEqual(rows(state), [
    [4, 4, 0, 0],
    [4, 4, 0, 0],
    [8, 8, 0, 0],
    [2, 0, 0, 0],
  ]);
  assert.equal(gained, 4 + 4 + 4 + 8);
  assert.equal(state.score, 20);
});

test("merges the pair nearest the wall first", () => {
  const { state } = move(board([[0, 2, 2, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), "right", firstCellTwo);
  assert.deepEqual(rows(state)[0], [0, 0, 2, 4]);
});

test("a merged tile does not merge again in the same move", () => {
  const { state } = move(board([[4, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), "left", firstCellTwo);
  assert.deepEqual(rows(state)[0], [4, 4, 0, 0]);
});

test("moves up and down along columns", () => {
  const start = board([
    [2, 0, 0, 0],
    [2, 0, 0, 0],
    [4, 0, 0, 0],
    [0, 0, 0, 8],
  ]);
  assert.deepEqual(rows(move(start, "up", firstCellTwo).state).map((r) => r[0]), [4, 4, 0, 0]);
  assert.deepEqual(rows(move(start, "down", firstCellTwo).state).map((r) => r[0]), [0, 0, 4, 4]);
});

test("a move that changes nothing returns the same state and adds no tile", () => {
  const start = board([[2, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  const result = move(start, "left", firstCellTwo);
  assert.equal(result.moved, false);
  assert.equal(result.state, start);
});

test("a successful move spawns exactly one new tile", () => {
  const start = board([[0, 0, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  const { state } = move(start, "left", firstCellTwo);
  assert.equal(state.tiles.length, 2);
  assert.equal(state.tiles.filter((tile) => tile.isNew).length, 1);
});

test("tiles keep their ids when sliding, merged tiles get a new id", () => {
  const start = board([[2, 0, 2, 4], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  const { state } = move(start, "left", firstCellTwo);
  const merged = state.tiles.find((tile) => tile.value === 4 && tile.col === 0);
  const slid = state.tiles.find((tile) => tile.value === 4 && tile.col === 1);
  assert.deepEqual(merged?.mergedFrom, [1, 2]);
  assert.ok(merged && merged.id >= start.nextId);
  assert.equal(slid?.id, 3);
  assert.equal(new Set(state.tiles.map((tile) => tile.id)).size, state.tiles.length);
});

test("reaching 2048 sets won and shows the win screen until the player continues", () => {
  const { state } = move(board([[1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), "left", firstCellTwo);
  assert.equal(state.won, true);
  assert.equal(showsWinScreen(state), true);
  assert.equal(showsWinScreen({ ...state, keepPlaying: true }), false);
});

test("detects game over when the board is full with no equal neighbours", () => {
  const full = board([
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ]);
  assert.equal(canMove(full.tiles), false);
  assert.equal(canMove(board([[2, 2, 4, 8], [4, 8, 16, 32], [8, 16, 32, 64], [16, 32, 64, 128]]).tiles), true);
});

test("a move that fills the board without merges ends the game", () => {
  const start = board([
    [0, 2, 4, 8],
    [16, 32, 64, 128],
    [256, 512, 1024, 4],
    [8, 16, 32, 64],
  ]);
  // Sliding left leaves only the top-right cell empty; the new 2 has no equal neighbour.
  const { state, moved } = move(start, "left", firstCellTwo);
  assert.equal(moved, true);
  assert.deepEqual(rows(state, { skipNew: false })[0], [2, 4, 8, 2]);
  assert.equal(state.over, true);
  assert.equal(move(state, "right", firstCellTwo).moved, false);
});

test("addRandomTile does nothing on a full board", () => {
  const full = board([[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]);
  assert.equal(addRandomTile(full, firstCellTwo), full);
});

test("spawns a 4 about one time in ten", () => {
  const four = addRandomTile(board([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), (() => {
    const values = [0, 0.95];
    return () => values.shift() ?? 0;
  })());
  assert.equal(four.tiles[0].value, 4);
});

test("parseSavedGame restores a valid save and rejects broken ones", () => {
  const game = move(createGame(), "left").state;
  const restored = parseSavedGame(JSON.parse(JSON.stringify(game)));
  assert.ok(restored);
  assert.equal(restored.tiles.length, game.tiles.length);
  assert.ok(restored.nextId > Math.max(...restored.tiles.map((tile) => tile.id)));

  assert.equal(parseSavedGame(null), null);
  assert.equal(parseSavedGame({ tiles: [], score: 0, nextId: 1 }), null);
  assert.equal(parseSavedGame({ tiles: [{ id: 1, value: 3, row: 0, col: 0 }], score: 0, nextId: 2 }), null);
  assert.equal(parseSavedGame({ tiles: [{ id: 1, value: 2, row: 4, col: 0 }], score: 0, nextId: 2 }), null);
  assert.equal(
    parseSavedGame({ tiles: [{ id: 1, value: 2, row: 0, col: 0 }, { id: 2, value: 4, row: 0, col: 0 }], score: 0, nextId: 3 }),
    null,
  );
});
