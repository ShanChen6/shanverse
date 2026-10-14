// The work that can take a moment (making a board, finding a hint) behind
// one message API. It runs in a web worker
// (red-cliffs.worker.ts), or on the main thread if workers are unavailable.

import { generate } from "./generator";
import { nextMove } from "./solver";

export type EngineRequest =
  | { id: number; kind: "generate"; seed: number }
  | { id: number; kind: "hint"; board: number[]; torches: number };

export type EngineResponse =
  | { id: number; kind: "generated"; seed: number; board: number[]; solutionLength: number }
  | { id: number; kind: "hint"; cell: number | null; exact: boolean }
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
    }
  } catch (error) {
    return { id: request.id, kind: "error", message: error instanceof Error ? error.message : String(error) };
  }
}
