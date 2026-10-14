// The player's collection: which monsters they may put in a team.
//
// Everyone starts with the 10 starters (two per level). After each game
// against Tianwu:
//   - a win earns one summon (Thỉnh quân);
//   - every third loss also earns one, so a struggling player still grows.
// A summon draws a random monster the player does not own yet, so there are
// never duplicates; once all 50 are owned, summons stop. Draws earn nothing.
// Tianwu always plays with the whole roster.

import { LEVELS, MONSTERS, STARTERS, monster } from "./monsters";

export const LOSSES_PER_SUMMON = 3;

export type Collection = {
  owned: string[];
  wins: number;
  losses: number;
  /** Losses since the last loss-earned summon (0 to LOSSES_PER_SUMMON - 1). */
  lossStreak: number;
};

export const newCollection = (): Collection => ({ owned: [...STARTERS], wins: 0, losses: 0, lossStreak: 0 });

/** Monsters still to be summoned. */
export const unowned = (c: Collection) => MONSTERS.map((m) => m.id).filter((id) => !c.owned.includes(id));

/** Draws one unowned monster, or null when the collection is complete. */
export function summon(c: Collection, random: () => number): { collection: Collection; monster: string | null } {
  const left = unowned(c);
  if (!left.length) return { collection: c, monster: null };
  const pick = left[Math.floor(random() * left.length)];
  return { collection: { ...c, owned: [...c.owned, pick] }, monster: pick };
}

/** Records a finished game and performs the summons it earned. */
export function afterGame(c: Collection, result: "win" | "loss" | "draw", random: () => number): { collection: Collection; summoned: string[] } {
  let next = { ...c };
  let earned = 0;
  if (result === "win") {
    next.wins += 1;
    earned = 1;
  } else if (result === "loss") {
    next.losses += 1;
    next.lossStreak += 1;
    if (next.lossStreak >= LOSSES_PER_SUMMON) {
      next.lossStreak = 0;
      earned = 1;
    }
  }
  const summoned: string[] = [];
  for (let i = 0; i < earned; i++) {
    const r = summon(next, random);
    next = r.collection;
    if (r.monster) summoned.push(r.monster);
  }
  return { collection: next, summoned };
}

/** Drops unknown ids and restores missing starters, for data read back from storage. */
export function sanitize(raw: Partial<Collection> | null | undefined): Collection {
  const known = new Set(MONSTERS.map((m) => m.id));
  const owned = [...new Set([...STARTERS, ...(Array.isArray(raw?.owned) ? raw.owned : [])])].filter((id) => known.has(id));
  const count = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0);
  return { owned, wins: count(raw?.wins), losses: count(raw?.losses), lossStreak: Math.min(count(raw?.lossStreak), LOSSES_PER_SUMMON - 1) };
}

/** Whether a team can be fielded from this collection (one owned monster per level). */
export const canField = (c: Collection, team: readonly string[]) =>
  team.length === LEVELS.length && team.every((id) => c.owned.includes(id)) && new Set(team.map((id) => monster(id).level)).size === LEVELS.length;
