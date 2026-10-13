// Turns KataGo network outputs into Tianwu's decisions: which move to play,
// whether to pass or resign, and which stones are dead at the end.
// Uses KataGo's human-style (SL) network, which predicts the move a human of a
// given rank would play, so each difficulty level is simply a rank.

import { PASS, groupAt, isLegal, replay, type Color, type Mode, type Position } from "../logic";
import { buildFeatures, buildMetadata } from "./features";
import type { Network } from "./network";

export type NetStyle = { rank: string; temperature: number };

export type Analysis = {
  position: Position;
  /** Move probabilities over every point then pass (index size²), 0 where illegal. */
  probs: Float64Array;
  /** Chance that the side to move wins. */
  winrate: number;
  /** Expected final score margin for the side to move (points, komi included). */
  score: number;
  /** Ownership per point in [-1, 1] for the side to move (+1 = theirs). */
  ownership: Float32Array;
};

/** The score mean head is stored divided by this (KataGo's scoreMeanMultiplier). */
const SCORE_MULTIPLIER = 20;

export function analyse(net: Network, size: number, mode: Mode, moves: readonly number[], rank: string): Analysis {
  const position = replay(size, mode, moves);
  if (!position) throw new Error("illegal move record");
  const { spatial, global } = buildFeatures(size, mode, moves);
  const out = net.evaluate({ size, spatial, global, meta: buildMetadata(rank, size * size) });
  const P = size * size;
  const probs = new Float64Array(P + 1);
  let max = -Infinity;
  const legal = (p: number) => (p === P ? isLegal(position, PASS) : isLegal(position, p));
  for (let p = 0; p <= P; p++) if (legal(p)) max = Math.max(max, out.policy[p]);
  let sum = 0;
  for (let p = 0; p <= P; p++) {
    if (!legal(p)) continue;
    probs[p] = Math.exp(out.policy[p] - max);
    sum += probs[p];
  }
  for (let p = 0; p <= P; p++) probs[p] /= sum;
  const v = [...out.value].map((x) => Math.exp(x));
  const vSum = v[0] + v[1] + v[2];
  const ownership = new Float32Array(P);
  for (let p = 0; p < P; p++) ownership[p] = Math.tanh(out.ownership[p]);
  return { position, probs, winrate: (v[0] + v[2] / 2) / vSum, score: out.scoreValue[0] * SCORE_MULTIPLIER, ownership };
}

/**
 * Samples a move the way a human of that rank might: the policy is sharpened
 * by `temperature` (1 = as is) and the unlikely tail (beyond 95% of the mass)
 * is cut so Tianwu never plays something absurd.
 */
export function chooseMove(analysis: Analysis, temperature: number, rng: () => number): number {
  const { probs } = analysis;
  const P = probs.length - 1;
  const weighted = [...probs].map((p, i) => ({ move: i === P ? PASS : i, w: p > 0 ? p ** (1 / temperature) : 0 }));
  weighted.sort((a, b) => b.w - a.w);
  const total = weighted.reduce((s, x) => s + x.w, 0);
  const kept: typeof weighted = [];
  let mass = 0;
  for (const item of weighted) {
    if (item.w <= 0) break;
    kept.push(item);
    mass += item.w / total;
    if (mass >= 0.95) break;
  }
  if (kept.length === 0) return PASS;
  const keptTotal = kept.reduce((s, x) => s + x.w, 0);
  let r = rng() * keptTotal;
  for (const item of kept) {
    r -= item.w;
    if (r <= 0) return item.move;
  }
  return kept[kept.length - 1].move;
}

/**
 * Stones whose group the network expects to end up as the opponent's
 * territory. `ownership` is from `perspective`'s point of view.
 */
export function deadStones(position: Position, ownership: Float32Array, perspective: Color): number[] {
  const { board, size } = position;
  const seen = new Uint8Array(board.length);
  const dead: number[] = [];
  for (let p = 0; p < board.length; p++) {
    if (board[p] === 0 || seen[p]) continue;
    const group = groupAt(board, size, p);
    let sum = 0;
    for (const q of group) {
      seen[q] = 1;
      sum += ownership[q];
    }
    const forOwner = (board[p] === perspective ? sum : -sum) / group.length;
    if (forOwner < -0.4) dead.push(...group);
  }
  return dead.sort((a, b) => a - b);
}
