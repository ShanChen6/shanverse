// Tianwu, the opponent. It reads only a View (what its side can see, from
// viewFor), never the true game state, so it cannot peek at face-down
// monsters. To decide a move it:
//
// 1. Guesses who the hidden enemies are: each face-down monster gets an
//    identity matching its shown level (a face-down "level 3" may be a Fox
//    Spirit in disguise), with one monster per level and none twice. Several
//    such guesses ("worlds") are drawn.
// 2. Searches each world as an ordinary full-information game: look a few
//    moves ahead (minimax with alpha-beta), keeping only the most promising
//    moves at deeper plies so it stays fast.
// 3. Plays the move with the best average over the worlds.
//
// Easy looks one move ahead in one world and sometimes plays loosely;
// Medium looks two moves ahead in four worlds; Hard three moves ahead in
// more worlds, within a time budget.

import { LEVELS, MONSTERS, activeAbility, monster, type Monster } from "./monsters";
import { MAX_LEVEL, MAX_TURNS, apply, legalActions, reach, type Action, type GameState, type Side, type Unit, type View } from "./rules";

export type Difficulty = "easy" | "medium" | "hard";
export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export type AiOptions = {
  /** Worlds (guesses about hidden enemies) to search. */
  worlds?: number;
  /** Plies to look ahead: 1 = my move only, 2 = and the reply, 3 = and my next move. */
  depth?: number;
  /** Moves kept at each ply after the first (the rest are dropped by a quick score). */
  width?: number;
  /** Stop starting new worlds after this long, in milliseconds. */
  timeMs?: number;
  /** Chance of playing a random reasonable move instead (Easy). */
  looseness?: number;
};

export const PRESETS: Record<Difficulty, Required<AiOptions>> = {
  easy: { worlds: 1, depth: 1, width: 99, timeMs: 400, looseness: 0.3 },
  medium: { worlds: 4, depth: 2, width: 16, timeMs: 1200, looseness: 0 },
  hard: { worlds: 6, depth: 3, width: 8, timeMs: 1400, looseness: 0 },
};

// --- 1. Guessing hidden monsters --------------------------------------------------

/**
 * The monsters a face-down enemy could be, from what can be seen: its shown
 * level minus its (public) evolutions. A shown level that matches a Fox
 * Spirit's disguise could also be a Fox Spirit.
 */
export function candidatesFor(shownBase: number, roster: readonly Monster[] = MONSTERS): string[] {
  const out = roster.filter((m) => m.level === shownBase && !m.abilities.some((a) => a.kind === "fake-level")).map((m) => m.id);
  for (const m of roster) {
    const fake = m.abilities.find((a) => a.kind === "fake-level");
    if (fake && fake.kind === "fake-level" && fake.shown === shownBase) out.push(m.id);
  }
  return out;
}

/**
 * One consistent guess for every face-down enemy: identities fit their shown
 * levels, and with the known enemies the team still has at most one monster
 * per level and no monster twice. Returns null if nothing fits (it always
 * should, but callers fall back gracefully).
 */
export function guessHidden(view: View, random: () => number): Map<number, string> | null {
  const enemies = view.units.filter((u) => u.side !== view.me);
  const known = enemies.filter((u) => u.monster !== null);
  const hidden = enemies.filter((u) => u.monster === null);
  const usedLevels = new Set(known.map((u) => monster(u.monster as string).level));
  const usedIds = new Set(known.map((u) => u.monster as string));
  const options = hidden.map((u) => shuffle(candidatesFor(u.level - u.evolved), random));
  // Most constrained first.
  const order = hidden.map((_, i) => i).sort((a, b) => options[a].length - options[b].length);
  const pick = new Map<number, string>();
  const search = (k: number): boolean => {
    if (k === order.length) return true;
    const i = order[k];
    for (const id of options[i]) {
      const level = monster(id).level;
      if (usedIds.has(id) || usedLevels.has(level)) continue;
      usedIds.add(id);
      usedLevels.add(level);
      pick.set(hidden[i].id, id);
      if (search(k + 1)) return true;
      usedIds.delete(id);
      usedLevels.delete(level);
      pick.delete(hidden[i].id);
    }
    return false;
  };
  return search(0) ? pick : null;
}

/** A full game state from the view, with hidden enemies filled in by a guess. */
export function worldFrom(view: View, guess: Map<number, string>): GameState {
  const units: Unit[] = view.units.map((u) => {
    const id = u.monster ?? guess.get(u.id) ?? fallbackFor(u.level - u.evolved);
    return { id: u.id, side: u.side, monster: id, level: Math.min(MAX_LEVEL, monster(id).level + u.evolved), cell: u.cell, revealed: u.revealed, abilityUsed: u.abilityUsed };
  });
  const { me: _me, units: _units, ...rest } = view;
  return { ...rest, terrain: view.terrain.slice(), templeOwner: view.templeOwner.slice(), units };
}

const fallbackFor = (level: number) => (MONSTERS.find((m) => m.level === Math.max(1, Math.min(5, level))) as Monster).id;

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// --- 2. Judging a position --------------------------------------------------------

const LEVEL_VALUE = [0, 10, 20, 34, 50, 70, 92];
const WIN = 100_000;

/** What one monster is worth: mostly its level, a little for strength, reach and an unused ability. */
function unitValue(u: Unit): number {
  const m = monster(u.monster);
  let value = LEVEL_VALUE[Math.min(u.level, MAX_LEVEL)] + m.melee * 0.8;
  if (m.ranged) value += 2 + m.ranged.range;
  if (activeAbility(m) && !u.abilityUsed) value += 3;
  if (!u.revealed) value += 1.5; // being unknown to the opponent is worth something
  return value;
}

/**
 * The position from `side`'s point of view: material, then a pull toward its
 * own unused temple and toward the enemy, so quiet positions still have a
 * direction. Wins and losses dominate everything.
 */
export function evaluate(state: GameState, side: Side): number {
  if (state.winner !== null) return state.winner === "draw" ? 0 : state.winner === side ? WIN - state.turn : -WIN + state.turn;
  let score = 0;
  const temples = state.terrain.map((t, cell) => (t === "temple" ? cell : -1)).filter((cell) => cell >= 0);
  for (const u of state.units) {
    const sign = u.side === side ? 1 : -1;
    score += sign * unitValue(u);
    const temple = temples.find((cell) => state.templeOwner[cell] === u.side);
    if (temple !== undefined && u.level < MAX_LEVEL) score += sign * Math.max(0, 6 - reach(u.cell, temple)) * 0.6;
  }
  // Late in the game the turn-limit tie-break (total level) starts to matter.
  if (state.turn > MAX_TURNS - 12) {
    const total = (s: Side) => state.units.filter((u) => u.side === s).reduce((n, u) => n + u.level, 0);
    score += (total(side) - total(side === 0 ? 1 : 0)) * 4;
  }
  return score;
}

// --- 3. Searching -----------------------------------------------------------------

/**
 * Actions worth searching. A flood that can cover several cells has many
 * combinations; keep a few. Passing is kept (sometimes waiting is right).
 */
export function candidateActions(state: GameState): Action[] {
  const all = legalActions(state);
  const out: Action[] = [];
  const floods = new Map<number, number>();
  for (const action of all) {
    if (action.kind === "ability" && action.cells.length > 1) {
      const seen = floods.get(action.unit) ?? 0;
      if (seen >= 4) continue;
      floods.set(action.unit, seen + 1);
    }
    out.push(action);
  }
  return out;
}

/** Captures and shots first, so alpha-beta cuts early. */
function orderKey(state: GameState, action: Action): number {
  if (action.kind === "shoot") return 2;
  if (action.kind === "move") return state.units.some((u) => u.cell === action.to) ? 3 : 0;
  if (action.kind === "ability") return 1;
  return -1;
}

type SearchContext = { root: Side; width: number; deadline: number; nodes: number };

function search(state: GameState, depth: number, alpha: number, beta: number, ctx: SearchContext): number {
  ctx.nodes++;
  if (depth === 0 || state.winner !== null) return evaluate(state, ctx.root);
  const maximizing = state.toMove === ctx.root;
  let actions = candidateActions(state);
  // Last ply: score every child once and take the best, no need to prune first.
  if (depth === 1) {
    let best = maximizing ? -Infinity : Infinity;
    for (const action of actions) {
      ctx.nodes++;
      const value = evaluate(apply(state, action).state, ctx.root);
      best = maximizing ? Math.max(best, value) : Math.min(best, value);
    }
    return best;
  }
  // Keep the most promising moves by a one-step score.
  if (actions.length > ctx.width) {
    const scored = actions.map((action) => ({ action, score: evaluate(apply(state, action).state, ctx.root) }));
    scored.sort((a, b) => (maximizing ? b.score - a.score : a.score - b.score));
    actions = scored.slice(0, ctx.width).map((s) => s.action);
  } else {
    actions.sort((a, b) => orderKey(state, b) - orderKey(state, a));
  }
  let best = maximizing ? -Infinity : Infinity;
  for (const action of actions) {
    const value = search(apply(state, action).state, depth - 1, alpha, beta, ctx);
    if (maximizing) {
      best = Math.max(best, value);
      alpha = Math.max(alpha, value);
    } else {
      best = Math.min(best, value);
      beta = Math.min(beta, value);
    }
    if (beta <= alpha) break;
  }
  return best;
}

const sameAction = (a: Action, b: Action) => JSON.stringify(a) === JSON.stringify(b);

export type Decision = { action: Action; worlds: number; nodes: number; ms: number };

/**
 * Tianwu's move. Takes only the view of its own side. `random` makes it
 * reproducible in tests; `now` is injectable for the same reason.
 */
export function chooseAction(view: View, difficulty: Difficulty, random: () => number, overrides: AiOptions = {}, now: () => number = () => Date.now()): Decision {
  const options = { ...PRESETS[difficulty], ...overrides };
  const started = now();
  const deadline = started + options.timeMs;
  // The move list is the same in every world: it depends only on Tianwu's own monsters and the board.
  const firstWorld = worldFrom(view, guessHidden(view, random) ?? new Map());
  const rootActions = candidateActions(firstWorld);
  if (rootActions.length === 1) return { action: rootActions[0], worlds: 0, nodes: 0, ms: 0 };

  const totals = new Map<number, number>();
  let worlds = 0;
  let nodes = 0;
  for (let w = 0; w < options.worlds; w++) {
    if (w > 0 && now() > deadline) break;
    const world = w === 0 ? firstWorld : worldFrom(view, guessHidden(view, random) ?? new Map());
    const ctx: SearchContext = { root: view.me, width: options.width, deadline, nodes: 0 };
    rootActions.forEach((action, i) => {
      const value = search(apply(world, action).state, options.depth - 1, -Infinity, Infinity, ctx);
      totals.set(i, (totals.get(i) ?? 0) + value);
    });
    nodes += ctx.nodes;
    worlds++;
  }

  const ranked = rootActions.map((action, i) => ({ action, score: (totals.get(i) ?? -Infinity) / Math.max(1, worlds) })).sort((a, b) => b.score - a.score);
  let choice = ranked[0];
  // Easy sometimes plays a looser move: a random one among the better half,
  // but never one that throws away a won position.
  if (options.looseness > 0 && random() < options.looseness && ranked.length > 2) {
    const pool = ranked.slice(0, Math.max(2, Math.ceil(ranked.length / 2))).filter((r) => r.score > -WIN / 2);
    if (pool.length) choice = pool[Math.floor(random() * pool.length)];
  }
  // Prefer doing something to passing when it is no worse.
  if (choice.action.kind === "pass") {
    const alternative = ranked.find((r) => r.action.kind !== "pass" && r.score >= choice.score);
    if (alternative) choice = alternative;
  }
  if (!rootActions.some((a) => sameAction(a, choice.action))) throw new Error("Tianwu chose a move it did not have");
  return { action: choice.action, worlds, nodes, ms: now() - started };
}

/** Tianwu's team: a random legal one from the whole roster (it always has every monster). */
export function tianwuTeam(random: () => number): string[] {
  return LEVELS.map((level) => {
    const options = MONSTERS.filter((m) => m.level === level);
    return options[Math.floor(random() * options.length)].id;
  });
}
