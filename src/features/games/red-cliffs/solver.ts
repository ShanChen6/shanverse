// Two searches over click sequences, both built on `fire`:
//
// - canClear: exhaustive. Answers "can this board be cleared in at most n
//   clicks?" for certain. Cheap for n ≤ 3 (at most 36³ sequences, far fewer
//   after merging equal boards), so it proves a board is not too easy and
//   tells the player for sure when a game is lost.
// - findSolution: beam search. Finds a winning sequence quickly but cannot
//   prove there is none, so "not found" only means "not found".
//
// Both are deterministic: the same board always gives the same answer.

import { boardKey, fire, isCleared, liveCells, shipsLeft, totalStrength, type Board } from "./logic";

/**
 * A sequence of at most `clicks` clicks that clears the board, or null if
 * none exists. Exhaustive, so null is a proof. Meant for small `clicks`.
 */
export function exactSolution(board: Board, clicks: number): number[] | null {
  // Boards already shown to need more than k clicks, per k.
  const failed = new Map<string, number>();
  const search = (state: Board, left: number): number[] | null => {
    if (isCleared(state)) return [];
    if (left === 0) return null;
    const key = boardKey(state);
    if ((failed.get(key) ?? -1) >= left) return null;
    for (const cell of liveCells(state)) {
      const rest = search(fire(state, cell).board, left - 1);
      if (rest) return [cell, ...rest];
    }
    failed.set(key, left);
    return null;
  };
  return search(board, clicks);
}

/** True if some sequence of at most `clicks` clicks clears the board. Exhaustive. */
export const canClear = (board: Board, clicks: number) => exactSolution(board, clicks) !== null;

/** Up to this many torches left, hints and "no way to win" are exact. */
export const EXACT_LIMIT = 3;

/**
 * The best next click with `torches` left, or null. Exact (null is a proof
 * that the game is lost) when torches ≤ EXACT_LIMIT; otherwise a beam search
 * (null only means none was found).
 */
export function nextMove(board: Board, torches: number): { cell: number | null; exact: boolean } {
  if (torches <= EXACT_LIMIT) {
    const path = exactSolution(board, torches);
    return { cell: path?.[0] ?? null, exact: true };
  }
  const path = findSolution(board, torches, { beamWidth: 600 }) ?? exactSolution(board, EXACT_LIMIT);
  return { cell: path?.[0] ?? null, exact: false };
}

export type SearchOptions = {
  /** Boards kept per depth. Wider finds more solutions and costs more. */
  beamWidth?: number;
};

type Node = { board: number[]; path: number[]; score: number };

/**
 * How promising a board is, lower being better: what is left to burn, with
 * a bonus for ships one hit from sinking next to other ships (chain fuel).
 */
function score(board: Board): number {
  let fuel = 0;
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== 1) continue;
    const x = i % 6;
    if (x > 0 && board[i - 1] > 0) fuel++;
    if (x < 5 && board[i + 1] > 0) fuel++;
    if (i >= 6 && board[i - 6] > 0) fuel++;
    if (i < 30 && board[i + 6] > 0) fuel++;
  }
  return totalStrength(board) * 4 + shipsLeft(board) * 2 - fuel;
}

/**
 * A winning click sequence of at most `maxClicks`, or null if the beam found
 * none (which does not prove there is none).
 */
export function findSolution(board: Board, maxClicks: number, options: SearchOptions = {}): number[] | null {
  const beamWidth = options.beamWidth ?? 300;
  if (isCleared(board)) return [];
  let layer: Node[] = [{ board: board.slice(), path: [], score: score(board) }];
  for (let depth = 1; depth <= maxClicks && layer.length; depth++) {
    const seen = new Set<string>();
    const next: Node[] = [];
    for (const node of layer) {
      for (const cell of liveCells(node.board)) {
        const after = fire(node.board, cell).board;
        if (isCleared(after)) return [...node.path, cell];
        const key = boardKey(after);
        if (seen.has(key)) continue;
        seen.add(key);
        next.push({ board: after, path: [...node.path, cell], score: score(after) });
      }
    }
    next.sort((a, b) => a.score - b.score);
    layer = next.slice(0, beamWidth);
  }
  return null;
}
