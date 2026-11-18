// Tower of Hanoi rules. Pure functions, no React, so they are easy to test.
//
// Disks are numbered by size: 1 is the smallest, n the largest. Each peg
// lists its disks from bottom to top, so the top disk is the last item.

export const PEG_COUNT = 3;
export const MIN_DISKS = 3;
export const MAX_DISKS = 8;
export const DEFAULT_DISKS = 4;
/** All disks start on the left peg and must end on the right one. */
export const START_PEG = 0;
export const TARGET_PEG = 2;

export type Pegs = number[][];
export type Move = { from: number; to: number };

export type HanoiState = {
  disks: number;
  pegs: Pegs;
  moves: number;
  /** Earlier peg layouts, newest last, for undo. */
  history: Pegs[];
  won: boolean;
};

export const DISK_OPTIONS = Array.from({ length: MAX_DISKS - MIN_DISKS + 1 }, (_, i) => MIN_DISKS + i);

export function isDiskCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= MIN_DISKS && value <= MAX_DISKS;
}

/** Fewest moves that solve a tower of `disks` disks: 2^n - 1. */
export function minMoves(disks: number): number {
  return 2 ** disks - 1;
}

export function createGame(disks: number = DEFAULT_DISKS): HanoiState {
  if (!isDiskCount(disks)) throw new RangeError(`disks must be ${MIN_DISKS}..${MAX_DISKS}`);
  const pegs: Pegs = Array.from({ length: PEG_COUNT }, () => []);
  for (let size = disks; size >= 1; size--) pegs[START_PEG].push(size);
  return { disks, pegs, moves: 0, history: [], won: false };
}

export function topDisk(peg: readonly number[]): number | undefined {
  return peg[peg.length - 1];
}

const validPeg = (index: number) => Number.isInteger(index) && index >= 0 && index < PEG_COUNT;

/** A disk can go onto an empty peg or onto a larger disk. */
export function canMove(pegs: Pegs, from: number, to: number): boolean {
  if (!validPeg(from) || !validPeg(to) || from === to) return false;
  const disk = topDisk(pegs[from]);
  if (disk === undefined) return false;
  const below = topDisk(pegs[to]);
  return below === undefined || below > disk;
}

export function isSolved(pegs: Pegs, disks: number): boolean {
  return pegs[TARGET_PEG].length === disks;
}

/** Moves the top disk. Returns the same state when the move is not allowed. */
export function move(state: HanoiState, from: number, to: number): HanoiState {
  if (state.won || !canMove(state.pegs, from, to)) return state;
  const pegs = state.pegs.map((peg) => peg.slice());
  pegs[to].push(pegs[from].pop()!);
  return {
    ...state,
    pegs,
    moves: state.moves + 1,
    history: [...state.history, state.pegs],
    won: isSolved(pegs, state.disks),
  };
}

/** Takes back the last move. Undo counts as a move, so it cannot hide mistakes. */
export function undo(state: HanoiState): HanoiState {
  if (state.won || state.history.length === 0) return state;
  const pegs = state.history[state.history.length - 1];
  return { ...state, pegs, moves: state.moves + 1, history: state.history.slice(0, -1) };
}

/** Peg index of every disk, indexed by disk size (index 0 unused). */
function pegOfDisks(pegs: Pegs, disks: number): number[] {
  const where = new Array<number>(disks + 1).fill(-1);
  pegs.forEach((peg, index) => {
    for (const disk of peg) where[disk] = index;
  });
  return where;
}

/**
 * The first move of the shortest way from this layout to all disks on
 * `target`. Works from any legal layout, not only from the start, so it can
 * hint after the player has wandered off the optimal path.
 */
export function nextBestMove(pegs: Pegs, disks: number, target = TARGET_PEG): Move | null {
  const where = pegOfDisks(pegs, disks);
  // To put disk k on `goal`: if it is already there, solve the smaller ones
  // for the same goal; otherwise park disks 1..k-1 on the spare peg first.
  const step = (k: number, goal: number): Move | null => {
    if (k === 0) return null;
    if (where[k] === goal) return step(k - 1, goal);
    const spare = PEG_COUNT - where[k] - goal;
    return step(k - 1, spare) ?? { from: where[k], to: goal };
  };
  return step(disks, target);
}

/** Fewest moves still needed from this layout. */
export function movesLeft(pegs: Pegs, disks: number, target = TARGET_PEG): number {
  const where = pegOfDisks(pegs, disks);
  const count = (k: number, goal: number): number => {
    if (k === 0) return 0;
    if (where[k] === goal) return count(k - 1, goal);
    const spare = PEG_COUNT - where[k] - goal;
    return count(k - 1, spare) + 1 + minMoves(k - 1);
  };
  return count(disks, target);
}

/** Three stars for a perfect solve, two within half again the minimum. */
export function rating(moves: number, disks: number): 1 | 2 | 3 {
  const best = minMoves(disks);
  if (moves <= best) return 3;
  if (moves <= Math.ceil(best * 1.5)) return 2;
  return 1;
}
