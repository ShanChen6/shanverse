// Messages between the page and Tianwu's worker.
import { chooseMove, type Level } from "./ai";
import { replay, type Move } from "./logic";

export type EngineRequest = { id: number; kind: "move"; moves: Move[]; level: Level; seed: number };
export type EngineResponse = { id: number; kind: "move"; move: Move | null } | { id: number; kind: "error"; message: string };

export function handle(request: EngineRequest): EngineResponse {
  const { move } = chooseMove(replay(request.moves), request.level, request.seed);
  return { id: request.id, kind: "move", move };
}
