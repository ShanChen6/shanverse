// Messages between the page and Tianwu's worker. Tianwu only ever receives
// its own side's View, never the full game state.

import { chooseAction, type Difficulty } from "./ai";
import type { Action, View } from "./rules";

export type EngineRequest = { id: number; kind: "move"; view: View; difficulty: Difficulty; seed: number };
export type EngineResponse = { id: number; kind: "move"; action: Action; ms: number } | { id: number; kind: "error"; message: string };

/** Lehmer generator, so a seed makes Tianwu's choice reproducible. */
export function seeded(seed: number): () => number {
  let s = Math.abs(Math.floor(seed)) % 2147483646 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function handle(request: EngineRequest): EngineResponse {
  try {
    const decision = chooseAction(request.view, request.difficulty, seeded(request.seed));
    return { id: request.id, kind: "move", action: decision.action, ms: decision.ms };
  } catch (error) {
    return { id: request.id, kind: "error", message: String(error) };
  }
}
