// The work that can take a moment (making a board, finding a hint, proving
// a game is lost) behind one message API. It runs in a web worker
// (red-cliffs.worker.ts), or on the main thread if workers are unavailable.

import { generate } from "./generator";
import { exactSolution, nextMove, EXACT_LIMIT } from "./solver";

export type EngineRequest =
  | { id: number; kind: "generate"; seed: number }
  | { id: number; kind: "hint"; board: number[]; torches: number }
  /** Exhaustive "is there still a way to win?"; only for torches ≤ EXACT_LIMIT. */
  | { id: number; kind: "check"; board: number[]; torches: number };

export type EngineResponse =
  | { id: number; kind: "generated"; seed: number; board: number[]; solutionLength: number }
  | { id: number; kind: "hint"; cell: number | null; exact: boolean }
  | { id: number; kind: "check"; winnable: boolean }
  | { id: number; kind: "error"; message: string };

export function handle(request: EngineRequest): EngineResponse {
  try {
    switch (request.kind) {
      case "generate": {
        const game = generate(request.seed);
        return { id: request.id, kind: "generated", seed: game.seed, board: game.board, solutionLength: game.solution.length };
      }
      case "hint": {
        const { cell, exact } = nextMove(request.board, request.torches);
        return { id: request.id, kind: "hint", cell, exact };
      }
      case "check": {
        if (request.torches > EXACT_LIMIT) return { id: request.id, kind: "check", winnable: true };
        return { id: request.id, kind: "check", winnable: exactSolution(request.board, request.torches) !== null };
      }
    }
  } catch (error) {
    return { id: request.id, kind: "error", message: error instanceof Error ? error.message : String(error) };
  }
}
