// Monte Carlo tree search for Go, with RAVE (all-moves-as-first) to learn
// quickly from few playouts. It runs inside the Go web worker. It is the
// engine for capture games and the light engine for full games.

import {
  BLACK,
  KOMI,
  PASS,
  clonePosition,
  geometry,
  groupAt,
  isEyeOf,
  isLegal,
  isOver,
  opponent,
  playInPlace,
  scoreArea,
  singleLiberty,
  type Color,
  type Position,
} from "./logic";

export type Rng = () => number;

/** Small, fast, seedable random numbers (mulberry32). */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SearchLimits = { playouts: number; ms?: number };

export type SearchResult = {
  move: number;
  /** Chance that the side to move wins, 0..1, from its own search. */
  winrate: number;
  playouts: number;
};

// ---------------------------------------------------------------------------
// Playouts

/** Random but not silly: capture, escape atari, never fill an own eye. */
function playoutMove(pos: Position, rng: Rng, area: number): number {
  const { board, size } = pos;
  const me = pos.toPlay;
  const last = pos.lastMove;
  if (last !== null && last >= 0 && rng() < 0.9) {
    const geo = geometry(size);
    for (let i = last * 4, end = i + 4; i < end; i++) {
      const q = geo.nb[i];
      if (q < 0) continue;
      const lib = board[q] !== 0 ? singleLiberty(board, size, q) : -1;
      if (lib < 0 || !isLegal(pos, lib)) continue;
      // Take an enemy group in atari, or extend our own group out of atari.
      if (board[q] !== me) return lib;
      // After a legal move the group cannot have 0 liberties, so -1 means 2+.
      const test = clonePosition(pos);
      playInPlace(test, lib);
      if (singleLiberty(test.board, size, lib) === -1) return lib;
    }
  }
  const start = Math.floor(rng() * area);
  for (let k = 0; k < area; k++) {
    const p = (start + k) % area;
    if (board[p] !== 0 || p === pos.ko) continue;
    if (isEyeOf(pos, p, me)) continue;
    if (isLegal(pos, p)) return p;
  }
  return PASS;
}

/**
 * Plays random moves to the end. Returns the winner and, in `firstMover`,
 * the colour that first played each point (for RAVE).
 */
function playout(pos: Position, rng: Rng, firstMover: Int8Array, komi: number): Color {
  const area = pos.size * pos.size;
  const limit = pos.moveNumber + area * 3;
  while (!isOver(pos) && pos.moveNumber < limit) {
    const color = pos.toPlay;
    const move = playoutMove(pos, rng, area);
    if (move >= 0 && firstMover[move] === 0) firstMover[move] = color;
    playInPlace(pos, move);
  }
  if (pos.winner) return pos.winner;
  const score = scoreArea(pos.board, pos.size, [], pos.mode === "capture" ? 0.5 : komi);
  return score.black > score.white ? BLACK : opponent(BLACK);
}

// ---------------------------------------------------------------------------
// Tree

type Node = {
  move: number;
  /** Colour that played `move` to reach this node. */
  player: Color;
  parent: Node | null;
  children: Node[] | null;
  visits: number;
  wins: number;
  raveVisits: number;
  raveWins: number;
};

const RAVE_EQUIVALENCE = 600;
const EXPLORATION = 0.3;

function candidateMoves(pos: Position): number[] {
  const area = pos.size * pos.size;
  const moves: number[] = [];
  const opening = pos.size >= 13 && pos.moveNumber < area / 6;
  for (let p = 0; p < area; p++) {
    if (pos.board[p] !== 0 || !isLegal(pos, p) || isEyeOf(pos, p, pos.toPlay)) continue;
    if (opening) {
      // Skip the first line early in big games; it is never a good opening move.
      const x = p % pos.size;
      const y = (p - x) / pos.size;
      if (x === 0 || y === 0 || x === pos.size - 1 || y === pos.size - 1) continue;
    }
    moves.push(p);
  }
  // Passing is only worth considering in full games, and not in the opening.
  if (pos.mode === "full" && (moves.length === 0 || pos.moveNumber > area / 3 || pos.passes > 0)) moves.push(PASS);
  if (moves.length === 0) moves.push(PASS);
  return moves;
}

function score(child: Node, parentVisits: number, rng: Rng): number {
  const logN = Math.log(parentVisits + 1);
  if (child.visits === 0) {
    return child.raveVisits > 0 ? child.raveWins / child.raveVisits + 0.5 : 10 + rng();
  }
  const mean = child.wins / child.visits;
  const rave = child.raveVisits > 0 ? child.raveWins / child.raveVisits : mean;
  const beta = Math.sqrt(RAVE_EQUIVALENCE / (3 * child.visits + RAVE_EQUIVALENCE));
  return (1 - beta) * mean + beta * rave + EXPLORATION * Math.sqrt(logN / child.visits);
}

/** Searches from `root` and returns the most visited move. */
export function search(root: Position, limits: SearchLimits, rng: Rng, komi = KOMI): SearchResult {
  if (isOver(root)) return { move: PASS, winrate: 0.5, playouts: 0 };
  const tree: Node = { move: PASS, player: opponent(root.toPlay), parent: null, children: null, visits: 0, wins: 0, raveVisits: 0, raveWins: 0 };
  const area = root.size * root.size;
  const firstMover = new Int8Array(area);
  const started = Date.now();
  let done = 0;

  for (; done < limits.playouts; done++) {
    if (limits.ms !== undefined && (done & 31) === 0 && Date.now() - started > limits.ms) break;
    const pos = clonePosition(root);
    firstMover.fill(0);
    let node = tree;

    // Selection, expanding a node the second time it is reached.
    while (!isOver(pos)) {
      if (!node.children) {
        if (node.visits === 0 && node !== tree) break;
        node.children = candidateMoves(pos).map((move) => ({
          move,
          player: pos.toPlay,
          parent: node,
          children: null,
          visits: 0,
          wins: 0,
          raveVisits: 0,
          raveWins: 0,
        }));
      }
      let best = node.children[0];
      let bestScore = -Infinity;
      for (const child of node.children) {
        const s = score(child, node.visits, rng);
        if (s > bestScore) {
          bestScore = s;
          best = child;
        }
      }
      if (best.move >= 0 && firstMover[best.move] === 0) firstMover[best.move] = pos.toPlay;
      playInPlace(pos, best.move);
      node = best;
    }

    const winner = playout(pos, rng, firstMover, komi);

    // Back-propagation, with RAVE updates for siblings whose move the same
    // colour played first later in the game.
    for (let n: Node | null = node; n; n = n.parent) {
      n.visits++;
      if (n.player === winner) n.wins++;
      if (n.children) {
        for (const child of n.children) {
          if (child.move >= 0 && firstMover[child.move] === child.player) {
            child.raveVisits++;
            if (child.player === winner) child.raveWins++;
          }
        }
      }
    }
  }

  const children = tree.children ?? [];
  let best: Node | null = null;
  for (const child of children) if (!best || child.visits > best.visits) best = child;
  if (!best) return { move: PASS, winrate: 0.5, playouts: done };
  return { move: best.move, winrate: best.visits ? best.wins / best.visits : 0.5, playouts: done };
}

// ---------------------------------------------------------------------------
// Dead stones

/**
 * Guesses which stones are dead at the end of a game: playouts are run from
 * the final position and stones that usually end up in the other side's area
 * are marked dead, a whole group at a time.
 */
export function estimateDead(final: Position, rng: Rng, playouts = 200, komi = KOMI): number[] {
  const area = final.size * final.size;
  const owned = new Float64Array(area); // + for black, - for white
  const firstMover = new Int8Array(area);
  for (let i = 0; i < playouts; i++) {
    const pos = clonePosition(final);
    pos.passes = 0;
    pos.winner = 0;
    pos.mode = "full";
    pos.toPlay = i % 2 === 0 ? BLACK : opponent(BLACK);
    playout(pos, rng, firstMover, komi);
    const { owner } = scoreArea(pos.board, pos.size, [], komi);
    for (let p = 0; p < area; p++) owned[p] += owner[p] === BLACK ? 1 : owner[p] === 0 ? 0 : -1;
  }
  const dead: number[] = [];
  const seen = new Uint8Array(area);
  for (let p = 0; p < area; p++) {
    if (final.board[p] === 0 || seen[p]) continue;
    const group = groupAt(final.board, final.size, p);
    let sum = 0;
    for (const q of group) {
      seen[q] = 1;
      sum += owned[q];
    }
    const mine = (final.board[p] === BLACK ? sum : -sum) / (group.length * playouts);
    // Random playouts are noisy, so "more often theirs than ours" counts as dead.
    if (mine < -0.15) dead.push(...group);
  }
  return dead.sort((a, b) => a - b);
}
