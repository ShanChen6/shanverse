// Pieces for Bách Linh Kỳ: lacquer medallions coloured by element, each
// with its monster's own portrait (portraits.tsx).

import type * as React from "react";

import { ELEMENT_NAME, monster, type Element } from "./monsters";
import { PORTRAITS, type Pal } from "./portraits";

/** Ngũ hành colours, after the traditional ones: Kim white-gold, Mộc green, Thủy deep blue-black, Hỏa red, Thổ yellow-ochre. */
export const ELEMENT_COLOR: Record<Element, { base: string; deep: string; ink: string }> = {
  kim: { base: "#e9dfc6", deep: "#b49b5e", ink: "#3a2f1a" },
  moc: { base: "#2f7d52", deep: "#1c5236", ink: "#f3ecd8" },
  thuy: { base: "#25466e", deep: "#142b47", ink: "#e8f0fb" },
  hoa: { base: "#b8392d", deep: "#7e2119", ink: "#fbecd9" },
  tho: { base: "#c9952f", deep: "#8a6118", ink: "#2d1f08" },
};

/** The bright colour of each element's light: eyes, magic, the summoning glow. */
export const ELEMENT_GLOW: Record<Element, string> = { kim: "#5fc8ff", moc: "#9dff7a", thuy: "#7fd8ff", hoa: "#ffd23f", tho: "#7dffcf" };

/** Colours a portrait draws with on its element's medallion (or all one tone, for a locked silhouette). */
export function palette(element: Element, locked = false): Pal {
  if (locked) {
    const d = "#18181b";
    return { ink: d, paper: "#3f3f46", deep: "#27272a", glow: d, gold: d, red: d, white: d, dark: d, steel: d, green: d, blue: d, purple: d, skin: d, locked: true };
  }
  const c = ELEMENT_COLOR[element];
  return {
    ink: c.ink,
    paper: c.base,
    deep: c.deep,
    glow: ELEMENT_GLOW[element],
    gold: element === "tho" ? "#ffe9a3" : "#e8b23a",
    red: element === "hoa" ? "#6e130d" : "#c8372d",
    white: element === "kim" ? "#ffffff" : "#f6f1e6",
    dark: "#1d1611",
    steel: element === "kim" ? "#8d99a6" : "#b9c3cc",
    green: element === "moc" ? "#b9f08a" : "#3fae6a",
    blue: element === "thuy" ? "#a8dcff" : "#3d7fc4",
    purple: "#9a5fe0",
    skin: "#f1cf9f",
    locked: false,
  };
}

type TokenProps = {
  /** null draws a face-down piece. */
  monsterId: string | null;
  /** The level shown on the badge (a disguise shows its fake one). */
  level: number;
  side: 0 | 1;
  /** Grey silhouette for a monster not yet in the collection. */
  locked?: boolean;
  className?: string;
  title?: string;
};

/**
 * A round piece. Face up: element colour, glyph, level badge. Face down: the
 * Tianwu-red lacquer back with a gold seal and only the level. Player pieces
 * have a gold rim, Tianwu's a dark one.
 */
export function Token({ monsterId, level, side, locked = false, className, title }: TokenProps) {
  const rim = side === 0 ? "#e2b84a" : "#1a1a22";
  const rimInner = side === 0 ? "#fff3c4" : "#5b5b6e";
  const label = title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
  if (!monsterId) {
    return (
      <svg viewBox="0 0 64 64" className={className} {...label}>
        {title ? <title>{title}</title> : null}
        <circle cx="32" cy="32" r="30" fill={rim} />
        <circle cx="32" cy="32" r="27" fill="#5a1414" stroke={rimInner} strokeWidth="1" />
        <circle cx="32" cy="32" r="20" fill="none" stroke="#c99a3b" strokeWidth="1.4" strokeDasharray="3 2.4" />
        <path d="M32 17 L45 32 L32 47 L19 32Z" fill="none" stroke="#c99a3b" strokeWidth="1.6" />
        <text x="32" y="38.5" textAnchor="middle" fontSize="18" fontWeight="800" fill="#f3d58a" fontFamily="ui-sans-serif, system-ui">
          {level}
        </text>
      </svg>
    );
  }
  const m = monster(monsterId);
  const c = locked ? { base: "#3f3f46", deep: "#27272a", ink: "#18181b" } : ELEMENT_COLOR[m.element];
  return (
    <svg viewBox="0 0 64 64" className={className} {...label}>
      {title ? <title>{title}</title> : null}
      <defs>
        <radialGradient id={`blk-g-${m.element}-${locked ? "l" : "u"}`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor={c.base} />
          <stop offset="1" stopColor={c.deep} />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={rim} />
      <circle cx="32" cy="32" r="27" fill={`url(#blk-g-${m.element}-${locked ? "l" : "u"})`} stroke={rimInner} strokeWidth="1" />
      <clipPath id="blk-clip">
        <circle cx="32" cy="32" r="26.5" />
      </clipPath>
      <g clipPath="url(#blk-clip)">{PORTRAITS[m.id]?.(palette(m.element, locked))}</g>
      <circle cx="51" cy="51" r="9" fill="#111827" stroke={rim} strokeWidth="1.6" />
      <text x="51" y="55" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#fff" fontFamily="ui-sans-serif, system-ui">
        {level}
      </text>
    </svg>
  );
}

/** A small round swatch of an element's colour, with its name for screen readers. */
export function ElementDot({ element, lang, className }: { element: Element; lang: "vi" | "en"; className?: string }) {
  return (
    <span
      className={className}
      title={ELEMENT_NAME[element][lang]}
      style={{ display: "inline-block", width: "0.7em", height: "0.7em", borderRadius: 9999, background: ELEMENT_COLOR[element].base, boxShadow: `inset 0 0 0 1.5px ${ELEMENT_COLOR[element].deep}` }}
    />
  );
}
