// Tianwu's brain for Cờ Việt Nam: iterative-deepening alpha-beta search over
// legal moves, with a material-and-position evaluation. Pure functions, so it
// runs the same in the web worker, on the main thread and in tests.

import {
  AREA,
  RANKS,
  advance,
  commandersFacing,
  pseudoMoves,
  legalMoves,
  opponent,
  rankOf,
  stackPieces,
  type Color,
  type Move,
  type PieceType,
  type Position,
} from "./logic";

export type Level = "easy" | "medium" | "hard";

/** Piece values, loosely after the scores in the original rulebook. */
export const VALUES: Record<PieceType, number> = {
  c: 0,
  h: 60,
  i: 10,
  m: 10,
  e: 12,
  t: 20,
  a: 30,
  g: 14,
  s: 22,
  f: 40,
  n: 60,
};

const HERO_BONUS = 8;
const MATE = 100_000;

type LevelSpec = { depth: number; timeMs: number; noise: number };
export const LEVELS: Record<Level, LevelSpec> = {
  // Looks one move ahead and plays loosely.
  easy: { depth: 1, timeMs: 400, noise: 14 },
  // Sees the reply to its move.
  medium: { depth: 2, timeMs: 1200, noise: 3 },
  // Searches deeper, as far as time allows.
  hard: { depth: 4, timeMs: 2500, noise: 0 },
};

/** Score of a position for `color`: material, heroes, advance towards the enemy, and HQ pressure. */
export function evaluate(pos: Position, color: Color): number {
  let score = 0;
  for (let s = 0; s < AREA; s++) {
    const stack = pos.board[s];
    if (!stack) continue;
    const owner = stack.carrier.color;
    const sign = owner === color ? 1 : -1;
    const forward = owner === "r" ? rankOf(s) : RANKS - 1 - rankOf(s);
    for (const piece of stackPieces(stack)) {
      let value = VALUES[piece.type] + (piece.hero ? HERO_BONUS : 0);
      // Mobile pieces gain a little for moving up the board.
      if (piece.type !== "h" && piece.type !== "c") value += forward * 0.4;
      score += sign * value;
    }
  }
  score += (pos.hqHold[color] - pos.hqHold[opponent(color)]) * 25;
  return score;
}

function victimValue(pos: Position, move: Move): number {
  if (move.kind === "move" || move.kind === "join") return 0;
  const target = pos.board[move.to];
  return target ? stackPieces(target).reduce((n, p) => n + VALUES[p.type] + (p.type === "c" ? 1000 : 0), 0) : 0;
}

/** Captures first, biggest prize first, so alpha-beta cuts more. */
function ordered(pos: Position, moves: Move[]): Move[] {
  return moves
    .map((move) => ({ move, key: victimValue(pos, move) + (move.kind === "strike" ? -20 : 0) }))
    .sort((a, b) => b.key - a.key)
    .map((entry) => entry.move);
}

class Timeout extends Error {}

type Search = { deadline: number; nodes: number };

const holdsCommander = (pos: Position, s: number, color: Color) => {
  const stack = pos.board[s];
  return !!stack && stack.carrier.color === color && stackPieces(stack).some((p) => p.type === "c");
};

/**
 * Inside the tree the search uses moves that ignore check, and treats taking
 * the enemy commander as the end of the game. A move that leaves your own
 * commander open is then refuted one ply later, which is far cheaper than
 * testing every move for legality. Only the root uses fully legal moves.
 */
function negamax(pos: Position, depth: number, alpha: number, beta: number, ply: number, search: Search): number {
  if ((++search.nodes & 255) === 0 && Date.now() > search.deadline) throw new Timeout();
  const me = pos.toMove;
  if (pos.result) {
    if (pos.result.winner === null) return 0;
    return pos.result.winner === me ? MATE - ply : -MATE + ply;
  }
  const moves = pseudoMoves(pos, me);
  const enemy = opponent(me);
  for (const move of moves) {
    if (move.kind !== "move" && move.kind !== "join" && holdsCommander(pos, move.to, enemy)) return MATE - ply;
  }
  if (depth <= 0) return evaluate(pos, me);
  let best = -MATE + ply;
  for (const move of ordered(pos, moves)) {
    const child = advance(pos, move);
    if (commandersFacing(child)) continue;
    const score = -negamax(child, depth - 1, -beta, -alpha, ply + 1, search);
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return best;
}

/** Small seeded random numbers, so a game can be replayed in tests. */
function random(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export type Choice = { move: Move | null; score: number; depth: number; nodes: number };

/** Picks Tianwu's move. Returns null when there is no legal move. */
export function chooseMove(pos: Position, level: Level, seed = 1, now: () => number = Date.now): Choice {
  const spec = LEVELS[level];
  const moves = legalMoves(pos);
  if (!moves.length) return { move: null, score: 0, depth: 0, nodes: 0 };
  const rand = random(seed);
  const search: Search = { deadline: now() + spec.timeMs, nodes: 0 };
  const noise = new Map(moves.map((m) => [m, (rand() - 0.5) * 2 * spec.noise]));

  let rootOrder = ordered(pos, moves);
  let bestMove = rootOrder[0];
  let bestScore = -Infinity;
  let reached = 0;
  for (let depth = 1; depth <= spec.depth; depth++) {
    try {
      let alpha = -Infinity; // best raw score so far
      let pick = -Infinity; // best score with noise
      let iterationBest = rootOrder[0];
      const scored: { move: Move; score: number }[] = [];
      for (const move of rootOrder) {
        // Moves within the noise margin of the best get exact scores.
        const raw = -negamax(advance(pos, move), depth - 1, -Infinity, -(alpha - 2 * spec.noise), 1, search);
        const score = raw + (Math.abs(raw) < MATE / 2 ? noise.get(move)! : 0);
        scored.push({ move, score });
        if (raw > alpha) alpha = raw;
        if (score > pick) {
          pick = score;
          iterationBest = move;
        }
      }
      bestMove = iterationBest;
      bestScore = pick;
      reached = depth;
      // Search the best moves first next time round.
      rootOrder = scored.sort((a, b) => b.score - a.score).map((entry) => entry.move);
      if (alpha > MATE / 2) break;
    } catch (error) {
      if (!(error instanceof Timeout)) throw error;
      break;
    }
  }
  return { move: bestMove, score: bestScore, depth: reached, nodes: search.nodes };
}
