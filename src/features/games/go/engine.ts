// The Go engine behind Tianwu. It runs in a web worker (go.worker.ts), or on
// the main thread as a fallback. Requests carry the move list, so the engine
// rebuilds the exact position the player sees.
//
// Two brains:
// - "net": KataGo's human-style network (desktop, full rules). Each level is a
//   human rank, so Tianwu plays like a person of that strength.
// - "mcts": Monte Carlo tree search (capture games, phones, and the fallback).

import { KOMI, PASS, WHITE, isOver, replay, scoreArea, type BoardSize, type Color, type Mode, type Position } from "./logic";
import { analyse, chooseMove, deadStones, type NetStyle } from "./katago/player";
import type { Network } from "./katago/network";
import { createRng, estimateDead, search, type SearchLimits } from "./mcts";

export type Level = "easy" | "medium" | "hard";
export const LEVELS: Level[] = ["easy", "medium", "hard"];
export type Brain = "net" | "mcts";

/** The human rank Tianwu imitates at each level, and how freely he samples. */
export const NET_STYLES: Record<Level, NetStyle> = {
  easy: { rank: "15k", temperature: 1 },
  medium: { rank: "5k", temperature: 0.9 },
  hard: { rank: "2d", temperature: 0.6 },
};

type Common = { id: number; size: BoardSize; mode: Mode; moves: number[]; seed: number; brain: Brain };
export type EngineRequest =
  | (Common & { kind: "move"; level: Level })
  | (Common & { kind: "dead" })
  | { id: number; kind: "load-net"; url: string };

export type EngineResponse =
  | { id: number; kind: "move"; move: number; resign: boolean; winrate: number; brain: Brain }
  | { id: number; kind: "dead"; dead: number[] }
  | { id: number; kind: "net-progress"; loaded: number; total: number }
  | { id: number; kind: "net-ready"; name: string; simd: boolean }
  | { id: number; kind: "error"; message: string };

/** Thinking budget per level for the tree search. Bigger boards get more time. */
export function limitsFor(level: Level, size: number, mode: Mode): SearchLimits {
  const scale = size === 9 ? 1 : size === 13 ? 1.5 : 2;
  if (mode === "capture") {
    if (level === "easy") return { playouts: 250, ms: 600 };
    if (level === "medium") return { playouts: 3000, ms: 1200 * scale };
    return { playouts: 25000, ms: 2500 * scale };
  }
  if (level === "easy") return { playouts: 600, ms: 800 };
  if (level === "medium") return { playouts: 5000, ms: 1800 * scale };
  return { playouts: 30000, ms: 3500 * scale };
}

let network: Network | null = null;

export function setNetwork(net: Network | null) {
  network = net;
}

export function hasNetwork() {
  return network !== null;
}

/** Whether `color` is ahead once the dead stones are taken off. */
function isAhead(pos: Position, color: Color, dead: number[]): boolean {
  const score = scoreArea(pos.board, pos.size, dead, KOMI);
  return color === WHITE ? score.white > score.black : score.black > score.white;
}

function netMove(request: Extract<EngineRequest, { kind: "move" }>, net: Network): EngineResponse {
  const style = NET_STYLES[request.level];
  const analysis = analyse(net, request.size, request.mode, request.moves, style.rank);
  const pos = analysis.position;
  const area = pos.size * pos.size;
  const base = { id: request.id, kind: "move" as const, winrate: analysis.winrate, brain: "net" as const };
  // Hopeless: resign like a polite human would.
  if (analysis.winrate < 0.03 && pos.moveNumber > area * 0.4) return { ...base, move: PASS, resign: true };
  // The player passed: pass back when ahead, so the game can be counted.
  if (pos.passes === 1 && analysis.score > 0) return { ...base, move: PASS, resign: false };
  return { ...base, move: chooseMove(analysis, style.temperature, createRng(request.seed)), resign: false };
}

export function handle(request: EngineRequest): EngineResponse {
  if (request.kind === "load-net") return { id: request.id, kind: "error", message: "load-net is handled by the worker" };
  const pos = replay(request.size, request.mode, request.moves);
  if (!pos) return { id: request.id, kind: "error", message: "illegal move record" };
  const rng = createRng(request.seed);
  const net = request.brain === "net" && request.mode === "full" ? network : null;

  if (request.kind === "dead") {
    if (net) {
      const analysis = analyse(net, request.size, request.mode, request.moves, NET_STYLES.hard.rank);
      return { id: request.id, kind: "dead", dead: deadStones(pos, analysis.ownership, pos.toPlay) };
    }
    return { id: request.id, kind: "dead", dead: estimateDead(pos, rng, request.size === 19 ? 120 : 200) };
  }

  if (isOver(pos)) return { id: request.id, kind: "move", move: PASS, resign: false, winrate: 0.5, brain: "mcts" };
  if (net) return netMove(request, net);
  const me = pos.toPlay;

  // When the player has just passed in a full game, pass back if Tianwu is
  // already ahead: there is nothing left worth fighting for.
  if (pos.mode === "full" && pos.passes === 1 && pos.moveNumber > 10) {
    const dead = estimateDead(pos, rng, 120);
    if (isAhead(pos, me, dead)) return { id: request.id, kind: "move", move: PASS, resign: false, winrate: 0.9, brain: "mcts" };
  }

  const result = search(pos, limitsFor(request.level, pos.size, pos.mode), rng);
  const area = pos.size * pos.size;
  const resign = pos.mode === "full" && result.winrate < 0.04 && result.playouts >= 2000 && pos.moveNumber > area / 2;
  return { id: request.id, kind: "move", move: result.move, resign, winrate: result.winrate, brain: "mcts" };
}
