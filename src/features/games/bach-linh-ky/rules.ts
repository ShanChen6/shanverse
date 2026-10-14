// Pure rules of Bách Linh Kỳ. No React, no DOM, no randomness (callers pass
// a random function where one is needed): everything here is unit-tested,
// and Tianwu's search will call these functions many times.
//
// Board: 8×8, cell = y * 8 + x. Side 0 (the player) starts on rows 6-7 at
// the bottom, side 1 (Tianwu) on rows 0-1 at the top.
//
// A turn is one action by one monster: move (moving onto an enemy is a melee
// attack), shoot (ranged attack), use its once-per-game ability, or pass.
// Battles compare levels, adjusted by terrain, the five elements (khắc +1,
// sinh +1 for a defender; see monsters.ts) and đánh úp (+1 for attacking a
// face-down monster).
// Monsters are face down until they fight or use their ability; their level
// is always shown (a Fox Spirit shows a false one). viewFor() gives what one
// side can see, and that is all Tianwu is allowed to look at.

import { ELEMENT_TERRAIN, MAP_BY_ID, SIZE, buildBoard, type Terrain } from "./maps";
import { FEEDS, LEVELS, OVERCOMES, activeAbility, areRivals, arePartners, hasAbility, monster, type Ability, type Monster } from "./monsters";

export type Side = 0 | 1;
export const MAX_TURNS = 80;
export const MAX_LEVEL = 6;
export const CELLS = SIZE * SIZE;

export type Unit = {
  id: number;
  side: Side;
  monster: string;
  /** Current level, including temple evolutions (up to MAX_LEVEL). */
  level: number;
  cell: number;
  revealed: boolean;
  abilityUsed: boolean;
  /** Bound (cannot act) while the game's turn counter is below this. */
  boundUntil?: number;
  /** Sealed by Cao Biền: every ability is gone for good. */
  sealed?: boolean;
  /** A Phoenix that has already come back once. */
  revived?: boolean;
};

export type GameState = {
  mapId: string;
  terrain: Terrain[];
  templeOwner: (Side | null)[];
  /** Monsters still on the board. */
  units: Unit[];
  /** Monsters that have fallen, oldest first (a recall brings one back). */
  fallen?: Unit[];
  toMove: Side;
  /** Actions taken so far, both sides together. */
  turn: number;
  winner: Side | "draw" | null;
};

export type Action =
  | { kind: "move"; unit: number; to: number }
  | { kind: "shoot"; unit: number; target: number }
  | { kind: "ability"; unit: number; cells: number[] }
  | { kind: "pass" };

export type BattleResult = "attacker" | "defender" | "both" | "none" | "blocked";

export type GameEvent =
  | { type: "move"; unit: number; from: number; to: number }
  | { type: "battle"; kind: "melee" | "ranged"; attacker: number; defender: number; result: BattleResult; levels: { attacker: number; defender: number } }
  | { type: "reveal"; unit: number }
  | { type: "evolve"; unit: number; level: number }
  | { type: "terraform"; unit: number; cells: number[]; to: "river" | "mountain" }
  | { type: "bind"; unit: number; target: number; until: number }
  | { type: "seal"; unit: number; target: number }
  | { type: "swap"; unit: number; other: number; from: number; to: number }
  | { type: "revive"; unit: number; cell: number }
  | { type: "recall"; unit: number; by: number; cell: number }
  | { type: "pass"; side: Side }
  | { type: "end"; winner: Side | "draw"; reason: "eliminated" | "turns" };

// --- Geometry ---------------------------------------------------------------

export const xOf = (cell: number) => cell % SIZE;
export const yOf = (cell: number) => Math.floor(cell / SIZE);
export const cellAt = (x: number, y: number) => (x < 0 || y < 0 || x >= SIZE || y >= SIZE ? -1 : y * SIZE + x);
/** Distance where a diagonal step counts as one: used for ranged reach and ability radius. */
export const reach = (a: number, b: number) => Math.max(Math.abs(xOf(a) - xOf(b)), Math.abs(yOf(a) - yOf(b)));

const ORTHOGONAL: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
const ALL_DIRECTIONS: [number, number][] = [...ORTHOGONAL, [-1, -1], [1, -1], [-1, 1], [1, 1]];

/** Rows a side places its monsters on. */
export const homeRows = (side: Side) => (side === 0 ? [SIZE - 2, SIZE - 1] : [0, 1]);

// --- Setup -------------------------------------------------------------------

export type Placement = { monster: string; cell: number }[];

/** Problems with a team, empty when it is five different monsters, one per level. */
export function teamProblems(monsters: readonly string[]): string[] {
  const problems: string[] = [];
  if (monsters.length !== LEVELS.length) problems.push(`a team has ${LEVELS.length} monsters`);
  if (new Set(monsters).size !== monsters.length) problems.push("a monster appears twice");
  const levels = monsters.map((id) => monster(id).level).sort();
  if (levels.join() !== LEVELS.join()) problems.push("a team has exactly one monster of each level");
  return problems;
}

/** Ground a monster may be placed on at the start (and put back on by a rebirth or a recall). */
export const canPlaceOn = (terrain: Terrain) => terrain === "plain" || terrain === "shrine" || terrain === "ore" || terrain === "forest" || terrain === "mound";

export function placementProblems(side: Side, placement: Placement, terrain: readonly Terrain[]): string[] {
  const problems = teamProblems(placement.map((p) => p.monster));
  const rows = homeRows(side);
  const cells = placement.map((p) => p.cell);
  if (new Set(cells).size !== cells.length) problems.push("two monsters on one cell");
  for (const { cell } of placement) {
    if (cell < 0 || cell >= CELLS || !rows.includes(yOf(cell))) problems.push(`cell ${cell} is not on the home rows`);
    else if (!canPlaceOn(terrain[cell])) problems.push(`cell ${cell} is ${terrain[cell]}`);
  }
  return problems;
}

/** Puts a team on random free cells of the home rows. */
export function autoPlace(side: Side, team: readonly string[], terrain: readonly Terrain[], random: () => number): Placement {
  const free = homeRows(side)
    .flatMap((y) => Array.from({ length: SIZE }, (_, x) => cellAt(x, y)))
    .filter((cell) => canPlaceOn(terrain[cell]));
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  if (free.length < team.length) throw new Error("Not enough room on the home rows");
  return team.map((id, i) => ({ monster: id, cell: free[i] }));
}

/** A random legal team from the monsters a side may use. */
export function randomTeam(pool: readonly string[], random: () => number): string[] {
  return LEVELS.map((level) => {
    const options = pool.filter((id) => monster(id).level === level);
    if (!options.length) throw new Error(`No level ${level} monster to choose from`);
    return options[Math.floor(random() * options.length)];
  });
}

export function newGame(mapId: string, player: Placement, tianwu: Placement, first: Side = 0): GameState {
  const map = MAP_BY_ID.get(mapId);
  if (!map) throw new Error(`Unknown map "${mapId}"`);
  const board = buildBoard(map);
  for (const [side, placement] of [[0, player], [1, tianwu]] as const) {
    const problems = placementProblems(side, placement, board.terrain);
    if (problems.length) throw new Error(`Side ${side}: ${problems.join("; ")}`);
  }
  let id = 0;
  const units: Unit[] = ([[0, player], [1, tianwu]] as const).flatMap(([side, placement]) =>
    placement.map(({ monster: m, cell }) => ({ id: id++, side, monster: m, level: monster(m).level, cell, revealed: false, abilityUsed: false })),
  );
  return { mapId, terrain: board.terrain, templeOwner: board.templeOwner as (Side | null)[], units, fallen: [], toMove: first, turn: 0, winner: null };
}

// --- Reading the board --------------------------------------------------------

export const unitAt = (state: GameState, cell: number) => state.units.find((u) => u.cell === cell);
export const unitById = (state: GameState, id: number) => state.units.find((u) => u.id === id);
const def = (u: Unit): Monster => monster(u.monster);

/** One of a monster's abilities, unless it has been sealed. */
export const ability = <K extends Ability["kind"]>(u: Unit, kind: K): Extract<Ability, { kind: K }> | undefined => (u.sealed ? undefined : hasAbility(def(u), kind));
/** Its active ability, if it still has one to use. */
export const usableAbility = (u: Unit) => (u.sealed || u.abilityUsed ? undefined : activeAbility(def(u)));
/** A bound monster cannot act this turn. */
export const isBound = (state: GameState, u: Unit) => (u.boundUntil ?? 0) > state.turn;
const adjacentAllies = (state: GameState, u: Unit) => state.units.filter((a) => a.side === u.side && a.id !== u.id && reach(a.cell, u.cell) === 1);

/**
 * The level a monster fights at here: its level, plus a river bonus if it has
 * one and stands on a river, plus one on its own element's sacred ground (linh địa).
 */
export function fightingLevel(state: GameState, u: Unit, cell = u.cell): number {
  const bonus = state.terrain[cell] === "river" ? (ability(u, "river-bonus")?.levels ?? 0) : 0;
  const home = state.terrain[cell] === ELEMENT_TERRAIN[def(u).element] ? 1 : 0;
  return u.level + bonus + home;
}

/** Whether a monster can stand on this ground: mountains need a climber, lava a Fire monster. */
export function canStand(u: Unit, terrain: Terrain): boolean {
  if (terrain === "mountain") return !!ability(u, "walk-mountain");
  if (terrain === "lava") return def(u).element === "hoa";
  return true;
}

/** +1 when this monster's element overcomes (khắc) the foe's. */
export const counterBonus = (u: Unit, foe: Unit) => (OVERCOMES[def(u).element] === def(foe).element ? 1 : 0);

/** +1 for a defender standing next to an ally whose element feeds (sinh) its own. Does not stack. */
export const feedBonus = (state: GameState, u: Unit) => (adjacentAllies(state, u).some((ally) => FEEDS[def(ally).element] === def(u).element) ? 1 : 0);

/** +1 from an ally next to it with a matching aura (Trần Hưng Đạo, Nghê...). Does not stack. */
export const auraBonus = (state: GameState, u: Unit, on: "attack" | "defense") => (adjacentAllies(state, u).some((ally) => ability(ally, "aura")?.on === on) ? 1 : 0);

/** +1 for an attacker whose partner from the same tale stands next to it (đồng tâm). */
export const partnerBonus = (state: GameState, u: Unit) => (adjacentAllies(state, u).some((ally) => arePartners(ally.monster, u.monster)) ? 1 : 0);

/** +1 for attacking a monster that is still face down (đánh úp). */
export const ambushBonus = (defender: Unit) => (defender.revealed ? 0 : 1);

/**
 * The levels both sides fight at in one battle: terrain, khắc, sinh, đánh úp,
 * auras, partners and rivals. Call it before the battle reveals anyone.
 */
export function battleLevels(state: GameState, attacker: Unit, defender: Unit, melee: boolean): { attacker: number; defender: number } {
  return {
    attacker:
      fightingLevel(state, attacker, melee ? defender.cell : attacker.cell) +
      counterBonus(attacker, defender) +
      ambushBonus(defender) +
      auraBonus(state, attacker, "attack") +
      partnerBonus(state, attacker) +
      (areRivals(attacker.monster, defender.monster) ? 1 : 0),
    defender: fightingLevel(state, defender) + counterBonus(defender, attacker) + feedBonus(state, defender) + auraBonus(state, defender, "defense"),
  };
}

/** True if ranged attacks cannot touch this monster where it stands. */
export function shielded(state: GameState, u: Unit): boolean {
  if (ability(u, "immune-ranged")) return true;
  if (state.terrain[u.cell] === "shrine" || state.terrain[u.cell] === "forest") return true;
  return adjacentAllies(state, u).some((ally) => ability(ally, "guard-ranged"));
}

// --- Movement ----------------------------------------------------------------

export type Destination = { cell: number; attack: boolean };

/**
 * Every cell a monster can move to this turn, and whether moving there is
 * an attack. Land walkers move in 4 directions, cannot cross mountains
 * (climbers can) or lava (Fire monsters can), and stop on entering a river
 * or a marsh. Water walkers move in 4
 * directions and treat rivers as plain. Flyers move in 8 directions over
 * mountains and other monsters, but cannot land on a mountain. Nobody passes
 * through a monster on foot; moving onto an enemy is a melee attack.
 */
export function destinations(state: GameState, u: Unit): Destination[] {
  const m = def(u);
  const flies = m.path === "air";
  const directions = flies ? ALL_DIRECTIONS : ORTHOGONAL;
  const best = new Map<number, number>([[u.cell, m.steps]]); // steps left on arrival
  const out = new Map<number, boolean>();
  const queue: [number, number][] = [[u.cell, m.steps]];
  while (queue.length) {
    const [from, left] = queue.shift() as [number, number];
    if (left <= 0) continue;
    for (const [dx, dy] of directions) {
      const to = cellAt(xOf(from) + dx, yOf(from) + dy);
      if (to === -1) continue;
      const terrain = state.terrain[to];
      const stands = canStand(u, terrain);
      // Walkers and swimmers cannot cross ground they cannot stand on; flyers pass over it.
      if (!stands && !flies) continue;
      const occupant = unitAt(state, to);
      const canStop = stands;
      if (occupant) {
        if (occupant.side !== u.side && canStop) out.set(to, true);
        if (!flies) continue; // walkers and swimmers cannot pass through anyone
      } else if (canStop && to !== u.cell) {
        out.set(to, false);
      }
      // Land walkers stop when they step into a river or a marsh.
      const nextLeft = (terrain === "river" || terrain === "marsh") && m.path === "land" ? 0 : left - 1;
      if ((best.get(to) ?? -1) >= nextLeft) continue;
      best.set(to, nextLeft);
      queue.push([to, nextLeft]);
    }
  }
  return [...out].map(([cell, attack]) => ({ cell, attack }));
}

/** How far this monster shoots from where it stands: one cell further from ore. */
export const shotRange = (state: GameState, u: Unit) => (def(u).ranged?.range ?? 0) + (state.terrain[u.cell] === "ore" ? 1 : 0);

/** Enemies this monster can shoot: within its range, any distance from 1. */
export function shootTargets(state: GameState, u: Unit): number[] {
  if (!def(u).ranged) return [];
  const range = shotRange(state, u);
  return state.units.filter((e) => e.side !== u.side && reach(u.cell, e.cell) <= range).map((e) => e.cell);
}

/** Cells an active ability can be aimed at (before choosing how many). */
export function abilityCells(state: GameState, u: Unit): number[] {
  const active = usableAbility(u);
  if (!active) return [];
  const enemiesWithin = (range: number) => state.units.filter((e) => e.side !== u.side && reach(u.cell, e.cell) <= range);
  switch (active.kind) {
    case "strike":
      return enemiesWithin(active.range).map((e) => e.cell);
    case "bind":
      // A monster on a mound is rooted in the earth: it cannot be bound.
      return enemiesWithin(active.range).filter((e) => !isBound(state, e) && state.terrain[e.cell] !== "mound").map((e) => e.cell);
    case "seal":
      return enemiesWithin(active.range).filter((e) => !e.sealed).map((e) => e.cell);
    case "swap":
      // Both must be able to stand where the other was, and nobody on a mound can be moved.
      return state.units
        .filter((o) => o.id !== u.id && reach(u.cell, o.cell) <= active.range)
        .filter((o) => state.terrain[o.cell] !== "mound" && canStand(u, state.terrain[o.cell]) && canStand(o, state.terrain[u.cell]))
        .map((o) => o.cell);
    case "rise":
      return u.level < MAX_LEVEL ? [u.cell] : [];
    case "recall":
      return recallable(state, u.side, active.maxLevel) ? freeHomeCells(state, u.side) : [];
    case "leap": {
      const out: number[] = [];
      for (let cell = 0; cell < CELLS; cell++) {
        if (cell === u.cell || reach(cell, u.cell) > active.range) continue;
        if (!canStand(u, state.terrain[cell])) continue;
        const occupant = unitAt(state, cell);
        if (occupant && occupant.side === u.side) continue;
        out.push(cell);
      }
      return out;
    }
    case "terraform": {
      const out: number[] = [];
      for (let cell = 0; cell < CELLS; cell++) {
        if (cell === u.cell || reach(cell, u.cell) > active.radius || state.terrain[cell] !== "plain") continue;
        // A mountain cannot rise under a monster; a river can flow under one.
        if (active.to === "mountain" && unitAt(state, cell)) continue;
        out.push(cell);
      }
      return out;
    }
  }
}

/** Free cells of a side's home rows where a monster can be put back, back row first. */
export function freeHomeCells(state: GameState, side: Side): number[] {
  const rows = side === 0 ? [SIZE - 1, SIZE - 2] : [0, 1];
  return rows.flatMap((y) => Array.from({ length: SIZE }, (_, x) => cellAt(x, y))).filter((cell) => canPlaceOn(state.terrain[cell]) && !unitAt(state, cell));
}

/** The ally a recall would bring back: the last to fall at or below this level. */
export function recallable(state: GameState, side: Side, maxLevel: number): Unit | undefined {
  return [...(state.fallen ?? [])].reverse().find((f) => f.side === side && def(f).level <= maxLevel);
}

function combinations<T>(items: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (items.length < k) return [];
  const [first, ...rest] = items;
  return [...combinations(rest, k - 1).map((c) => [first, ...c]), ...combinations(rest, k)];
}

/**
 * Every legal action for the side to move. A flood that can cover several
 * cells is offered as each set of as many cells as it can take; a player
 * may also choose fewer (apply accepts 1 up to the ability's count).
 */
export function legalActions(state: GameState): Action[] {
  if (state.winner !== null) return [];
  const actions: Action[] = [{ kind: "pass" }];
  for (const u of state.units) {
    if (u.side !== state.toMove || isBound(state, u)) continue;
    for (const d of destinations(state, u)) actions.push({ kind: "move", unit: u.id, to: d.cell });
    for (const target of shootTargets(state, u)) actions.push({ kind: "shoot", unit: u.id, target });
    const active = usableAbility(u);
    const cells = abilityCells(state, u);
    if (active && cells.length) {
      if (active.kind === "terraform") for (const set of combinations(cells, Math.min(active.count, cells.length))) actions.push({ kind: "ability", unit: u.id, cells: set });
      else for (const cell of cells) actions.push({ kind: "ability", unit: u.id, cells: [cell] });
    }
  }
  return actions;
}

// --- Applying an action ---------------------------------------------------------

const clone = (state: GameState): GameState => ({
  ...state,
  terrain: state.terrain.slice(),
  templeOwner: state.templeOwner.slice(),
  units: state.units.map((u) => ({ ...u })),
  fallen: state.fallen?.slice(),
});

function reveal(u: Unit, events: GameEvent[]) {
  if (u.revealed) return;
  u.revealed = true;
  events.push({ type: "reveal", unit: u.id });
}

/** Evolves a monster that has just arrived on its own side's temple; the temple is used up. */
function visitTemple(state: GameState, u: Unit, events: GameEvent[]) {
  if (state.terrain[u.cell] !== "temple" || state.templeOwner[u.cell] !== u.side) return;
  state.terrain[u.cell] = "plain";
  state.templeOwner[u.cell] = null;
  if (u.level < MAX_LEVEL) {
    u.level += 1;
    events.push({ type: "evolve", unit: u.id, level: u.level });
  }
}

/** Ranged attack: the target falls only if the shooter wins. A losing shot does nothing. */
function rangedHit(state: GameState, attacker: Unit, target: Unit, power: number, levels: { attacker: number; defender: number }): BattleResult {
  if (shielded(state, target)) return "blocked";
  const { attacker: a, defender: d } = levels;
  if (a > d) return "attacker";
  if (a < d) return "none";
  return power > (def(target).ranged?.power ?? 0) ? "attacker" : "none";
}

/** Melee: the higher level wins; at equal level the stronger fighter wins; a tie takes both. */
function meleeResult(attacker: Unit, defender: Unit, levels: { attacker: number; defender: number }): BattleResult {
  const { attacker: a, defender: d } = levels;
  if (a !== d) return a > d ? "attacker" : "defender";
  const am = def(attacker).melee;
  const dm = def(defender).melee;
  return am === dm ? "both" : am > dm ? "attacker" : "defender";
}

export function isLegal(state: GameState, action: Action): boolean {
  if (state.winner !== null) return false;
  if (action.kind === "pass") return true;
  const u = unitById(state, action.unit);
  if (!u || u.side !== state.toMove || isBound(state, u)) return false;
  if (action.kind === "move") return destinations(state, u).some((d) => d.cell === action.to);
  if (action.kind === "shoot") return shootTargets(state, u).includes(action.target);
  const active = usableAbility(u);
  if (!active) return false;
  const allowed = abilityCells(state, u);
  const cells = action.cells;
  const max = active.kind === "terraform" ? active.count : 1;
  return cells.length >= 1 && cells.length <= max && new Set(cells).size === cells.length && cells.every((c) => allowed.includes(c));
}

/** Plays one action. Returns the new state (the input is not changed) and what happened, for the UI. */
export function apply(state: GameState, action: Action): { state: GameState; events: GameEvent[] } {
  if (!isLegal(state, action)) throw new Error(`Illegal action ${JSON.stringify(action)}`);
  const next = clone(state);
  const events: GameEvent[] = [];
  /** Takes a monster off the board; a Phoenix comes back once instead. */
  const remove = (id: number) => {
    const u = unitById(next, id) as Unit;
    const home = freeHomeCells(next, u.side).filter((cell) => cell !== u.cell);
    if (ability(u, "revive") && !u.revived && home.length) {
      u.revived = true;
      u.cell = home[0];
      u.boundUntil = 0;
      events.push({ type: "revive", unit: u.id, cell: u.cell });
      return;
    }
    next.units = next.units.filter((x) => x.id !== id);
    next.fallen = [...(next.fallen ?? []), u];
  };
  const moveTo = (u: Unit, to: number) => {
    events.push({ type: "move", unit: u.id, from: u.cell, to });
    u.cell = to;
    visitTemple(next, u, events);
  };
  /** A melee attack by `u` on `enemy`; the winner of an attack moves in. */
  const melee = (u: Unit, enemy: Unit) => {
    const to = enemy.cell;
    const levels = battleLevels(next, u, enemy, true);
    reveal(u, events);
    reveal(enemy, events);
    const result = meleeResult(u, enemy, levels);
    events.push({ type: "battle", kind: "melee", attacker: u.id, defender: enemy.id, result, levels });
    if (result === "attacker" || result === "both") remove(enemy.id);
    if (result === "defender" || result === "both") remove(u.id);
    // A reborn Phoenix is back home: the attacker only moves in if the cell is empty.
    if (result === "attacker" && !unitAt(next, to)) moveTo(u, to);
  };
  const shot = (u: Unit, target: Unit, power: number) => {
    const levels = battleLevels(next, u, target, false);
    reveal(u, events);
    reveal(target, events);
    const result = rangedHit(next, u, target, power, levels);
    events.push({ type: "battle", kind: "ranged", attacker: u.id, defender: target.id, result, levels });
    if (result === "attacker") remove(target.id);
  };

  if (action.kind === "pass") {
    events.push({ type: "pass", side: state.toMove });
  } else {
    const u = unitById(next, action.unit) as Unit;
    if (action.kind === "move") {
      const enemy = unitAt(next, action.to);
      if (enemy) melee(u, enemy);
      else moveTo(u, action.to);
    } else if (action.kind === "shoot") {
      shot(u, unitAt(next, action.target) as Unit, def(u).ranged?.power ?? 0);
    } else {
      const active = usableAbility(u) as NonNullable<ReturnType<typeof usableAbility>>;
      const cell = action.cells[0];
      u.abilityUsed = true;
      reveal(u, events);
      switch (active.kind) {
        case "strike":
          shot(u, unitAt(next, cell) as Unit, active.power);
          break;
        case "terraform":
          for (const c of action.cells) next.terrain[c] = active.to;
          events.push({ type: "terraform", unit: u.id, cells: action.cells, to: active.to });
          break;
        case "leap": {
          const enemy = unitAt(next, cell);
          if (enemy) melee(u, enemy);
          else moveTo(u, cell);
          break;
        }
        case "bind": {
          const target = unitAt(next, cell) as Unit;
          target.boundUntil = state.turn + 2 * active.turns;
          events.push({ type: "bind", unit: u.id, target: target.id, until: target.boundUntil });
          break;
        }
        case "seal": {
          const target = unitAt(next, cell) as Unit;
          reveal(target, events);
          target.sealed = true;
          events.push({ type: "seal", unit: u.id, target: target.id });
          break;
        }
        case "swap": {
          const other = unitAt(next, cell) as Unit;
          const from = u.cell;
          u.cell = other.cell;
          other.cell = from;
          events.push({ type: "swap", unit: u.id, other: other.id, from, to: u.cell });
          visitTemple(next, u, events);
          visitTemple(next, other, events);
          break;
        }
        case "rise":
          u.level += 1;
          events.push({ type: "evolve", unit: u.id, level: u.level });
          break;
        case "recall": {
          const back = recallable(next, u.side, active.maxLevel) as Unit;
          next.fallen = (next.fallen ?? []).filter((f) => f !== back);
          const unit: Unit = { ...back, cell, level: def(back).level, revealed: true, boundUntil: 0 };
          next.units = [...next.units, unit];
          events.push({ type: "recall", unit: unit.id, by: u.id, cell });
          break;
        }
      }
    }
  }

  next.turn += 1;
  next.toMove = state.toMove === 0 ? 1 : 0;
  const alive = [0, 1].map((side) => next.units.some((u) => u.side === side));
  if (!alive[0] || !alive[1]) {
    next.winner = !alive[0] && !alive[1] ? "draw" : alive[0] ? 0 : 1;
    events.push({ type: "end", winner: next.winner, reason: "eliminated" });
  } else if (next.turn >= MAX_TURNS) {
    const [a, b] = [0, 1].map((side) => levelTotal(next, side as Side));
    next.winner = a === b ? "draw" : a > b ? 0 : 1;
    events.push({ type: "end", winner: next.winner, reason: "turns" });
  }
  return { state: next, events };
}

/** Sum of the levels a side still has on the board (evolutions included): the tie-break after MAX_TURNS. */
export const levelTotal = (state: GameState, side: Side) => state.units.filter((u) => u.side === side).reduce((sum, u) => sum + u.level, 0);

// --- What one side can see ----------------------------------------------------------

export type UnitView = {
  id: number;
  side: Side;
  cell: number;
  /** The level this side sees: the real one, except a face-down enemy Fox Spirit shows a false one. */
  level: number;
  /** Temple evolutions so far. Public: everyone sees a monster step onto a temple. */
  evolved: number;
  /** null for a face-down enemy. */
  monster: string | null;
  revealed: boolean;
  abilityUsed: boolean;
  /** Public effects: everyone sees a bind, a seal or a rebirth happen. */
  boundUntil: number;
  sealed: boolean;
  revived: boolean;
};

export type View = Omit<GameState, "units"> & { units: UnitView[]; me: Side };

/**
 * The game as `side` sees it: its own monsters in full, enemies face down
 * except those that have fought or used an ability. This is everything the
 * player is shown and everything Tianwu is allowed to read.
 */
export function viewFor(state: GameState, side: Side): View {
  return {
    ...state,
    me: side,
    units: state.units.map((u) => {
      const hidden = u.side !== side && !u.revealed;
      const fake = ability(u, "fake-level");
      const shownLevel = hidden && fake ? fake.shown + (u.level - def(u).level) : u.level;
      const evolved = u.level - def(u).level;
      return {
        id: u.id,
        side: u.side,
        cell: u.cell,
        level: shownLevel,
        evolved,
        monster: hidden ? null : u.monster,
        revealed: u.revealed,
        abilityUsed: u.abilityUsed,
        boundUntil: u.boundUntil ?? 0,
        sealed: !!u.sealed,
        revived: !!u.revived,
      };
    }),
  };
}
