// What Bách Linh Kỳ keeps in the browser: the game in progress, the last
// choices on the setup screen, and the collection. Everything read back is
// checked, so an old or edited save never breaks the page.

import type { Difficulty } from "./ai";
import { sanitize, type Collection } from "./collection";
import { MAP_BY_ID, SIZE } from "./maps";
import { MONSTER_BY_ID } from "./monsters";
import { MAX_LEVEL, MAX_TURNS, type GameState, type Side, type Unit } from "./rules";

const GAME_KEY = "shanverse:bach-linh-ky:game";
const PREFS_KEY = "shanverse:bach-linh-ky:prefs";
const COLLECTION_KEY = "shanverse:bach-linh-ky:collection";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
export type MapChoice = string | "random";

export type Prefs = { difficulty: Difficulty; map: MapChoice; team: string[] | null };
export type SavedGame = {
  state: GameState;
  difficulty: Difficulty;
  /** The player gave up (the state then has Tianwu as winner). */
  resigned?: boolean;
  /** The result has been counted in the collection. */
  recorded?: boolean;
  /** The monster this game's result summoned, if any. */
  summoned?: string | null;
  /** The player has opened the summon (watched the urn burst). */
  summonSeen?: boolean;
};

function readJson(key: string): unknown {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not saved; the game still works.
  }
}

const isInt = (n: unknown, min: number, max: number): n is number => typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;
const isSide = (n: unknown): n is Side => n === 0 || n === 1;
const TERRAINS = new Set(["plain", "mountain", "river", "shrine", "temple"]);

function readUnit(raw: unknown): Unit | null {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as Record<string, unknown>;
  if (!isInt(u.id, 0, 99) || !isSide(u.side) || typeof u.monster !== "string" || !MONSTER_BY_ID.has(u.monster)) return null;
  if (!isInt(u.level, 1, MAX_LEVEL) || !isInt(u.cell, 0, SIZE * SIZE - 1) || typeof u.revealed !== "boolean" || typeof u.abilityUsed !== "boolean") return null;
  return {
    id: u.id,
    side: u.side,
    monster: u.monster,
    level: u.level,
    cell: u.cell,
    revealed: u.revealed,
    abilityUsed: u.abilityUsed,
    boundUntil: isInt(u.boundUntil, 0, MAX_TURNS * 2) ? u.boundUntil : 0,
    sealed: u.sealed === true,
    revived: u.revived === true,
  };
}

/** A saved game state, or null if anything about it is off. */
export function readState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.mapId !== "string" || !MAP_BY_ID.has(s.mapId)) return null;
  const cells = SIZE * SIZE;
  if (!Array.isArray(s.terrain) || s.terrain.length !== cells || !s.terrain.every((t) => TERRAINS.has(t as string))) return null;
  if (!Array.isArray(s.templeOwner) || s.templeOwner.length !== cells || !s.templeOwner.every((o) => o === null || isSide(o))) return null;
  if (!Array.isArray(s.units) || !isSide(s.toMove) || !isInt(s.turn, 0, MAX_TURNS)) return null;
  if (!(s.winner === null || s.winner === "draw" || isSide(s.winner))) return null;
  const units = s.units.map(readUnit);
  if (units.some((u) => !u)) return null;
  const fallen = Array.isArray(s.fallen) ? s.fallen.map(readUnit) : [];
  if (fallen.some((u) => !u)) return null;
  const all = units as Unit[];
  if (new Set(all.map((u) => u.cell)).size !== all.length || new Set([...all, ...(fallen as Unit[])].map((u) => u.id)).size !== all.length + fallen.length) return null;
  return {
    mapId: s.mapId,
    terrain: s.terrain as GameState["terrain"],
    templeOwner: s.templeOwner as GameState["templeOwner"],
    units: all,
    fallen: fallen as Unit[],
    toMove: s.toMove,
    turn: s.turn,
    winner: s.winner as GameState["winner"],
  };
}

export function loadGame(): SavedGame | null {
  const raw = readJson(GAME_KEY) as Record<string, unknown> | null;
  const state = readState(raw?.state);
  if (!raw || !state || !DIFFICULTIES.includes(raw.difficulty as Difficulty)) return null;
  return {
    state,
    difficulty: raw.difficulty as Difficulty,
    resigned: raw.resigned === true,
    recorded: raw.recorded === true,
    summoned: typeof raw.summoned === "string" && MONSTER_BY_ID.has(raw.summoned) ? raw.summoned : null,
    summonSeen: raw.summonSeen === true,
  };
}

export const saveGame = (game: SavedGame | null) => writeJson(GAME_KEY, game);

export function loadPrefs(): Prefs {
  const raw = readJson(PREFS_KEY) as Partial<Prefs> | null;
  const team = Array.isArray(raw?.team) && raw.team.every((id) => typeof id === "string" && MONSTER_BY_ID.has(id)) ? raw.team : null;
  return {
    difficulty: DIFFICULTIES.includes(raw?.difficulty as Difficulty) ? (raw?.difficulty as Difficulty) : "medium",
    map: typeof raw?.map === "string" && (raw.map === "random" || MAP_BY_ID.has(raw.map)) ? raw.map : "random",
    team,
  };
}

export const savePrefs = (prefs: Prefs) => writeJson(PREFS_KEY, prefs);

export const loadCollection = (): Collection => sanitize(readJson(COLLECTION_KEY) as Partial<Collection> | null);
export const saveCollection = (collection: Collection) => writeJson(COLLECTION_KEY, collection);
