// Pure rules of Hoả thiêu Xích Bích. No React, no DOM: everything here is
// unit-tested, and the solver calls `fire` hundreds of thousands of times, so
// it works on flat arrays.
//
// The board is 6×6. Each cell holds a ship's strength:
//   4 safe · 3 smoking · 2 burning · 1 burnt out · 0 sunk (open water)
// A torch that hits a ship takes one step off it. A ship hit at 1 sinks and
// fires four torches up, down, left and right.
//
// Torches fly one cell per tick, skip open water and hit the first ship in
// their way; one that leaves the board is lost. Torches reaching the same
// cell on the same tick are handled one by one: older torches first, then
// up, down, left, right. When a ship sinks, torches still arriving at its
// cell that tick fly straight through. A sunk ship's torches start moving
// on the next tick.

export const SIZE = 6;
export const CELLS = SIZE * SIZE;
export const TORCHES = 8;
export const MAX_STRENGTH = 4;

/** Ship strengths, one per cell, row by row. 0 is open water. */
export type Board = readonly number[];

export type Direction = 0 | 1 | 2 | 3;
/** In priority order: up, down, left, right. */
export const DIRECTIONS: readonly Direction[] = [0, 1, 2, 3];
const DX = [0, 0, -1, 1];
const DY = [-1, 1, 0, 0];

/** A torch in flight. `origin` (the cell it was launched from) and `direction` identify it. */
export type FlyingTorch = { x: number; y: number; direction: Direction; origin: number };

/** What happened on one tick, for the animation. Tick 0 is the click itself. */
export type Frame = {
  tick: number;
  /** The board after this tick. */
  board: number[];
  /** Torches still in flight after this tick, at their new positions. */
  torches: FlyingTorch[];
  /** Torches that flew into a ship this tick, at the ship's cell. They are spent. */
  strikes: FlyingTorch[];
  /** Cells hit this tick, in order. */
  hits: number[];
  /** Cells whose ship sank this tick. */
  sunk: number[];
};

export type FireResult = {
  board: number[];
  /** Ships sunk by this click, including the chain. */
  sunk: number;
  /** One frame per tick, only when asked for. */
  frames: Frame[];
};

type Torch = { x: number; y: number; direction: Direction; launched: number; origin: number };

export const shipsLeft = (board: Board) => board.reduce((n, strength) => n + (strength > 0 ? 1 : 0), 0);
export const isCleared = (board: Board) => board.every((strength) => strength === 0);
export const totalStrength = (board: Board) => board.reduce((n, strength) => n + strength, 0);

/**
 * Throws one torch at `cell` and plays out every chain it sets off. Returns
 * the board afterwards. Clicking open water is a no-op (and should not cost
 * a torch). Pass `record` to get per-tick frames for the animation.
 */
export function fire(start: Board, cell: number, record = false): FireResult {
  const board = start.slice();
  const frames: Frame[] = [];
  if (board[cell] <= 0) return { board, sunk: 0, frames };

  let sunk = 0;
  let waiting: Torch[] = [];
  const launch = (at: number, tick: number) => {
    const x = at % SIZE;
    const y = (at - x) / SIZE;
    for (const direction of DIRECTIONS) waiting.push({ x, y, direction, launched: tick, origin: at });
  };

  board[cell] -= 1;
  const firstSunk = board[cell] === 0;
  if (firstSunk) {
    sunk++;
    launch(cell, 0);
  }
  if (record) frames.push({ tick: 0, board: board.slice(), torches: [], strikes: [], hits: [cell], sunk: firstSunk ? [cell] : [] });

  let flying: Torch[] = [];
  for (let tick = 1; waiting.length || flying.length; tick++) {
    // Torches launched last tick join the flight. Keep the list in priority
    // order: older launches first, then up, down, left, right. Torches from
    // the same tick and direction come from different cells, so they never
    // reach the same cell together and their order does not matter.
    flying = flying.concat(waiting);
    waiting = [];
    flying.sort((a, b) => a.launched - b.launched || a.direction - b.direction);

    const still: Torch[] = [];
    const hits: number[] = [];
    const strikes: FlyingTorch[] = [];
    const sunkNow: number[] = [];
    for (const torch of flying) {
      const x = torch.x + DX[torch.direction];
      const y = torch.y + DY[torch.direction];
      if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) continue; // left the board
      const at = y * SIZE + x;
      if (board[at] > 0) {
        board[at] -= 1;
        if (record) {
          hits.push(at);
          strikes.push({ x, y, direction: torch.direction, origin: torch.origin });
        }
        if (board[at] === 0) {
          sunk++;
          if (record) sunkNow.push(at);
          launch(at, tick);
        }
        continue; // the torch is spent
      }
      still.push({ ...torch, x, y });
    }
    flying = still;
    if (record) {
      frames.push({
        tick,
        board: board.slice(),
        torches: flying.map(({ x, y, direction, origin }) => ({ x, y, direction, origin })),
        strikes,
        hits,
        sunk: sunkNow,
      });
    }
  }
  return { board, sunk, frames };
}

/** Cells that still hold a ship, i.e. the moves worth trying. */
export const liveCells = (board: Board) => {
  const cells: number[] = [];
  for (let i = 0; i < board.length; i++) if (board[i] > 0) cells.push(i);
  return cells;
};

/** A compact key for a board, for de-duplicating states. */
export const boardKey = (board: Board) => board.join("");

export function parseBoard(text: string): number[] {
  const digits = text.replace(/\s+/g, "");
  if (!/^[0-4]{36}$/.test(digits)) throw new Error("A board is 36 digits from 0 to 4");
  return Array.from(digits, Number);
}

/** Small, fast seeded random numbers (mulberry32), so a seed rebuilds its board. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
