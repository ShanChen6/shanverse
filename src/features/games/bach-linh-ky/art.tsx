// Pieces for Bách Linh Kỳ: lacquer medallions coloured by element, with a
// folk-print style glyph for the monster. Glyphs are shared by kind (a bird,
// a tiger, a sage...), so 50 monsters need about 30 drawings; the element
// colour, the level and the name tell same-glyph monsters apart.

import type * as React from "react";

import { ELEMENT_NAME, monster, type Element } from "./monsters";

/** Ngũ hành colours, after the traditional ones: Kim white-gold, Mộc green, Thủy deep blue-black, Hỏa red, Thổ yellow-ochre. */
export const ELEMENT_COLOR: Record<Element, { base: string; deep: string; ink: string }> = {
  kim: { base: "#e9dfc6", deep: "#b49b5e", ink: "#3a2f1a" },
  moc: { base: "#2f7d52", deep: "#1c5236", ink: "#f3ecd8" },
  thuy: { base: "#25466e", deep: "#142b47", ink: "#e8f0fb" },
  hoa: { base: "#b8392d", deep: "#7e2119", ink: "#fbecd9" },
  tho: { base: "#c9952f", deep: "#8a6118", ink: "#2d1f08" },
};

type G = { fg: string; bg: string };

// Each glyph draws in a 64×64 box, centred around (32, 32), inside a circle of radius ~24.
const GLYPHS: Record<string, (g: G) => React.ReactNode> = {
  bird: ({ fg, bg }) => (
    <g fill={fg}>
      <path d="M30 36 C25 25 17 18 5 15 C11 22 15 31 19 40Z" />
      <path d="M34 36 C39 25 47 18 59 15 C53 22 49 31 45 40Z" />
      <ellipse cx="31" cy="40" rx="13" ry="5.5" />
      <circle cx="44" cy="37" r="4.6" />
      <path d="M47.5 35 L61 39 L47.5 39.5Z" />
      <path d="M20 39 L8 47 L22 44Z" />
      <circle cx="45" cy="36" r="1.4" fill={bg} />
    </g>
  ),
  rooster: ({ fg, bg }) => (
    <g fill={fg}>
      <path d="M36 14 l3 -4 2 4 3 -3 1 5 -3 2Z" />
      <path d="M38 17 C45 17 47 24 44 28 L49 31 L43 32 C44 40 40 47 31 48 C22 48 16 43 15 36 C9 34 8 25 12 18 C16 25 20 28 26 28 C28 22 31 17 38 17Z" />
      <path d="M27 48 l-1 6 M33 48 l1 6" stroke={fg} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="39" cy="22" r="1.6" fill={bg} />
    </g>
  ),
  phoenix: ({ fg, bg }) => (
    <g fill={fg}>
      <path d="M41 12 l2 -4 2 4 3 -2 -1 5Z" />
      <path d="M42 15 C49 16 50 23 46 27 L53 29 L45 31 C44 38 38 42 31 41 C24 44 20 50 12 54 C15 47 17 43 21 39 C14 41 10 39 7 35 C14 35 19 33 23 30 C26 21 33 15 42 15Z" />
      <path d="M30 41 C33 47 38 51 46 53 C40 54 33 52 29 47Z" />
      <circle cx="43" cy="21" r="1.6" fill={bg} />
    </g>
  ),
  tiger: ({ fg, bg }) => (
    <g>
      <path d="M17 18 L22 12 L27 17 M47 18 L42 12 L37 17" fill={fg} stroke={fg} strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 15 C44 15 51 23 51 33 C51 44 43 51 32 51 C21 51 13 44 13 33 C13 23 20 15 32 15Z" fill={fg} />
      <path d="M32 17 v7 M27 18 l2 5 M37 18 l-2 5 M15 30 h7 M15 36 h6 M49 30 h-7 M49 36 h-6" stroke={bg} strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="31" r="2.4" fill={bg} />
      <circle cx="39" cy="31" r="2.4" fill={bg} />
      <path d="M28 40 L32 43 L36 40 Z M32 43 v3 M27 46 q5 3 10 0" fill={bg} stroke={bg} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
  ghost: ({ fg, bg }) => (
    <g>
      <path d="M32 11 C43 11 49 19 49 30 V50 L44 46 L39 51 L34 46 L29 51 L24 46 L19 51 L15 47 V30 C15 19 21 11 32 11Z" fill={fg} />
      <ellipse cx="26" cy="28" rx="3" ry="4.2" fill={bg} />
      <ellipse cx="38" cy="28" rx="3" ry="4.2" fill={bg} />
      <ellipse cx="32" cy="38" rx="3.2" ry="2.4" fill={bg} />
    </g>
  ),
  flame: ({ fg, bg }) => (
    <g>
      <path d="M33 9 C36 18 46 22 46 36 C46 45 40 52 32 52 C24 52 18 46 18 37 C18 29 23 26 25 19 C28 24 29 27 31 28 C33 22 33 15 33 9Z" fill={fg} />
      <path d="M32 33 C34 38 38 40 38 45 C38 48 35 50 32 50 C29 50 26 48 26 45 C26 41 30 39 32 33Z" fill={bg} />
    </g>
  ),
  tree: ({ fg, bg }) => (
    <g fill={fg}>
      <circle cx="22" cy="27" r="10" />
      <circle cx="42" cy="27" r="10" />
      <circle cx="32" cy="19" r="11" />
      <circle cx="32" cy="31" r="10" />
      <path d="M28 36 h8 l2 14 l6 3 h-24 l6 -3Z" />
      <circle cx="27" cy="24" r="1.8" fill={bg} />
      <circle cx="37" cy="24" r="1.8" fill={bg} />
      <path d="M27 31 q5 3 10 0" stroke={bg} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  ),
  sapling: ({ fg }) => (
    <g fill={fg}>
      <path d="M31 52 V28 h2 V52Z" />
      <path d="M32 30 C22 31 15 24 14 14 C24 14 31 20 32 30Z" />
      <path d="M33 36 C42 37 49 31 50 22 C41 22 34 27 33 36Z" />
      <path d="M20 53 h24 l-3 -5 h-18Z" />
    </g>
  ),
  king: ({ fg, bg }) => (
    <g fill={fg}>
      <path d="M19 20 L22 9 L27 15 L32 7 L37 15 L42 9 L45 20Z" />
      <circle cx="32" cy="28" r="8" />
      <path d="M14 54 C15 42 22 37 32 37 C42 37 49 42 50 54Z" />
      <path d="M32 40 v14" stroke={bg} strokeWidth="2" />
      <rect x="20" y="20" width="24" height="2.6" fill={bg} />
    </g>
  ),
  warrior: ({ fg, bg }) => (
    <g fill={fg}>
      <path d="M50 8 L52 10 L40 52 L38 51Z" />
      <path d="M48 6 l6 2 -4 6Z" />
      <path d="M22 22 C22 14 27 11 32 11 C37 11 42 14 42 22 L44 23 H20Z" />
      <path d="M32 5 C30 8 31 10 32 11 C33 10 34 8 32 5Z" />
      <circle cx="32" cy="28" r="7" />
      <path d="M13 54 C14 42 21 37 32 37 C43 37 50 42 51 54Z" />
      <path d="M25 41 l7 6 l7 -6" stroke={bg} strokeWidth="2" fill="none" />
    </g>
  ),
  sage: ({ fg, bg }) => (
    <g fill={fg}>
      <path d="M32 7 L49 22 H15Z" />
      <circle cx="32" cy="28" r="6.5" />
      <path d="M17 55 L24 37 H40 L47 55Z" />
      <path d="M50 18 V55" stroke={fg} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="50" cy="17" r="3" />
      <path d="M26 33 q6 5 12 0" stroke={bg} strokeWidth="1.6" fill="none" />
    </g>
  ),
  lady: ({ fg, bg }) => (
    <g fill={fg}>
      <circle cx="32" cy="13" r="6" />
      <path d="M22 16 h20 l-2 4 h-16Z" />
      <circle cx="32" cy="27" r="7" />
      <path d="M14 55 C17 44 22 37 32 37 C42 37 47 44 50 55Z" />
      <path d="M32 38 C29 45 27 50 26 55 M32 38 C35 45 37 50 38 55" stroke={bg} strokeWidth="1.8" fill="none" />
      <circle cx="32" cy="27" r="1.4" fill={bg} />
    </g>
  ),
  ape: ({ fg, bg }) => (
    <g>
      <circle cx="16" cy="28" r="5" fill={fg} />
      <circle cx="48" cy="28" r="5" fill={fg} />
      <path d="M32 12 C43 12 48 20 48 30 C48 42 41 50 32 50 C23 50 16 42 16 30 C16 20 21 12 32 12Z" fill={fg} />
      <path d="M32 24 C38 22 43 26 42 31 C42 34 40 35 38 36 C40 41 37 46 32 46 C27 46 24 41 26 36 C24 35 22 34 22 31 C21 26 26 22 32 24Z" fill={bg} />
      <circle cx="27.5" cy="30" r="2" fill={fg} />
      <circle cx="36.5" cy="30" r="2" fill={fg} />
      <path d="M28 41 q4 3 8 0" stroke={fg} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  ),
  fish: ({ fg, bg }) => (
    <g>
      <path d="M8 32 C16 20 32 17 44 25 L56 15 L53 32 L56 49 L44 39 C32 47 16 44 8 32Z" fill={fg} />
      <path d="M26 21 C30 14 36 14 38 22Z" fill={fg} />
      <circle cx="17" cy="30" r="2.3" fill={bg} />
      <path d="M24 26 q4 6 0 12 M31 25 q4 7 0 14" stroke={bg} strokeWidth="1.6" fill="none" />
    </g>
  ),
  crab: ({ fg, bg }) => (
    <g>
      <path d="M14 34 l-6 6 M15 38 l-5 9 M50 34 l6 6 M49 38 l5 9" stroke={fg} strokeWidth="2.6" strokeLinecap="round" />
      <ellipse cx="32" cy="36" rx="17" ry="11" fill={fg} />
      <path d="M17 28 C10 26 8 18 13 13 L16 19 L19 13 C24 17 22 25 17 28Z" fill={fg} />
      <path d="M47 28 C54 26 56 18 51 13 L48 19 L45 13 C40 17 42 25 47 28Z" fill={fg} />
      <circle cx="27" cy="31" r="2" fill={bg} />
      <circle cx="37" cy="31" r="2" fill={bg} />
    </g>
  ),
  buffalo: ({ fg, bg }) => (
    <g>
      <path d="M22 22 C12 22 6 16 7 8 C11 14 16 16 24 16 M42 22 C52 22 58 16 57 8 C53 14 48 16 40 16" stroke={fg} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M21 18 H43 C46 26 45 34 42 40 C40 47 36 52 32 52 C28 52 24 47 22 40 C19 34 18 26 21 18Z" fill={fg} />
      <ellipse cx="32" cy="45" rx="7" ry="5" fill={bg} />
      <circle cx="29" cy="45" r="1.4" fill={fg} />
      <circle cx="35" cy="45" r="1.4" fill={fg} />
      <circle cx="26" cy="29" r="2.2" fill={bg} />
      <circle cx="38" cy="29" r="2.2" fill={bg} />
    </g>
  ),
  serpent: ({ fg, bg }) => (
    <g>
      <path d="M12 50 C24 54 30 46 26 38 C22 30 22 22 32 20 C40 18 44 22 46 26" stroke={fg} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M40 22 C42 13 52 11 56 17 C58 22 54 28 46 28Z" fill={fg} />
      <circle cx="51" cy="18" r="1.8" fill={bg} />
      <path d="M57 22 l4 1 M57 22 l3 3" stroke={fg} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  ),
  dragon: ({ fg, bg }) => (
    <g>
      <path d="M8 48 C18 56 28 50 26 41 C24 32 26 24 36 22" stroke={fg} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M33 22 C35 12 46 9 53 14 L58 13 L56 18 C58 22 55 28 47 29 C42 30 37 28 33 22Z" fill={fg} />
      <path d="M44 12 C42 7 38 6 35 7 M49 12 C49 6 52 4 55 4" stroke={fg} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M14 46 l-3 -5 M20 45 l-1 -6 M25 40 l-5 -3" stroke={bg} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="47" cy="17" r="1.8" fill={bg} />
      <path d="M50 26 C46 32 40 34 36 33" stroke={fg} strokeWidth="1.6" fill="none" />
    </g>
  ),
  toad: ({ fg, bg }) => (
    <g>
      <path d="M10 46 C10 34 19 26 32 26 C45 26 54 34 54 46 C54 50 50 52 44 52 H20 C14 52 10 50 10 46Z" fill={fg} />
      <circle cx="22" cy="25" r="6.5" fill={fg} />
      <circle cx="42" cy="25" r="6.5" fill={fg} />
      <circle cx="22" cy="24" r="2.6" fill={bg} />
      <circle cx="42" cy="24" r="2.6" fill={bg} />
      <path d="M20 38 q12 6 24 0" stroke={bg} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="46" r="1.6" fill={bg} />
      <circle cx="31" cy="47" r="1.6" fill={bg} />
      <circle cx="46" cy="45" r="1.6" fill={bg} />
    </g>
  ),
  fox: ({ fg, bg }) => (
    <g>
      <path d="M42 46 C52 46 58 38 56 28 C54 36 50 38 45 38 M44 50 C55 52 61 46 61 38" stroke={fg} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M12 12 L24 22 H40 L52 12 L48 30 L32 50 L16 30Z" fill={fg} />
      <path d="M17 18 L22 24 M47 18 L42 24" stroke={bg} strokeWidth="1.6" />
      <path d="M22 30 l5 3 M42 30 l-5 3" stroke={bg} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="32" cy="44" r="2.2" fill={bg} />
    </g>
  ),
  horse: ({ fg, bg }) => (
    <g>
      <path d="M22 54 C22 44 24 36 22 28 C20 20 26 12 34 11 L36 6 L39 11 C46 12 52 18 54 26 L56 33 C57 37 53 39 50 36 L45 31 C41 33 38 38 38 44 V54Z" fill={fg} />
      <path d="M33 13 C28 16 26 22 27 28 C24 22 25 16 28 13 M30 16 C26 20 25 26 27 31" stroke={bg} strokeWidth="1.6" fill="none" />
      <circle cx="44" cy="20" r="1.8" fill={bg} />
      <path d="M50 30 l3 -2" stroke={bg} strokeWidth="1.4" />
    </g>
  ),
  turtle: ({ fg, bg }) => (
    <g>
      <ellipse cx="51" cy="32" rx="6" ry="5" fill={fg} />
      <path d="M18 22 l-6 -5 M18 42 l-6 5 M44 22 l5 -5 M44 42 l5 5 M12 32 h-5" stroke={fg} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="30" cy="32" rx="18" ry="14" fill={fg} />
      <path d="M30 22 l6 4 v7 l-6 4 l-6 -4 v-7Z M30 22 v-6 M36 26 l6 -4 M36 33 l6 4 M30 37 v6 M24 33 l-6 4 M24 26 l-6 -4" stroke={bg} strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      <circle cx="53" cy="30" r="1.4" fill={bg} />
    </g>
  ),
  lion: ({ fg, bg }) => (
    <g>
      <path
        d="M32 8 L36 13 L42 10 L43 16 L50 16 L48 22 L54 26 L49 30 L54 35 L48 38 L50 45 L43 44 L42 51 L36 48 L32 54 L28 48 L22 51 L21 44 L14 45 L16 38 L10 35 L15 30 L10 26 L16 22 L14 16 L21 16 L22 10 L28 13Z"
        fill={fg}
      />
      <circle cx="32" cy="32" r="12" fill={bg} />
      <circle cx="27" cy="29" r="2.3" fill={fg} />
      <circle cx="37" cy="29" r="2.3" fill={fg} />
      <path d="M29 35 h6 l-3 3Z M26 39 q6 4 12 0" fill={fg} stroke={fg} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M25 24 q2 -2 4 0 M35 24 q2 -2 4 0" stroke={fg} strokeWidth="1.6" fill="none" />
    </g>
  ),
  elephant: ({ fg, bg }) => (
    <g>
      <path d="M18 18 C8 18 6 30 8 38 C10 44 16 44 20 40Z M46 18 C56 18 58 30 56 38 C54 44 48 44 44 40Z" fill={fg} />
      <path d="M32 14 C42 14 47 21 47 30 C47 37 42 41 37 42 V52 C37 56 33 57 31 54 C30 52 32 50 32 48 C27 47 27 42 28 41 C21 39 17 35 17 29 C17 21 22 14 32 14Z" fill={fg} />
      <path d="M28 40 C24 46 18 47 14 44 M36 40 C40 46 46 47 50 44" stroke={bg} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="26" cy="27" r="2" fill={bg} />
      <circle cx="38" cy="27" r="2" fill={bg} />
    </g>
  ),
  stone: ({ fg, bg }) => (
    <g>
      <path d="M12 46 L16 28 L27 16 L42 18 L52 30 L52 46 L40 52 H22Z" fill={fg} />
      <path d="M30 18 L27 28 L33 33 L29 42" stroke={bg} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <circle cx="38" cy="32" r="2.2" fill={bg} />
      <circle cx="46" cy="32" r="2.2" fill={bg} />
      <path d="M38 41 h8" stroke={bg} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  ogre: ({ fg, bg }) => (
    <g>
      <path d="M19 20 L14 6 L26 15 M45 20 L50 6 L38 15" fill={fg} stroke={fg} strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 13 C45 13 51 22 51 33 C51 45 43 53 32 53 C21 53 13 45 13 33 C13 22 19 13 32 13Z" fill={fg} />
      <path d="M20 26 l9 4 M44 26 l-9 4" stroke={bg} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="25" cy="33" r="2.6" fill={bg} />
      <circle cx="39" cy="33" r="2.6" fill={bg} />
      <path d="M21 42 H43 L40 47 H24Z" fill={bg} />
      <path d="M25 42 l2 4 l2 -4 M35 42 l2 4 l2 -4" fill={fg} />
    </g>
  ),
  bolt: ({ fg, bg }) => (
    <g>
      <path d="M36 6 L18 34 H30 L24 58 L46 26 H34 L42 6Z" fill={fg} />
      <path d="M33 14 L25 30" stroke={bg} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
  fishdragon: ({ fg, bg }) => (
    <g>
      <path d="M10 46 C16 38 26 38 32 44 C38 50 48 48 52 40" stroke={fg} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M50 42 L60 34 L58 48Z" fill={fg} />
      <path d="M6 44 C6 32 14 24 24 24 C22 30 22 36 24 40 C18 38 12 40 10 46Z" fill={fg} />
      <path d="M8 30 C10 24 14 20 20 19 M12 26 C10 20 12 16 16 14" stroke={fg} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="15" cy="34" r="1.8" fill={bg} />
      <path d="M30 42 l2 -5 M38 45 l2 -5 M45 44 l3 -5" stroke={fg} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  belly: ({ fg, bg }) => (
    <g>
      <circle cx="32" cy="18" r="8" fill={fg} />
      <path d="M28 20 q4 3 8 0" stroke={bg} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="41" rx="16" ry="14" fill={fg} />
      <circle cx="32" cy="43" r="2" fill={bg} />
      <path d="M46 30 L56 22 L58 34Z" fill={fg} />
      <path d="M50 28 l5 -3 M51 31 l6 -1" stroke={bg} strokeWidth="1.2" />
    </g>
  ),
  hearth: ({ fg, bg }) => (
    <g>
      <path d="M14 26 H50 C50 36 44 42 32 42 C20 42 14 36 14 26Z" fill={fg} />
      <path d="M12 26 H52" stroke={fg} strokeWidth="3" strokeLinecap="round" />
      <path d="M26 14 c-3 4 3 6 0 10 M33 12 c-3 4 3 6 0 10 M40 14 c-3 4 3 6 0 10" stroke={fg} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M22 54 C20 48 24 46 25 42 C27 46 28 47 30 44 C31 48 34 46 34 42 C37 46 40 47 42 54Z" fill={fg} />
      <path d="M20 32 H44" stroke={bg} strokeWidth="1.6" />
    </g>
  ),
  melon: ({ fg, bg }) => (
    <g>
      <path d="M8 26 H56 C56 40 45 52 32 52 C19 52 8 40 8 26Z" fill={fg} />
      <path d="M13 29 H51 C50 39 42 47 32 47 C22 47 14 39 13 29Z" fill={bg} />
      <path d="M17 31 H47 C46 38 40 43 32 43 C24 43 18 38 17 31Z" fill={fg} opacity="0.55" />
      <path d="M24 34 l1 2 M32 36 l1 2 M40 34 l1 2 M28 39 l1 2 M36 39 l1 2" stroke={fg} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M26 20 C28 14 34 12 38 14 C34 16 30 18 26 20Z" fill={fg} />
    </g>
  ),
  wave: ({ fg, bg }) => (
    <g>
      <path d="M8 44 C14 30 26 22 38 24 C48 26 52 34 48 40 C46 34 40 32 36 36 C32 40 36 46 42 46 C34 52 18 52 8 44Z" fill={fg} />
      <path d="M8 52 C16 48 22 56 30 52 C38 48 44 56 56 50" stroke={fg} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M22 13 L26 6 L30 12 L34 5 L38 12 L42 6 L46 13Z" fill={fg} />
      <path d="M24 16 H44" stroke={fg} strokeWidth="2.4" />
      <circle cx="40" cy="38" r="1.8" fill={bg} />
    </g>
  ),
  peak: ({ fg, bg }) => (
    <g>
      <path d="M6 52 L24 18 L32 30 L42 12 L58 52Z" fill={fg} />
      <path d="M24 18 L19 28 L24 26 L28 30Z M42 12 L36 24 L42 21 L47 25Z" fill={bg} />
      <path d="M14 52 C20 44 26 46 32 42 C38 46 44 44 50 52" stroke={bg} strokeWidth="1.8" fill="none" />
    </g>
  ),
};

/** Which glyph each monster uses. */
export const GLYPH_OF: Record<string, keyof typeof GLYPHS> = {
  "chim-lac": "bird",
  "ma-tranh": "ghost",
  "dai-bang": "bird",
  "ong-ba-muoi": "tiger",
  "con-kim": "fishdragon",
  "cao-bien": "sage",
  "an-duong-vuong": "king",
  "ly-thuong-kiet": "warrior",
  "bach-ho": "tiger",
  "tran-hung-dao": "warrior",
  "moc-tinh-non": "sapling",
  "ma-cay-gao": "ghost",
  "chu-cuoi": "sage",
  "vuon-than": "ape",
  "bach-ke-tinh": "rooster",
  "tien-dung": "lady",
  "chu-dong-tu": "sage",
  "chan-tinh": "ogre",
  "mau-thuong-ngan": "lady",
  "xuong-cuong": "tree",
  "ma-da": "ghost",
  "ca-chep": "fish",
  "mai-an-tiem": "melon",
  "da-trang": "crab",
  "nguu-tinh": "buffalo",
  "ngu-tinh": "fish",
  "thuy-tinh": "wave",
  "thuong-luong": "serpent",
  "lac-long-quan": "dragon",
  "mau-thoai": "lady",
  "coc-tia": "toad",
  "ma-troi": "flame",
  "ho-tinh": "fox",
  "ong-tao": "hearth",
  "xa-tinh": "serpent",
  "ngua-sat": "horse",
  "phuong-hoang": "phoenix",
  "than-set": "bolt",
  "phu-dong": "warrior",
  "lieu-hanh": "lady",
  "thach-tinh": "stone",
  "rua-con": "turtle",
  lan: "lion",
  "ong-dia": "belly",
  "tu-dao-hanh": "sage",
  "voi-chin-nga": "elephant",
  "mau-dia": "lady",
  nghe: "lion",
  "son-tinh": "peak",
  "kim-quy": "turtle",
};

export const GLYPH_NAMES = Object.keys(GLYPHS);

/** The glyph alone, in a 64×64 box. */
export function Glyph({ name, fg, bg }: { name: string; fg: string; bg: string }) {
  const draw = GLYPHS[name] ?? GLYPHS.ghost;
  return <>{draw({ fg, bg })}</>;
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
  const fg = locked ? "#18181b" : c.ink;
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
      <g transform="translate(32 31) scale(0.8) translate(-32 -32)">
        <Glyph name={GLYPH_OF[m.id] ?? "ghost"} fg={fg} bg={c.base} />
      </g>
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
