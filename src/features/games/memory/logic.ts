// Pure memory-match rules. No React, no DOM: everything here is unit-tested.

export type MemoryLevelId = "easy" | "medium" | "hard";

export type MemoryLevel = { id: MemoryLevelId; pairs: number; cols: number; mobileCols: number };

export const MEMORY_LEVELS: Record<MemoryLevelId, MemoryLevel> = {
  easy: { id: "easy", pairs: 6, cols: 4, mobileCols: 3 },
  medium: { id: "medium", pairs: 8, cols: 4, mobileCols: 4 },
  hard: { id: "hard", pairs: 12, cols: 6, mobileCols: 4 },
};

export type Card = { id: number; face: string; matched: boolean; open: boolean };

export type MemoryState = {
  cards: Card[];
  /** Two open cards that did not match, waiting to be turned back. */
  mismatch: [number, number] | null;
  moves: number;
  matchedPairs: number;
  pairs: number;
  won: boolean;
};

export type Random = () => number;

export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Deals `pairs` random faces twice each, shuffled. */
export function createDeck(faces: readonly string[], pairs: number, random: Random = Math.random): MemoryState {
  if (pairs > faces.length) throw new Error("Not enough faces for that many pairs");
  const chosen = shuffle(faces, random).slice(0, pairs);
  const cards = shuffle([...chosen, ...chosen], random).map((face, id) => ({ id, face, matched: false, open: false }));
  return { cards, mismatch: null, moves: 0, matchedPairs: 0, pairs, won: false };
}

/** Turns a mismatched pair back face down. */
export function hideMismatch(state: MemoryState): MemoryState {
  if (!state.mismatch) return state;
  const [a, b] = state.mismatch;
  const cards = state.cards.map((card) => (card.id === a || card.id === b ? { ...card, open: false } : card));
  return { ...state, cards, mismatch: null };
}

/**
 * Flips one card. Flipping while a mismatch is showing turns that pair back
 * first, so fast players never have to wait for the timeout.
 */
export function flip(state: MemoryState, id: number): MemoryState {
  if (state.won) return state;
  let current = state.mismatch ? hideMismatch(state) : state;
  const card = current.cards[id];
  if (!card || card.open || card.matched) return current;

  const openUnmatched = current.cards.filter((c) => c.open && !c.matched);
  let cards = current.cards.map((c) => (c.id === id ? { ...c, open: true } : c));

  if (openUnmatched.length === 0) return { ...current, cards };

  const other = openUnmatched[0];
  const moves = current.moves + 1;
  if (other.face === card.face) {
    cards = cards.map((c) => (c.id === id || c.id === other.id ? { ...c, matched: true } : c));
    const matchedPairs = current.matchedPairs + 1;
    current = { ...current, cards, moves, matchedPairs, won: matchedPairs === current.pairs };
    return current;
  }
  return { ...current, cards, moves, mismatch: [other.id, id] };
}

/** Stars for the result: fewer extra moves, more stars. */
export function rating(state: Pick<MemoryState, "moves" | "pairs">): 1 | 2 | 3 {
  const extra = state.moves - state.pairs;
  if (extra <= Math.ceil(state.pairs * 0.5)) return 3;
  if (extra <= state.pairs * 1.25) return 2;
  return 1;
}
