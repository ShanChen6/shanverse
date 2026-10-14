// Turns engine events into log lines and board highlights, from the
// player's point of view: a face-down enemy is named only by its level.

import type { Translate } from "@/i18n/messages";

import { monster } from "./monsters";
import type { GameEvent, GameState, Side, View } from "./rules";

type T = Translate;

export type LogLine = { key: number; side: Side | null; text: string };
export type Highlight = { cell: number; kind: "from" | "to" | "battle" | "effect" };

/** A unit's name for the player: its monster, or "Face-down piece (level n)". */
function nameIn(view: View, id: number, lang: "vi" | "en", t: T): string {
  const u = view.units.find((x) => x.id === id);
  if (!u) return "?";
  if (!u.monster) return t("games.blkHiddenLevel", { n: u.level });
  return monster(u.monster).name[lang];
}

/**
 * Log lines for one action. `before` and `after` are the player's views of
 * the states around it: a monster that fell is only in `before`, and one
 * that a battle revealed is named in `after`.
 */
export function describe(events: GameEvent[], before: View, after: View, mover: Side, lang: "vi" | "en", t: T): string[] {
  const name = (id: number) => {
    const inAfter = after.units.find((x) => x.id === id);
    const known = inAfter ?? before.units.find((x) => x.id === id);
    // A monster that fell in a battle was revealed by it: find who it was in the
    // fallen list (both sides see the fallen), else use what the view knew.
    const fallen = after.fallen?.find((f) => f.id === id);
    if (!inAfter && fallen && (fallen.side === after.me || fallen.revealed)) return monster(fallen.monster).name[lang];
    return known ? nameIn(inAfter ? after : before, id, lang, t) : "?";
  };
  const lines: string[] = [];
  for (const e of events) {
    switch (e.type) {
      case "move":
        // A move after a won battle is part of that battle's line.
        if (!events.some((x) => x.type === "battle")) lines.push(t("games.blkLogMove", { a: name(e.unit) }));
        break;
      case "battle": {
        const a = name(e.attacker);
        const d = name(e.defender);
        lines.push(t(e.kind === "melee" ? "games.blkLogMelee" : "games.blkLogShot", { a, d, la: e.levels.attacker, ld: e.levels.defender }));
        const result = {
          attacker: t("games.blkLogAttackerWins", { d }),
          defender: t("games.blkLogDefenderWins", { a }),
          both: t("games.blkLogBoth"),
          none: t("games.blkLogMiss", { d }),
          blocked: t("games.blkLogBlocked"),
        }[e.result];
        lines.push(result);
        break;
      }
      case "evolve":
        lines.push(t("games.blkLogEvolve", { a: name(e.unit), n: e.level }));
        break;
      case "terraform":
        lines.push(t("games.blkLogTerraform", { a: name(e.unit), n: e.cells.length, terrain: t(e.to === "river" ? "games.blkTerrainRiver" : "games.blkTerrainMountain") }));
        break;
      case "bind":
        lines.push(t("games.blkLogBind", { a: name(e.unit), d: name(e.target) }));
        break;
      case "seal":
        lines.push(t("games.blkLogSeal", { a: name(e.unit), d: name(e.target) }));
        break;
      case "swap":
        lines.push(t("games.blkLogSwap", { a: name(e.unit), d: name(e.other) }));
        break;
      case "revive":
        lines.push(t("games.blkLogRevive", { a: name(e.unit) }));
        break;
      case "recall":
        lines.push(t("games.blkLogRecall", { a: name(e.unit), b: name(e.by) }));
        break;
      case "pass":
        lines.push(t("games.blkLogPass", { side: mover === 0 ? t("games.blkYou") : "Tianwu" }));
        break;
      default:
        break;
    }
  }
  return lines;
}

/** Cells to light up after an action, so the player can see what happened. */
export function highlights(events: GameEvent[], before: GameState): Highlight[] {
  const out: Highlight[] = [];
  const cellOf = (id: number) => before.units.find((u) => u.id === id)?.cell;
  for (const e of events) {
    if (e.type === "move") out.push({ cell: e.from, kind: "from" }, { cell: e.to, kind: "to" });
    else if (e.type === "battle") {
      const at = cellOf(e.defender);
      if (at !== undefined) out.push({ cell: at, kind: "battle" });
      const from = cellOf(e.attacker);
      if (from !== undefined) out.push({ cell: from, kind: "from" });
    } else if (e.type === "terraform") for (const cell of e.cells) out.push({ cell, kind: "effect" });
    else if (e.type === "bind" || e.type === "seal") {
      const at = cellOf(e.target);
      if (at !== undefined) out.push({ cell: at, kind: "effect" });
    } else if (e.type === "swap") out.push({ cell: e.from, kind: "effect" }, { cell: e.to, kind: "effect" });
    else if (e.type === "revive" || e.type === "recall") out.push({ cell: e.cell, kind: "effect" });
  }
  return out;
}
