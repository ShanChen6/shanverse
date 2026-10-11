// Breadth-first Sokoban solver. Used by the tests to prove every level can be
// solved and to measure its par (fewest moves). The game itself never loads it.

import { move, isSolved, stuckCrates, type Direction, type SokobanState } from "./logic";

const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

const keyOf = (state: SokobanState) => `${state.player}|${state.crates.slice().sort((a, b) => a - b).join(",")}`;

/** Fewest-moves solution, or null if none exists within `limit` explored states. */
export function solve(start: SokobanState, limit = 2_000_000): Direction[] | null {
  if (isSolved(start)) return [];
  const seen = new Map<string, { parent: string | null; direction: Direction | null }>();
  const startKey = keyOf(start);
  seen.set(startKey, { parent: null, direction: null });
  let frontier: SokobanState[] = [start];

  while (frontier.length && seen.size < limit) {
    const next: SokobanState[] = [];
    for (const state of frontier) {
      const parentKey = keyOf(state);
      for (const direction of DIRECTIONS) {
        const result = move(state, direction);
        if (!result.moved) continue;
        if (result.pushed && stuckCrates(result.state).length) continue;
        const key = keyOf(result.state);
        if (seen.has(key)) continue;
        seen.set(key, { parent: parentKey, direction });
        if (isSolved(result.state)) {
          const path: Direction[] = [];
          let cursor: string | null = key;
          while (cursor) {
            const entry = seen.get(cursor);
            if (!entry?.direction) break;
            path.push(entry.direction);
            cursor = entry.parent;
          }
          return path.reverse();
        }
        next.push(result.state);
      }
    }
    frontier = next;
  }
  return null;
}
