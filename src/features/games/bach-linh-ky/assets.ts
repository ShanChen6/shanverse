// Painted art for Bách Linh Kỳ other than the monsters (those are in
// art-images.ts): element emblems, partner pairs, board tiles, maps and their
// covers, effects, the summoning ceremony, the end of a match and the pieces'
// lacquer parts. Every file lives under public/games/bach-linh-ky/ as webp.
//
// The prompts the images were made from: docs/bach-linh-ky-art-prompts.md.
// Effects and markers have transparent ground and are drawn over the board as
// they are.
//
// In the repository but not shown yet: the river-bank and mountain-foot
// transition tiles (tiles/river-bank*, tiles/mountain-foot*), the standing
// element auras (fx/<element>-aura), fx/partner, fx/lava-block and
// summon/owned.

import type { Ability, Element } from "./monsters";

const ROOT = "/games/bach-linh-ky";

/** The emblem of an element (transparent, square). */
export const elementIcon = (e: Element) => `${ROOT}/elements/${e}.webp`;
/** The five elements in a pentagon: the feeding (sinh) ring and the overcoming (khắc) star. */
export const CYCLE_SRC = `${ROOT}/elements/cycle.webp`;

/** The 16:9 painting of two monsters from the same tale, or of two rivals. Either order works. */
export function pairSrc(a: string, b: string): string | null {
  for (const [x, y] of PAIR_FILES) if ((x === a && y === b) || (x === b && y === a)) return `${ROOT}/pairs/${x}--${y}.webp`;
  return null;
}
const PAIR_FILES: [string, string][] = [
  ["chu-dong-tu", "tien-dung"],
  ["an-duong-vuong", "kim-quy"],
  ["phu-dong", "ngua-sat"],
  ["son-tinh", "voi-chin-nga"],
  ["mau-thuong-ngan", "vuon-than"],
  ["ong-ba-muoi", "ma-tranh"],
  ["son-tinh", "thuy-tinh"],
];

/** A whole 8×8 map painted as one picture (square). */
export const mapSrc = (id: string) => `${ROOT}/maps/${id}.webp`;
/** A map's wide cover, for the map picker. */
export const coverSrc = (id: string) => `${ROOT}/covers/${id}.webp`;

/** Effects: one painting per event or ability, shown over a cell. */
export type Fx =
  | `${Element}-strike`
  | `${Element}-aura`
  | `home-${Element}`
  | "counter"
  | "feed"
  | "melee"
  | "ranged"
  | "reveal"
  | "ambush"
  | "fall"
  | "partner"
  | "rival"
  | "temple"
  | "mire"
  | "lava-block"
  | "flood"
  | "raise-mountain"
  | "lightning"
  | "leap"
  | "bind"
  | "seal"
  | "swap"
  | "rise"
  | "recall"
  | "revive"
  | "aura-attack"
  | "aura-defense"
  | "guard-ranged"
  | "immune-ranged"
  | "river-bonus"
  | "fake-level";
export const fxSrc = (fx: Fx) => `${ROOT}/fx/${fx}.webp`;

/** The effect that pictures an ability, for the ability list and the board. */
export function abilityFx(ability: Ability): Fx | null {
  switch (ability.kind) {
    case "terraform":
      return ability.to === "river" ? "flood" : "raise-mountain";
    case "strike":
      return "lightning";
    case "aura":
      return ability.on === "attack" ? "aura-attack" : "aura-defense";
    case "walk-mountain":
      return null;
    default:
      return ability.kind;
  }
}

export const SUMMON = {
  hall: `${ROOT}/summon/hall.webp`,
  array: `${ROOT}/summon/array.webp`,
  rare: `${ROOT}/summon/rare.webp`,
  owned: `${ROOT}/summon/owned.webp`,
  pillar: (e: Element) => `${ROOT}/summon/pillar-${e}.webp`,
};

export const END = { win: `${ROOT}/end/win.webp`, loss: `${ROOT}/end/loss.webp` };

/** Lacquer parts of a piece (all round, transparent outside the circle). */
export const PIECE = {
  base: (e: Element) => `${ROOT}/ui/base-${e}.webp`,
  rim: (side: 0 | 1) => `${ROOT}/ui/rim-${side}.webp`,
  back: `${ROOT}/ui/back.webp`,
  bind: `${ROOT}/ui/badge-bind.webp`,
  seal: `${ROOT}/ui/badge-seal.webp`,
};
