// Random boards that are known to be winnable with the 8 torches, and known
// not to be too easy:
// - the beam search found a solution of 4 to 8 clicks (so 8 torches are
//   enough: the solution is in hand), and
// - the exhaustive search proved no 1-, 2- or 3-click solution exists.
// Everything is seeded and deterministic (no time limits), so a seed always
// rebuilds the same board.

import { CELLS, MAX_STRENGTH, TORCHES, createRng, type Board } from "./logic";
import { canClear, findSolution } from "./solver";

export const MIN_CLICKS = 4;
export const MAX_CLICKS = TORCHES;

/**
 * Relative odds of each cell value: open water, then strengths 1 to 4.
 * Measured: about 45% of such boards land in the 4-8 click range, so a
 * board takes two or three tries (a few hundred milliseconds) on average.
 */
const WEIGHTS = [1, 2, 2, 2, 2];
const MAX_TRIES = 40;

export type Generated = {
  seed: number;
  board: number[];
  /** A known winning sequence, length MIN_CLICKS to MAX_CLICKS. */
  solution: number[];
  /** Boards rejected before this one, for tuning. */
  tries: number;
};

function randomBoard(random: () => number): number[] {
  const total = WEIGHTS.reduce((sum, w) => sum + w, 0);
  return Array.from({ length: CELLS }, () => {
    let roll = random() * total;
    for (let value = 0; value <= MAX_STRENGTH; value++) {
      roll -= WEIGHTS[value];
      if (roll < 0) return value;
    }
    return MAX_STRENGTH;
  });
}

/** Whether a board meets the rules above; returns its solution if so. */
export function qualify(board: Board): number[] | null {
  const solution = findSolution(board, MAX_CLICKS);
  if (!solution || solution.length < MIN_CLICKS) return null;
  if (canClear(board, MIN_CLICKS - 1)) return null;
  return solution;
}

/**
 * The board for a seed. Tries boards from the seed's random stream until one
 * qualifies; in the rare case none does, moves on to the next seed, and the
 * returned `seed` says which one was used.
 */
export function generate(seed: number): Generated {
  for (let offset = 0; ; offset++) {
    const used = (seed + offset) >>> 0;
    const random = createRng(used);
    for (let tries = 0; tries < MAX_TRIES; tries++) {
      const board = randomBoard(random);
      const solution = qualify(board);
      if (solution) return { seed: used, board, solution, tries };
    }
  }
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 32) >>> 0;
