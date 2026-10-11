import assert from "node:assert/strict";
import test from "node:test";

import { MEMORY_LEVELS, createDeck, flip, hideMismatch, rating, shuffle, type MemoryState } from "./logic";
import { TECH_CARDS } from "./cards";

let seed = 7;
const seeded = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

/** A fixed, unshuffled deck: faces in order a,a,b,b,... */
function deck(faces: string[]): MemoryState {
  const cards = faces.map((face, id) => ({ id, face, matched: false, open: false }));
  return { cards, mismatch: null, moves: 0, matchedPairs: 0, pairs: faces.length / 2, won: false };
}

test("shuffle keeps every item", () => {
  const items = [1, 2, 3, 4, 5, 6];
  assert.deepEqual(shuffle(items, seeded).sort(), items);
  assert.deepEqual(items, [1, 2, 3, 4, 5, 6]);
});

test("createDeck deals each chosen face exactly twice", () => {
  for (const level of Object.values(MEMORY_LEVELS)) {
    const state = createDeck(TECH_CARDS.map((card) => card.id), level.pairs, seeded);
    assert.equal(state.cards.length, level.pairs * 2);
    const counts = new Map<string, number>();
    for (const card of state.cards) counts.set(card.face, (counts.get(card.face) ?? 0) + 1);
    assert.equal(counts.size, level.pairs);
    assert.ok([...counts.values()].every((n) => n === 2));
    assert.deepEqual(state.cards.map((c) => c.id), state.cards.map((_, i) => i));
  }
  assert.throws(() => createDeck(["a"], 2));
});

test("there are enough distinct tech cards for the hardest level", () => {
  assert.ok(TECH_CARDS.length >= MEMORY_LEVELS.hard.pairs);
  assert.equal(new Set(TECH_CARDS.map((c) => c.id)).size, TECH_CARDS.length);
});

test("a matching pair stays open and counts one move", () => {
  let state = deck(["a", "a", "b", "b"]);
  state = flip(state, 0);
  assert.equal(state.moves, 0);
  state = flip(state, 1);
  assert.equal(state.moves, 1);
  assert.equal(state.matchedPairs, 1);
  assert.ok(state.cards[0].matched && state.cards[1].matched);
  assert.equal(state.mismatch, null);
});

test("a mismatch is remembered until it is hidden", () => {
  let state = flip(flip(deck(["a", "a", "b", "b"]), 0), 2);
  assert.deepEqual(state.mismatch, [0, 2]);
  assert.ok(state.cards[0].open && state.cards[2].open);
  state = hideMismatch(state);
  assert.equal(state.mismatch, null);
  assert.ok(!state.cards[0].open && !state.cards[2].open);
});

test("flipping during a mismatch hides it first, without waiting", () => {
  let state = flip(flip(deck(["a", "a", "b", "b"]), 0), 2);
  state = flip(state, 1);
  assert.equal(state.cards[0].open, false);
  assert.equal(state.cards[2].open, false);
  assert.equal(state.cards[1].open, true);
  assert.equal(state.moves, 1);
});

test("open or matched cards cannot be flipped again", () => {
  const once = flip(deck(["a", "a", "b", "b"]), 0);
  assert.equal(flip(once, 0), once);
  const matched = flip(once, 1);
  assert.equal(flip(matched, 0).cards[0].matched, true);
});

test("matching every pair wins", () => {
  let state = deck(["a", "a", "b", "b"]);
  for (const id of [0, 1, 2, 3]) state = flip(state, id);
  assert.equal(state.won, true);
  assert.equal(state.moves, 2);
  assert.equal(flip(state, 0), state);
});

test("rating gives three stars for a near-perfect game", () => {
  assert.equal(rating({ moves: 8, pairs: 8 }), 3);
  assert.equal(rating({ moves: 12, pairs: 8 }), 3);
  assert.equal(rating({ moves: 18, pairs: 8 }), 2);
  assert.equal(rating({ moves: 30, pairs: 8 }), 1);
});
