// Turns engine events into log lines and board highlights, from the
// player's point of view: a face-down enemy is named only by its level.

import type { Translate } from "@/i18n/messages";

import type { Fx } from "./assets";
import { ELEMENT_TERRAIN } from "./maps";
import { OVERCOMES, activeAbility, areRivals, monster } from "./monsters";
import type { Action, GameEvent, GameState, Side, View } from "./rules";

type T = Translate;

export type LogLine = { key: number; side: Side | null; text: string };
/** A cell to light up; `fx` names a painted effect to play over it. */
export type Highlight = { cell: number; kind: "from" | "to" | "battle" | "effect"; fx?: Fx };

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

/** Cells to light up after an action, so the player can see what happened, with the effect to paint on each. */
export function highlights(events: GameEvent[], before: GameState, action?: Action): Highlight[] {
  const out: Highlight[] = [];
  const unit = (id: number) => before.units.find((u) => u.id === id);
  const cellOf = (id: number) => unit(id)?.cell;
  const actor = action?.kind === "ability" ? unit(action.unit) : undefined;
  const used = actor ? activeAbility(monster(actor.monster))?.kind : undefined;
  let landed: number | undefined;
  for (const e of events) {
    if (e.type === "move") {
      landed = e.to;
      const u = unit(e.unit);
      const m = u ? monster(u.monster) : null;
      const ground = before.terrain[e.to];
      let fx: Fx | undefined;
      if (used === "leap") fx = "leap";
      else if (m && ground === ELEMENT_TERRAIN[m.element]) fx = `home-${m.element}`;
      else if (m && m.path === "land" && (ground === "river" || ground === "marsh")) fx = "mire";
      out.push({ cell: e.from, kind: "from" }, { cell: e.to, kind: "to", fx });
    } else if (e.type === "battle") {
      const a = unit(e.attacker);
      const d = unit(e.defender);
      if (a && d) out.push({ cell: d.cell, kind: "battle", fx: battleFx(e.kind, a, d, used) });
      if (a) out.push({ cell: a.cell, kind: "from", fx: e.result === "defender" || e.result === "both" ? "fall" : undefined });
    } else if (e.type === "terraform") for (const cell of e.cells) out.push({ cell, kind: "effect", fx: e.to === "river" ? "flood" : "raise-mountain" });
    else if (e.type === "bind" || e.type === "seal") {
      const at = cellOf(e.target);
      if (at !== undefined) out.push({ cell: at, kind: "effect", fx: e.type });
    } else if (e.type === "swap") out.push({ cell: e.from, kind: "effect", fx: "swap" }, { cell: e.to, kind: "effect", fx: "swap" });
    else if (e.type === "revive" || e.type === "recall") out.push({ cell: e.cell, kind: "effect", fx: e.type });
    else if (e.type === "evolve") {
      // Carp and Gióng grow by their own ability; anyone else stepped onto a temple.
      const at = landed ?? cellOf(e.unit);
      if (at !== undefined) out.push({ cell: at, kind: "effect", fx: used === "rise" ? "rise" : "temple" });
    } else if (e.type === "reveal" && !events.some((x) => x.type === "battle")) {
      const at = cellOf(e.unit);
      if (at !== undefined) out.push({ cell: at, kind: "effect", fx: "reveal" });
    }
  }
  return out;
}

/** The effect for a battle: the most telling bonus in play, else the attacker's own strike. */
function battleFx(kind: "melee" | "ranged", a: GameState["units"][number], d: GameState["units"][number], used: string | undefined): Fx {
  const element = monster(a.monster).element;
  if (used === "strike") return "lightning";
  if (used === "leap") return "leap";
  if (areRivals(a.monster, d.monster)) return "rival";
  if (!d.revealed) return "ambush";
  if (OVERCOMES[element] === monster(d.monster).element) return "counter";
  return kind === "ranged" ? "ranged" : `${element}-strike`;
}
