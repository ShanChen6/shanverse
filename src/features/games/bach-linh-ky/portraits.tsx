// One portrait per monster, drawn in a 64×64 box for the round piece
// (clipped to a circle of radius 27 around the centre, so busts and big
// beasts may run off the edge). Each one carries the signature details of
// its description: Chim Lạc's blade-curved Đông Sơn feathers, Ma Trành's
// broken chain, Con Kìm biting its own tail, Hồ Tinh's nine flame tails...
//
// Colours come from a palette so the same drawing works on its element's
// medallion and, all in one dark tone, as the silhouette of a monster not
// yet in the collection.

import type * as React from "react";

export type Pal = {
  /** Main drawing colour, readable on the medallion. */
  ink: string;
  /** The medallion colour, used to cut details out of the ink. */
  paper: string;
  /** A darker shade of the medallion. */
  deep: string;
  /** The element's light: eyes, magic, auras. */
  glow: string;
  gold: string;
  red: string;
  white: string;
  dark: string;
  steel: string;
  green: string;
  blue: string;
  purple: string;
  skin: string;
  /** Silhouette mode: every colour above is one flat tone. */
  locked: boolean;
};

type Draw = (p: Pal) => React.ReactNode;

const eye = (cx: number, cy: number, r: number, color: string, ring?: string) => (
  <>
    {ring ? <circle cx={cx} cy={cy} r={r + 0.9} fill={ring} /> : null}
    <circle cx={cx} cy={cy} r={r} fill={color} />
  </>
);

/** A fixed colour that turns into the silhouette tone for a locked monster. */
const c = (p: Pal, color: string) => (p.locked ? p.ink : color);

/** A face: skin, two eyes, brows, a mouth. `mood` sets the brows and mouth. */
const face = (p: Pal, cx: number, cy: number, r: number, mood: "calm" | "stern" | "smile" | "fierce" = "calm", eyes?: string) => {
  const ex = r * 0.38;
  const ey = cy - r * 0.05;
  const brow = mood === "stern" || mood === "fierce" ? 0.35 : mood === "smile" ? -0.25 : 0;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={p.skin} />
      <path
        d={`M${cx - ex - r * 0.22} ${ey - r * 0.32 - brow} L${cx - ex + r * 0.22} ${ey - r * 0.32 + brow} M${cx + ex + r * 0.22} ${ey - r * 0.32 - brow} L${cx + ex - r * 0.22} ${ey - r * 0.32 + brow}`}
        stroke={p.dark}
        strokeWidth={r * 0.12}
        strokeLinecap="round"
      />
      <circle cx={cx - ex} cy={ey} r={r * 0.11} fill={eyes ?? p.dark} />
      <circle cx={cx + ex} cy={ey} r={r * 0.11} fill={eyes ?? p.dark} />
      <path
        d={mood === "smile" ? `M${cx - r * 0.3} ${cy + r * 0.35} Q${cx} ${cy + r * 0.62} ${cx + r * 0.3} ${cy + r * 0.35}` : mood === "fierce" ? `M${cx - r * 0.3} ${cy + r * 0.5} L${cx} ${cy + r * 0.38} L${cx + r * 0.3} ${cy + r * 0.5}` : `M${cx - r * 0.22} ${cy + r * 0.45} H${cx + r * 0.22}`}
        stroke={p.dark}
        strokeWidth={r * 0.1}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
};

// --- Kim (Metal) ---------------------------------------------------------------------

const KIM: Record<string, Draw> = {
  // Silver crane of the bronze drums: long beak, crest, wings of curved blade-feathers, pale blue eye.
  "chim-lac": (p) => (
    <g>
      <path d="M20 37 C16 28 14 18 6 9 L13 12 L11 5 L18 11 L17 3 L24 11 L25 4 L29 14 C31 21 32 29 32 36Z" fill={p.ink} />
      <path d="M12 13 C17 19 21 26 23 34 M19 11 C23 18 26 26 27 34 M25 11 C28 18 29 26 30 34" stroke={p.paper} strokeWidth="0.9" fill="none" />
      <path d="M8 45 C14 39 24 36 34 36 C40 36 44 34 47 30 C49 27 53 27 55 30 L63 32 L55 33.5 C53 37 48 41 40 42 C30 44 18 47 8 45Z" fill={p.ink} />
      <path d="M48 28 C46 23 47 18 50 15 M51 27 C51 22 53 19 57 17 M53 28 C55 24 58 23 61 23" stroke={p.ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M10 45 L1 40 L6 46 L0 52 L12 47Z" fill={p.ink} />
      <path d="M16 42 q4 -3 8 -1 q4 -3 8 -1 q4 -3 8 -1" stroke={p.steel} strokeWidth="0.9" fill="none" />
      {eye(51.5, 30.5, 1.4, p.glow, p.dark)}
    </g>
  ),
  // Grey ghost of a tiger's victim: broken iron chain on the neck, metal-tipped claws.
  "ma-tranh": (p) => (
    <g>
      <path d="M32 9 C42 9 47 17 47 27 C47 34 45 38 47 44 L52 52 L44 49 L40 55 L36 49 L31 56 L27 49 L22 54 L19 47 L12 50 L17 42 C19 37 17 33 17 27 C17 17 22 9 32 9Z" fill={p.steel} opacity={p.locked ? 1 : 0.92} />
      <path d="M17 27 C17 17 22 9 32 9 C42 9 47 17 47 27" fill="none" stroke={p.ink} strokeWidth="1.2" />
      <ellipse cx="26.5" cy="24" rx="3.2" ry="4.2" fill={p.dark} />
      <ellipse cx="37.5" cy="24" rx="3.2" ry="4.2" fill={p.dark} />
      {eye(26.5, 24.5, 1.2, p.glow)}
      {eye(37.5, 24.5, 1.2, p.glow)}
      <path d="M27 32 Q32 35 37 32" stroke={p.dark} strokeWidth="1.6" fill="none" />
      <g fill="none" stroke={p.ink} strokeWidth="2">
        <ellipse cx="21" cy="38" rx="3" ry="2" />
        <ellipse cx="27" cy="40" rx="3" ry="2" />
        <ellipse cx="33" cy="40.5" rx="3" ry="2" />
        <ellipse cx="39" cy="39.5" rx="3" ry="2" />
        <path d="M44 38 l3 -2 M45 41 l3 1" />
      </g>
      <path d="M12 40 l-4 -3 M13 43 l-5 0 M13 46 l-4 3" stroke={p.ink} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
  // Armoured eagle: scaled metal breast, hooked beak, ember-red eye, blade wings.
  "dai-bang": (p) => (
    <g>
      <path d="M6 30 L20 26 L12 20 L26 22 L20 13 L33 21 L36 30Z" fill={p.ink} />
      <path d="M58 30 L46 27 L54 21 L42 23 L48 14 L37 21 L33 30Z" fill={p.ink} opacity="0.85" />
      <path d="M24 30 C24 22 30 17 37 18 C44 19 47 24 46 30 L44 46 C40 52 30 52 26 46Z" fill={p.ink} />
      <path d="M44 22 C49 22 52 25 52 29 C49 27 47 27 45 28Z" fill={p.gold} stroke={p.ink} strokeWidth="0.8" />
      {eye(40, 24, 1.7, p.red, p.dark)}
      <g fill="none" stroke={p.steel} strokeWidth="1.1">
        <path d="M28 33 q2.5 2 5 0 q2.5 2 5 0 q2.5 2 5 0" />
        <path d="M28 37 q2.5 2 5 0 q2.5 2 5 0 q2.5 2 5 0" />
        <path d="M29 41 q2.5 2 5 0 q2.5 2 5 0 q2 1.6 4 0" />
      </g>
      <path d="M29 47 l-2 6 M33 49 l0 6 M37 49 l2 6" stroke={p.ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M26 53 l2 -1 M32 56 l1.5 -1 M38 56 l1.5 -1" stroke={p.steel} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
  // The tiger on the prowl, side view: platinum coat, black stripes, steel claws, cold aura.
  "ong-ba-muoi": (p) => (
    <g>
      <path d="M8 46 C10 40 14 37 20 36 L38 35 C42 30 46 28 51 29 L55 26 L56 31 C59 33 59 37 56 39 L50 41 L47 47 L44 47 L44 42 L38 43 L36 50 L33 50 L33 44 L22 44 L19 51 L16 51 L17 44 C13 46 11 49 8 52 C6 52 6 49 8 46Z" fill={p.white} stroke={p.ink} strokeWidth="1" />
      <path d="M8 46 C5 44 4 40 6 36" stroke={p.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      <g stroke={p.dark} strokeWidth="1.8" strokeLinecap="round">
        <path d="M23 36 l1 5 M28 35.5 l0 6 M33 35.5 l-1 6 M38 36 l-1 5 M44 31 l2 3 M48 30 l1 3" />
      </g>
      {eye(52, 32, 1.2, p.glow, p.dark)}
      <path d="M55 37 l3 0" stroke={p.dark} strokeWidth="1.2" />
      <path d="M16 51 l-1.5 2 M19 51 l1 2 M33 50 l-1 2 M36 50 l1 2 M44 47 l-1 2 M47 47 l1 2" stroke={p.steel} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 30 q8 -6 16 -4 M40 22 q6 -5 14 -2" stroke={p.glow} strokeWidth="1" fill="none" opacity="0.8" />
    </g>
  ),
  // Dragon head, carp body of bronze scales, curled on itself biting its own tail.
  "con-kim": (p) => (
    <g>
      <path d="M32 12 C45 12 52 21 52 32 C52 44 43 52 32 52 C21 52 12 44 12 33" stroke={p.ink} strokeWidth="8" fill="none" strokeLinecap="round" />
      <g fill="none" stroke={p.gold} strokeWidth="1">
        <path d="M30 12 q2 3 4 0 M40 15 q1 3.5 4 1 M48 22 q0 3.5 3.5 2.5 M51 32 q-1.5 3 2 3.5 M48 43 q-2 2 1 4 M40 50 q-3 1 -1 4 M30 52 q-3 -1 -3 3 M21 49 q-3 -2 -4 1" />
      </g>
      <path d="M12 33 C6 31 4 25 7 20 L11 23 L10 16 L16 20 C20 17 24 18 25 22 C26 27 22 31 17 32Z" fill={p.ink} />
      <path d="M9 17 C7 12 9 8 13 7 M13 18 C14 13 18 11 21 12" stroke={p.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {eye(15, 24, 1.4, p.glow, p.dark)}
      <path d="M22 27 C25 27 28 25 30 22" stroke={p.ink} strokeWidth="2.4" fill="none" />
      <path d="M26 16 L33 8 L32 15 L38 11 L34 18Z" fill={p.ink} />
      <g fill={p.gold}>
        <circle cx="34" cy="32" r="1.1" />
        <circle cx="29" cy="28" r="0.8" />
        <circle cx="37" cy="27" r="0.8" />
        <circle cx="31" cy="36" r="0.7" />
      </g>
    </g>
  ),
  // Pale sorcerer in a black cloak stitched with a gold trận đồ, bronze sword, floating bronze talismans.
  "cao-bien": (p) => (
    <g>
      <rect x="7" y="13" width="7" height="11" rx="1" fill={p.gold} transform="rotate(-14 10 18)" />
      <rect x="50" y="11" width="7" height="11" rx="1" fill={p.gold} transform="rotate(12 53 16)" />
      <rect x="51" y="34" width="6" height="10" rx="1" fill={p.gold} transform="rotate(20 54 39)" />
      <path d="M9 16 h4 M9 19 h4 M52 14 h4 M52 17 h4 M52 37 h3" stroke={p.dark} strokeWidth="0.8" />
      <path d="M32 9 C27 9 23 13 23 19 C23 24 27 28 32 28 C37 28 41 24 41 19 C41 13 37 9 32 9Z" fill={p.white} />
      <path d="M22 18 C22 10 27 6 32 6 C37 6 42 10 42 18 C40 13 36 11 32 11 C28 11 24 13 22 18Z" fill={p.dark} />
      <path d="M27.5 19 l3 1 M36.5 19 l-3 1" stroke={p.dark} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M29 24 q3 1 6 0" stroke={p.dark} strokeWidth="1" />
      <path d="M10 60 C12 42 20 31 32 30 C44 31 52 42 54 60Z" fill={p.dark} />
      <g fill="none" stroke={p.gold} strokeWidth="0.9">
        <path d="M32 34 L41 43 L32 52 L23 43Z" />
        <circle cx="32" cy="43" r="4" />
        <path d="M32 34 V52 M23 43 H41" />
      </g>
      <path d="M44 56 L58 30" stroke={p.gold} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M42 51 l6 3" stroke={p.ink} strokeWidth="2" />
      <circle cx="57" cy="30" r="1.8" fill={p.glow} />
    </g>
  ),
  // The king: crown, bronze scale armour set with pearls, the Liên Châu crossbow loosing golden bolts.
  "an-duong-vuong": (p) => (
    <g>
      <path d="M22 13 L24 5 L28 10 L32 3 L36 10 L40 5 L42 13Z" fill={p.gold} stroke={p.ink} strokeWidth="0.9" />
      <circle cx="32" cy="8" r="1.3" fill={p.white} />
      {face(p, 32, 20, 7.5, "stern")}
      <path d="M26 24 C27 29 29 31 32 31 C35 31 37 29 38 24 L40 26 C39 32 36 34 32 34 C28 34 25 32 24 26Z" fill={p.ink} />
      <path d="M10 60 C11 44 19 34 32 34 C45 34 53 44 54 60Z" fill={p.ink} />
      <g fill="none" stroke={p.gold} strokeWidth="0.9">
        <path d="M18 44 q3 2.5 6 0 q3 2.5 6 0 q3 2.5 6 0 q3 2.5 6 0 q3 2.5 6 0" />
        <path d="M16 50 q3 2.5 6 0 q3 2.5 6 0 q3 2.5 6 0 q3 2.5 6 0 q3 2.5 6 0 q3 2.5 6 0" />
      </g>
      <g fill={p.white}>
        <circle cx="26" cy="40" r="1" />
        <circle cx="32" cy="39" r="1" />
        <circle cx="38" cy="40" r="1" />
      </g>
      <path d="M8 34 H48" stroke={p.gold} strokeWidth="3" strokeLinecap="round" />
      <path d="M14 27 C18 31 18 37 14 41" stroke={p.gold} strokeWidth="2.4" fill="none" />
      <circle cx="40" cy="34" r="3" fill={p.gold} stroke={p.ink} strokeWidth="0.8" />
      <path d="M40 31.5 v5 M37.5 34 h5" stroke={p.ink} strokeWidth="0.8" />
      <path d="M50 30 l9 -3 M50 34 l10 0 M50 38 l9 3" stroke={p.glow} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
  // The general: red battle robe, golden dragon pauldrons, gilded sword, the poem glowing behind him.
  "ly-thuong-kiet": (p) => (
    <g>
      <g fill={p.gold} opacity={p.locked ? 1 : 0.9} fontSize="6.5" fontWeight="700" fontFamily="serif" textAnchor="middle">
        <text x="9" y="18">南</text>
        <text x="9" y="27">國</text>
        <text x="9" y="36">山</text>
        <text x="9" y="45">河</text>
      </g>
      <path d="M24 14 C24 8 28 5 33 5 C38 5 42 8 42 14 L44 15 H22Z" fill={p.ink} />
      <path d="M33 1 C31 3 32 5 33 5 C34 5 35 3 33 1Z" fill={p.red} />
      {face(p, 33, 20, 6.5, "fierce")}
      <path d="M14 62 C15 44 22 30 33 30 C44 30 51 44 52 62Z" fill={p.red} stroke={p.ink} strokeWidth="1" />
      <path d="M17 36 C21 30 27 30 29 34 C25 34 22 36 21 40Z M49 36 C45 30 39 30 37 34 C41 34 44 36 45 40Z" fill={p.gold} stroke={p.ink} strokeWidth="0.8" />
      <circle cx="21.5" cy="34.5" r="0.9" fill={p.dark} />
      <circle cx="44.5" cy="34.5" r="0.9" fill={p.dark} />
      <path d="M33 34 v24" stroke={p.ink} strokeWidth="1.2" />
      <path d="M48 52 L58 8" stroke={p.gold} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M44 48 l9 3" stroke={p.ink} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M58 8 l1 -4" stroke={p.white} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  ),
  // White Tiger of the West, head on: silver plate edged in gold on the brow, roaring, shockwave rings.
  "bach-ho": (p) => (
    <g>
      <path d="M5 30 C3 22 6 14 12 10 M59 30 C61 22 58 14 52 10" stroke={p.glow} strokeWidth="1.4" fill="none" opacity="0.9" />
      <path d="M2 38 C1 26 6 14 15 7 M62 38 C63 26 58 14 49 7" stroke={p.glow} strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M16 18 L14 8 L24 13 M48 18 L50 8 L40 13" fill={p.white} stroke={p.ink} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M32 11 C45 11 52 20 52 31 C52 44 43 54 32 54 C21 54 12 44 12 31 C12 20 19 11 32 11Z" fill={p.white} stroke={p.ink} strokeWidth="1.2" />
      <path d="M24 13 L32 21 L40 13 L37 11 H27Z" fill={p.steel} stroke={p.gold} strokeWidth="1.2" />
      <path d="M14 29 h6 M14 34 h5 M50 29 h-6 M50 34 h-5 M27 21 l2 4 M37 21 l-2 4" stroke={p.dark} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 27 L28 29 L22 31Z M43 27 L36 29 L42 31Z" fill={p.dark} />
      {eye(24.5, 29, 1, p.glow)}
      {eye(39.5, 29, 1, p.glow)}
      <path d="M29 34 h6 l-3 3Z" fill={p.dark} />
      <path d="M24 40 C27 38 37 38 40 40 L38 49 C35 51 29 51 26 49Z" fill={p.dark} />
      <path d="M26 40 l2 4 l2 -4 M34 40 l2 4 l2 -4 M27 49 l1.5 -3 l1.5 3 M34 49 l1.5 -3 l1.5 3" fill={p.white} />
    </g>
  ),
  // Saint Trần in a golden dragon robe over armour, the Hịch scroll unleashing sword light, flying blades around.
  "tran-hung-dao": (p) => (
    <g>
      <g fill={p.steel} stroke={p.ink} strokeWidth="0.5">
        <path d="M6 14 l7 3 l-6 1Z" />
        <path d="M58 12 l-7 4 l6 1Z" />
        <path d="M4 32 l8 0 l-7 2Z" />
        <path d="M60 30 l-8 1 l7 2Z" />
      </g>
      <path d="M25 13 C25 8 28 5 32 5 C36 5 39 8 39 13Z" fill={p.dark} />
      <path d="M22 12 H42 L40 15 H24Z" fill={p.gold} stroke={p.ink} strokeWidth="0.6" />
      {face(p, 32, 20, 6.5, "stern")}
      <path d="M28 24.5 C29 30 35 30 36 24.5 C35 33 29 33 28 24.5Z" fill={p.dark} />
      <path d="M12 62 C13 43 21 31 32 31 C43 31 51 43 52 62Z" fill={p.gold} stroke={p.ink} strokeWidth="1" />
      <path d="M24 44 C28 38 36 38 40 44 C36 42 32 46 34 50 C30 50 28 46 24 44Z" fill={p.red} />
      <path d="M32 31 v6" stroke={p.ink} strokeWidth="1.2" />
      <rect x="13" y="36" width="12" height="5" rx="2.5" fill={p.white} stroke={p.ink} strokeWidth="0.8" transform="rotate(-25 19 38)" />
      <path d="M15 34 L4 6" stroke={p.glow} strokeWidth="3.4" strokeLinecap="round" opacity="0.85" />
      <path d="M15 34 L4 6" stroke={p.white} strokeWidth="1.2" strokeLinecap="round" />
    </g>
  ),
};

// --- Mộc (Wood) ----------------------------------------------------------------------

const MOC: Record<string, Draw> = {
  // A little walking stump: green-glow eyes, vine whips across its body.
  "moc-tinh-non": (p) => (
    <g>
      <path d="M20 50 L18 56 M27 51 L26 57 M37 51 L38 57 M44 50 L46 56" stroke={p.ink} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M20 22 C20 18 24 16 28 17 L30 13 L33 17 C38 16 44 18 44 23 L46 46 C46 50 42 52 32 52 C22 52 18 50 18 46Z" fill={p.ink} />
      <ellipse cx="32" cy="21" rx="11" ry="3.4" fill={p.deep} />
      <path d="M24 21 q8 3 16 0 M27 21 q5 1.6 10 0" stroke={p.ink} strokeWidth="0.7" fill="none" />
      <path d="M30 13 C28 8 24 6 21 7 C24 9 27 11 30 13Z M33 16 C36 11 41 10 44 12 C40 13 37 14 33 16Z" fill={p.green} />
      {eye(26.5, 31, 2.4, p.glow, p.dark)}
      {eye(37.5, 31, 2.4, p.glow, p.dark)}
      <path d="M28 39 q4 2 8 0" stroke={p.dark} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M18 34 C10 36 6 30 9 25 C10 30 13 31 18 30 M46 40 C54 42 58 37 56 32 C55 36 51 38 46 37" stroke={p.green} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M19 44 C26 40 38 46 45 42" stroke={p.green} strokeWidth="1.6" fill="none" />
    </g>
  ),
  // A haunted kapok: a twisted face in the trunk, thorny branches, kapok flowers red as blood.
  "ma-cay-gao": (p) => (
    <g>
      <path d="M24 60 C25 48 22 38 18 30 L14 22 L20 26 L18 14 L24 24 L28 10 L31 22 L36 9 L38 23 L45 13 L43 26 L50 21 L46 31 C42 39 40 48 41 60Z" fill={p.ink} />
      <path d="M26 36 C24 34 25 31 28 32 M39 35 C41 33 40 30 37 31" stroke={p.dark} strokeWidth="1.4" fill="none" />
      <ellipse cx="28" cy="38" rx="2.4" ry="3.2" fill={p.dark} />
      <ellipse cx="37" cy="37" rx="2" ry="3.6" fill={p.dark} />
      {eye(28, 38.5, 0.9, p.red)}
      {eye(37, 37.5, 0.9, p.red)}
      <path d="M27 48 C29 44 36 44 38 49 C35 47 30 47 27 48Z" fill={p.dark} />
      <path d="M22 54 l-3 2 M44 52 l3 2 M21 30 l-3 -1 M44 30 l3 -1" stroke={p.ink} strokeWidth="1.4" strokeLinecap="round" />
      <g fill={p.red} stroke={p.dark} strokeWidth="0.5">
        <circle cx="18" cy="14" r="3" />
        <circle cx="36" cy="9" r="3" />
        <circle cx="45" cy="13" r="2.6" />
        <circle cx="50" cy="21" r="2.6" />
        <circle cx="14" cy="22" r="2.4" />
        <circle cx="28" cy="10" r="2.4" />
      </g>
      <path d="M48 26 l1 4 M15 26 l-1 4" stroke={p.red} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  ),
  // Cuội in plain brown, a sly smile, an axe wound with green betel leaves, the moon's banyan behind him.
  "chu-cuoi": (p) => (
    <g>
      <path d="M44 6 C36 8 32 16 34 24 C36 31 43 35 50 33 C44 30 41 24 42 17 C43 12 45 9 44 6Z" fill={p.white} opacity={p.locked ? 1 : 0.85} />
      <path d="M50 30 C52 26 56 25 58 27 C57 22 54 20 51 21 C52 17 49 14 46 16" fill={p.ink} opacity="0.5" />
      <path d="M22 19 C22 13 26 10 31 10 C36 10 40 13 40 19 C37 16 34 15 31 15 C28 15 25 16 22 19Z" fill={p.dark} />
      {face(p, 31, 22, 7, "smile")}
      <path d="M12 62 C13 44 20 33 31 33 C42 33 49 44 50 62Z" fill={c(p, "#7a5233")} stroke={p.ink} strokeWidth="0.8" />
      <path d="M31 33 L27 45 L31 50 L35 45Z" fill={p.skin} opacity="0.4" />
      <path d="M14 56 L24 30" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M21 31 C17 27 18 22 23 21 C27 23 28 28 25 32Z" fill={p.steel} stroke={p.dark} strokeWidth="0.6" />
      <path d="M17 46 C13 44 13 40 16 39 C18 41 18 44 17 46Z M19 40 C17 36 19 33 22 34 C22 37 21 39 19 40Z" fill={p.green} />
      <circle cx="16" cy="43" r="4" fill="none" stroke={p.glow} strokeWidth="0.8" opacity="0.8" />
    </g>
  ),
  // A great ape furred in green moss, saplings sprouting from its shoulders.
  "vuon-than": (p) => (
    <g>
      <path d="M14 22 C12 16 14 11 18 10 C18 14 20 16 22 18Z M50 22 C52 16 50 11 46 10 C46 14 44 16 42 18Z" fill={p.green} />
      <path d="M18 10 V4 M46 10 V5" stroke={p.ink} strokeWidth="1.2" />
      <path d="M6 60 C6 40 14 26 32 26 C50 26 58 40 58 60Z" fill={p.ink} />
      <path d="M8 40 q3 -2 5 1 q3 -3 6 0 M44 34 q3 -2 6 1 q2 -2 5 1 M20 52 q3 -2 6 0 q3 -2 6 0" stroke={p.green} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="25" r="5" fill={p.ink} />
      <circle cx="48" cy="25" r="5" fill={p.ink} />
      <path d="M32 9 C43 9 48 17 48 27 C48 37 41 43 32 43 C23 43 16 37 16 27 C16 17 21 9 32 9Z" fill={p.ink} />
      <path d="M32 19 C39 17 44 21 43 26 C43 29 41 30 39 31 C41 36 37 40 32 40 C27 40 23 36 25 31 C23 30 21 29 21 26 C20 21 25 17 32 19Z" fill={c(p, "#c9a882")} />
      <path d="M22 21 C26 17 38 17 42 21" stroke={p.dark} strokeWidth="2" fill="none" />
      {eye(27.5, 25, 1.8, p.dark)}
      {eye(36.5, 25, 1.8, p.dark)}
      <circle cx="29.5" cy="31" r="1" fill={p.dark} />
      <circle cx="34.5" cy="31" r="1" fill={p.dark} />
      <path d="M28 36 q4 2.5 8 0" stroke={p.dark} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  ),
  // White rooster with demon-red eyes, spurs like twisted roots, night mist curling around it.
  "bach-ke-tinh": (p) => (
    <g>
      <path d="M6 50 C14 46 20 52 28 49 C36 46 44 52 58 48" stroke={p.white} strokeWidth="2" fill="none" opacity="0.35" />
      <path d="M36 9 l3 -5 2 5 3 -4 1 6 3 -2 -1 6Z" fill={p.red} />
      <path d="M37 14 C46 13 49 21 46 26 L53 29 L46 30 C47 39 41 46 31 46 C22 46 16 41 15 34 C9 32 7 22 11 15 C15 22 20 25 26 25 C28 18 31 14 37 14Z" fill={p.white} stroke={p.dark} strokeWidth="0.8" />
      <path d="M11 15 C8 20 6 26 8 32 M13 13 C11 19 11 25 13 30" stroke={p.white} strokeWidth="1.8" fill="none" />
      <path d="M45 30 C46 33 45 36 43 37 C43 34 43 32 44 30Z" fill={p.red} />
      <path d="M24 32 q5 4 10 2 M23 36 q5 4 10 2" stroke={p.steel} strokeWidth="1" fill="none" />
      {eye(39.5, 20, 1.8, p.red, p.dark)}
      <path d="M28 46 C27 50 24 53 20 54 M28 50 C30 52 31 55 30 58 M35 46 C35 50 38 53 42 54 M35 50 C33 53 33 56 34 58" stroke={p.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M20 54 l-2 1 M42 54 l2 1" stroke={p.ink} strokeWidth="1.4" />
    </g>
  ),
  // Princess Tiên Dung: leaf-silk sleeves, playing a thousand-year wooden zither that sheds petals.
  "tien-dung": (p) => (
    <g>
      <g fill={p.glow} opacity={p.locked ? 1 : 0.85}>
        <ellipse cx="10" cy="16" rx="2.2" ry="1.2" transform="rotate(30 10 16)" />
        <ellipse cx="54" cy="12" rx="2.2" ry="1.2" transform="rotate(-20 54 12)" />
        <ellipse cx="57" cy="26" rx="2" ry="1.1" transform="rotate(40 57 26)" />
        <ellipse cx="8" cy="30" rx="2" ry="1.1" transform="rotate(-30 8 30)" />
      </g>
      <circle cx="32" cy="9" r="5" fill={p.dark} />
      <path d="M27 9 H37" stroke={p.gold} strokeWidth="1.2" />
      <path d="M24 18 C24 12 28 10 32 10 C36 10 40 12 40 18 L41 30 C38 26 26 26 23 30Z" fill={p.dark} />
      {face(p, 32, 19, 6, "calm")}
      <path d="M12 62 C13 44 21 30 32 30 C43 30 51 44 52 62Z" fill={p.ink} />
      <path d="M32 30 C26 38 22 48 20 62 M32 30 C38 38 42 48 44 62" stroke={p.green} strokeWidth="1.4" fill="none" />
      <path d="M14 44 C10 40 9 35 12 32 C14 36 16 39 20 40 M50 44 C54 40 55 35 52 32 C50 36 48 39 44 40" fill={p.green} />
      <path d="M8 48 L56 40 L58 46 L10 54Z" fill={c(p, "#8a5a2b")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M12 50 L55 42 M12 52 L56 44" stroke={p.gold} strokeWidth="0.5" />
      <path d="M20 47 l1 5 M30 45 l1 5 M40 43 l1 5" stroke={p.white} strokeWidth="1" />
    </g>
  ),
  // Chử Đồng Tử: gentle immortal in leafy silk, with the magic staff and the conical hat that raise a living wall.
  "chu-dong-tu": (p) => (
    <g>
      <path d="M4 60 C6 52 9 50 12 50 C12 46 15 44 18 46 M60 60 C58 52 55 50 52 50 C52 46 49 44 46 46" stroke={p.green} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M32 3 L50 17 H14Z" fill={p.gold} stroke={p.dark} strokeWidth="0.8" />
      <path d="M23 10 L41 10 M18 14 L46 14" stroke={p.dark} strokeWidth="0.5" />
      {face(p, 32, 22, 6.5, "smile")}
      <path d="M27 27 C28 34 31 37 32 40 C33 37 36 34 37 27 C35 29 29 29 27 27Z" fill={p.white} />
      <path d="M12 62 C13 45 20 33 32 33 C44 33 51 45 52 62Z" fill={p.ink} />
      <path d="M22 44 C20 40 22 37 25 38 C25 41 24 43 22 44Z M40 50 C42 46 45 45 47 47 C45 49 43 50 40 50Z M30 55 C28 51 30 48 33 49 C33 52 32 54 30 55Z" fill={p.green} />
      <path d="M50 60 L52 20" stroke={c(p, "#8a5a2b")} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M52 20 C50 16 52 13 55 14 C55 17 54 19 52 20Z M52 22 C55 19 58 20 58 23 C56 24 54 23 52 22Z" fill={p.green} />
    </g>
  ),
  // The ogre: moss-green hide, horns of rotten wood, a great spiked club, wrapped in poison thorns.
  "chan-tinh": (p) => (
    <g>
      <path d="M18 20 C14 14 15 8 19 5 C19 10 21 13 24 15 M46 20 C50 14 49 8 45 5 C45 10 43 13 40 15" stroke={c(p, "#6b5132")} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M17 8 l-3 -1 M47 8 l3 -1" stroke={c(p, "#6b5132")} strokeWidth="2" strokeLinecap="round" />
      <path d="M32 12 C44 12 50 20 50 31 C50 42 43 49 32 49 C21 49 14 42 14 31 C14 20 20 12 32 12Z" fill={c(p, "#5d8a3a")} stroke={p.dark} strokeWidth="1" />
      <path d="M20 25 l9 4 M44 25 l-9 4" stroke={p.dark} strokeWidth="2.4" strokeLinecap="round" />
      {eye(25.5, 31, 2.2, p.glow, p.dark)}
      {eye(38.5, 31, 2.2, p.glow, p.dark)}
      <path d="M21 39 H43 L40 45 H24Z" fill={p.dark} />
      <path d="M24 39 l2 5 l2 -5 M36 39 l2 5 l2 -5" fill={p.white} />
      <path d="M8 60 C9 50 14 46 20 47 M56 60 C55 50 50 46 44 47" stroke={p.purple} strokeWidth="1.6" fill="none" strokeDasharray="2 2" />
      <path d="M48 62 L58 34" stroke={c(p, "#6b5132")} strokeWidth="4.4" strokeLinecap="round" />
      <path d="M55 38 l4 -1 M57 43 l4 1 M53 44 l-4 -1 M56 33 l3 -3" stroke={p.ink} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
  // Mother of the Forests in emerald and jade, a crown of glowing wild flowers, the white tiger at her side.
  "mau-thuong-ngan": (p) => (
    <g>
      <g fill={p.glow}>
        <circle cx="22" cy="8" r="2.4" />
        <circle cx="27" cy="5" r="2.4" />
        <circle cx="32" cy="4" r="2.6" />
        <circle cx="37" cy="5" r="2.4" />
        <circle cx="42" cy="8" r="2.4" />
      </g>
      <path d="M20 12 C24 7 40 7 44 12 L42 15 H22Z" fill={p.green} stroke={p.dark} strokeWidth="0.6" />
      <path d="M24 18 C24 12 28 10 32 10 C36 10 40 12 40 18 L42 34 C38 30 26 30 22 34Z" fill={p.dark} />
      {face(p, 32, 20, 6.5, "calm")}
      <path d="M14 62 C15 45 22 32 32 32 C42 32 49 45 50 62Z" fill={c(p, "#127a52")} stroke={p.ink} strokeWidth="0.8" />
      <path d="M26 33 L32 42 L38 33" stroke={p.gold} strokeWidth="1.2" fill="none" />
      <circle cx="32" cy="44" r="2.4" fill={p.glow} stroke={p.gold} strokeWidth="0.8" />
      <path d="M44 54 C44 47 48 43 54 43 C60 43 63 48 63 54 C63 60 58 64 54 64 C49 64 44 60 44 54Z" fill={p.white} stroke={p.dark} strokeWidth="0.8" />
      <path d="M48 44 l-1 -4 l4 2 M60 44 l1 -4 l-4 2" fill={p.white} stroke={p.dark} strokeWidth="0.6" />
      <path d="M47 51 h3 M58 51 h3 M54 46 v3" stroke={p.dark} strokeWidth="1" />
      <circle cx="51" cy="52" r="0.9" fill={p.dark} />
      <circle cx="57" cy="52" r="0.9" fill={p.dark} />
    </g>
  ),
  // Xương Cuồng: a thousand-year tree demon, its gnarled trunk studded with skulls, roots stabbing the ground.
  "xuong-cuong": (p) => (
    <g>
      <path d="M8 22 C14 10 26 4 36 6 C46 8 56 14 58 24 C54 22 50 22 46 26 C40 22 26 22 18 26 C14 22 10 22 8 22Z" fill={c(p, "#2a5b37")} />
      <path d="M22 60 L14 62 L20 56 L8 58 L18 52 C22 44 22 34 20 26 C26 22 40 22 44 26 C42 34 42 44 46 52 L56 58 L44 56 L50 62 L42 60Z" fill={c(p, "#5a4630")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M26 30 C24 38 30 42 28 50 M38 30 C40 38 34 42 36 50" stroke={p.dark} strokeWidth="1" fill="none" />
      <g>
        <path d="M27 34 C27 31 29 29 32 29 C35 29 37 31 37 34 C37 36 36 37 35 38 V40 H29 V38 C28 37 27 36 27 34Z" fill={p.white} />
        <circle cx="30" cy="34" r="1.3" fill={p.dark} />
        <circle cx="34" cy="34" r="1.3" fill={p.dark} />
        <path d="M30.5 40 v-1.6 M32 40 v-1.6 M33.5 40 v-1.6" stroke={p.dark} strokeWidth="0.6" />
      </g>
      <g transform="translate(-9 12) scale(0.7)">
        <path d="M27 34 C27 31 29 29 32 29 C35 29 37 31 37 34 C37 36 36 37 35 38 V40 H29 V38 C28 37 27 36 27 34Z" fill={p.white} />
        <circle cx="30" cy="34" r="1.3" fill={p.dark} />
        <circle cx="34" cy="34" r="1.3" fill={p.dark} />
      </g>
      <g transform="translate(18 15) scale(0.6)">
        <path d="M27 34 C27 31 29 29 32 29 C35 29 37 31 37 34 C37 36 36 37 35 38 V40 H29 V38 C28 37 27 36 27 34Z" fill={p.white} />
        <circle cx="30" cy="34" r="1.3" fill={p.dark} />
        <circle cx="34" cy="34" r="1.3" fill={p.dark} />
      </g>
      {eye(25, 18, 1.6, p.glow)}
      {eye(39, 18, 1.6, p.glow)}
      <path d="M26 24 Q32 20 38 24" stroke={p.dark} strokeWidth="1.4" fill="none" />
    </g>
  ),
};

// --- Thủy (Water) ---------------------------------------------------------------------

const THUY: Record<string, Draw> = {
  // Swamp ghoul: livid purple skin, hair of wet weed, long clinging arms, round unblinking eyes.
  "ma-da": (p) => (
    <g>
      <path d="M2 50 C10 46 16 52 24 49 C32 46 40 52 48 49 C54 47 58 48 62 50 V64 H2Z" fill={p.blue} opacity={p.locked ? 1 : 0.55} />
      <path d="M4 24 C10 28 12 36 14 46 M60 24 C54 28 52 36 50 46" stroke={c(p, "#8a6aa8")} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M4 24 l-2 -3 M4 24 l-3 1 M4 24 l0 -4 M60 24 l2 -3 M60 24 l3 1 M60 24 l0 -4" stroke={c(p, "#8a6aa8")} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M32 12 C43 12 48 20 48 30 C48 41 41 49 32 49 C23 49 16 41 16 30 C16 20 21 12 32 12Z" fill={c(p, "#8a6aa8")} />
      <path d="M15 32 C14 20 21 10 32 10 C43 10 50 20 49 32 C47 26 46 22 42 20 C42 26 40 30 38 32 C38 26 36 22 32 21 C28 22 26 26 26 32 C24 30 22 26 22 20 C18 22 17 26 15 32Z" fill={c(p, "#2f6b4f")} />
      <path d="M17 32 C16 38 18 44 16 50 M47 32 C48 38 46 44 48 50" stroke={c(p, "#2f6b4f")} strokeWidth="2.2" fill="none" />
      <circle cx="26" cy="35" r="4" fill={p.white} />
      <circle cx="38" cy="35" r="4" fill={p.white} />
      <circle cx="26" cy="35" r="1.8" fill={p.dark} />
      <circle cx="38" cy="35" r="1.8" fill={p.dark} />
      <path d="M27 44 q5 -2 10 0" stroke={p.dark} strokeWidth="1.4" fill="none" />
    </g>
  ),
  // The divine carp: pearly gold scales, a tail spread like silk, cleansing bubbles.
  "ca-chep": (p) => (
    <g>
      <g fill="none" stroke={p.white} strokeWidth="0.9" opacity={p.locked ? 1 : 0.8}>
        <circle cx="12" cy="18" r="2.4" />
        <circle cx="18" cy="11" r="1.6" />
        <circle cx="9" cy="27" r="1.4" />
        <circle cx="52" cy="50" r="1.8" />
      </g>
      <path d="M44 34 C52 26 60 22 62 14 C60 26 58 30 52 36 C58 40 62 46 62 56 C58 48 52 44 44 40Z" fill={p.gold} opacity="0.85" />
      <path d="M52 30 C56 26 59 22 61 17 M54 41 C57 45 60 49 61 54" stroke={p.white} strokeWidth="0.7" fill="none" />
      <path d="M8 36 C14 24 30 20 44 30 C46 33 46 37 44 40 C30 50 14 48 8 36Z" fill={p.gold} stroke={p.dark} strokeWidth="0.8" />
      <path d="M24 24 C28 17 34 17 36 25Z M24 46 C28 51 32 51 34 45Z" fill={p.gold} stroke={p.dark} strokeWidth="0.6" />
      <g fill="none" stroke={c(p, "#b07a1a")} strokeWidth="0.9">
        <path d="M22 30 q3 3 0 6 q3 3 0 6 M28 28 q3 3 0 6 q3 3 0 6 q3 3 0 6 M34 28 q3 3 0 6 q3 3 0 6 q3 3 0 6 M40 31 q3 3 0 6" />
      </g>
      <circle cx="15" cy="33" r="2.4" fill={p.white} />
      <circle cx="15" cy="33" r="1.2" fill={p.dark} />
      <path d="M9 38 C6 40 4 42 3 44 M11 39 C9 42 9 45 10 47" stroke={p.gold} strokeWidth="1" fill="none" />
    </g>
  ),
  // Mai An Tiêm: lean, sun-tanned islander with a shell-tipped spear beside a giant cool watermelon.
  "mai-an-tiem": (p) => (
    <g transform="translate(64 0) scale(-1 1)">
      <path d="M36 52 C36 42 44 36 52 36 C60 36 66 42 66 52 C66 60 60 66 52 66 C44 66 36 60 36 52Z" fill={c(p, "#2f8a3e")} />
      <path d="M40 46 C44 40 48 38 52 38 M38 54 C40 46 46 42 52 41 M42 60 C42 52 48 46 54 45" stroke={c(p, "#9fd77a")} strokeWidth="1.4" fill="none" />
      <path d="M8 6 L22 52" stroke={c(p, "#8a5a2b")} strokeWidth="2" strokeLinecap="round" />
      <path d="M4 2 C8 0 12 2 11 7 C9 10 6 10 5 8Z" fill={p.white} stroke={p.dark} strokeWidth="0.6" />
      <path d="M5 4 l4 3 M6 2.6 l3.6 5" stroke={p.steel} strokeWidth="0.5" />
      <path d="M22 18 C22 12 26 9 30 9 C34 9 38 12 38 18 C36 15 33 14 30 14 C27 14 24 15 22 18Z" fill={p.dark} />
      {face({ ...p, skin: c(p, "#c98a5a") }, 30, 20, 6.5, "stern")}
      <path d="M14 62 C15 44 20 32 30 32 C40 32 45 40 46 48 L40 62Z" fill={c(p, "#c98a5a")} />
      <path d="M22 40 C26 38 28 42 26 46 M36 40 C32 38 30 42 32 46" stroke={c(p, "#8a5a3a")} strokeWidth="1.2" fill="none" />
      <path d="M17 56 H44" stroke={p.dark} strokeWidth="0" />
      <path d="M16 54 C22 52 34 52 42 55 L42 62 H16Z" fill={c(p, "#4a6b3a")} />
    </g>
  ),
  // Dã Tràng: a small figure in crab-shell armour with a digging stick, rolling sand into balls.
  "da-trang": (p) => (
    <g>
      <path d="M2 54 C14 50 26 56 36 52 C46 48 54 52 62 50 V64 H2Z" fill={c(p, "#d9c08a")} />
      <g fill={c(p, "#e8d6a6")} stroke={p.dark} strokeWidth="0.5">
        <circle cx="12" cy="52" r="2" />
        <circle cx="17" cy="54" r="1.6" />
        <circle cx="50" cy="51" r="1.8" />
      </g>
      <path d="M32 20 C41 20 46 25 46 32 C46 40 40 46 32 46 C24 46 18 40 18 32 C18 25 23 20 32 20Z" fill={c(p, "#d0482f")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M22 30 q4 -3 8 0 q4 -3 8 0 q4 -3 8 0 M22 36 q5 3 10 0 q5 3 10 0" stroke={c(p, "#8a2316")} strokeWidth="1" fill="none" />
      <path d="M18 28 C12 26 10 20 13 15 L15 20 L17 14 C21 17 21 24 18 28Z M46 28 C52 26 54 20 51 15 L49 20 L47 14 C43 17 43 24 46 28Z" fill={c(p, "#d0482f")} stroke={p.dark} strokeWidth="0.6" />
      {face(p, 32, 17, 5.5, "calm")}
      <path d="M26 14 C26 9 38 9 38 14 L36 13 C34 11 30 11 28 13Z" fill={c(p, "#d0482f")} />
      <path d="M44 46 L52 58" stroke={c(p, "#8a5a2b")} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 46 l-3 6 M28 46 l-1 6 M36 46 l1 6 M40 46 l3 6" stroke={c(p, "#d0482f")} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),
  // Water-buffalo demon: dark teal hide with dragon scales, jade horns jetting water.
  "nguu-tinh": (p) => (
    <g transform="translate(0 7)">
      <path d="M20 16 C10 16 4 10 5 2 C9 8 14 10 22 10 M44 16 C54 16 60 10 59 2 C55 8 50 10 42 10" stroke={c(p, "#3fbf8f")} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M5 2 C4 -2 6 -4 8 -2 M59 2 C60 -2 58 -4 56 -2" stroke={p.blue} strokeWidth="1.6" />
      <path d="M2 8 q3 -6 6 -2 M62 8 q-3 -6 -6 -2" stroke={p.blue} strokeWidth="1.4" fill="none" />
      <path d="M19 13 H45 C49 22 48 32 45 40 C42 48 37 54 32 54 C27 54 22 48 19 40 C16 32 15 22 19 13Z" fill={c(p, "#1f5260")} stroke={p.ink} strokeWidth="0.8" />
      <g fill="none" stroke={c(p, "#3a8a93")} strokeWidth="0.9">
        <path d="M21 20 q2.5 2 5 0 q2.5 2 5 0 q2.5 2 5 0 q2.5 2 5 0 q2 1.6 4 0" />
        <path d="M20 26 q2.5 2 5 0 q2.5 2 5 0 q2.5 2 5 0 q2.5 2 5 0 q2.5 2 5 0" />
      </g>
      <ellipse cx="32" cy="46" rx="8" ry="6" fill={c(p, "#14363f")} />
      <circle cx="28.5" cy="46" r="1.5" fill={p.ink} />
      <circle cx="35.5" cy="46" r="1.5" fill={p.ink} />
      {eye(25, 32, 2.2, p.glow, p.dark)}
      {eye(39, 32, 2.2, p.glow, p.dark)}
      <path d="M10 60 C16 56 22 62 30 58 C38 54 46 60 54 56" stroke={p.blue} strokeWidth="1.6" fill="none" />
    </g>
  ),
  // Ngư Tinh: a serpent-long sea fish with saw teeth and a saw-blade dorsal fin cutting the waves.
  "ngu-tinh": (p) => (
    <g>
      <path d="M2 50 C10 44 16 52 24 48" stroke={p.blue} strokeWidth="1.6" fill="none" />
      <path d="M8 26 C14 16 26 14 34 20 C40 25 42 34 48 38 C52 41 56 41 60 38 L62 46 C56 50 48 50 42 46 C36 42 32 34 26 32 C20 30 14 32 8 26Z" fill={p.ink} />
      <path d="M22 18 L24 12 L27 17 L30 11 L32 18 L36 13 L37 21 L42 18 L41 26 L46 25 L44 32" fill={p.steel} stroke={p.dark} strokeWidth="0.6" />
      <path d="M60 38 L64 30 L62 42 L64 50 L60 46Z" fill={p.ink} />
      <path d="M8 26 C10 30 14 32 18 32" stroke={p.dark} strokeWidth="2" />
      <path d="M8 27 l2 2 l1.5 -2 l1.5 2 l1.5 -2 l1.5 2 l1.5 -2 l1.5 2" stroke={p.white} strokeWidth="1" fill="none" />
      {eye(16, 22, 1.8, p.glow, p.dark)}
      <path d="M30 26 q3 3 0 6 M36 30 q3 3 0 6 M42 36 q3 3 0 6" stroke={p.blue} strokeWidth="0.9" fill="none" />
    </g>
  ),
  // Thủy Tinh: lord of the sea in a storm-dark cloak, scepter raised, a typhoon swelling behind him.
  "thuy-tinh": (p) => (
    <g>
      <path d="M2 30 C8 20 18 18 22 26 C18 24 12 26 12 32 C12 38 20 40 24 36 M62 28 C56 18 46 18 42 26 C46 24 52 26 52 32" stroke={p.blue} strokeWidth="2" fill="none" />
      <path d="M22 10 L25 4 L29 9 L32 3 L35 9 L39 4 L42 10Z" fill={p.blue} stroke={p.ink} strokeWidth="0.6" />
      <path d="M24 16 C24 11 28 9 32 9 C36 9 40 11 40 16 L41 24 C38 21 26 21 23 24Z" fill={p.dark} />
      {face(p, 32, 18, 6.5, "fierce")}
      <path d="M8 62 C10 42 20 30 32 30 C44 30 54 42 56 62Z" fill={c(p, "#16314f")} stroke={p.ink} strokeWidth="0.8" />
      <path d="M14 56 C18 50 22 54 26 50 C30 46 34 52 38 48 C42 44 46 50 50 46" stroke={p.blue} strokeWidth="1.6" fill="none" />
      <path d="M52 62 L54 10" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M48 12 C48 6 50 4 54 4 C58 4 60 6 60 12 M54 4 V12 M50 8 L54 12 L58 8" stroke={p.ink} strokeWidth="1.6" fill="none" />
      <circle cx="54" cy="13" r="2" fill={p.glow} />
    </g>
  ),
  // Thuồng Luồng: a giant serpent of grey-black scales with four webbed legs and red eyes in the deep.
  "thuong-luong": (p) => (
    <g>
      <path d="M8 50 C16 58 30 56 34 46 C38 36 30 30 34 22 C36 18 40 16 44 18" stroke={c(p, "#8a949e")} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M10 52 C16 56 28 54 31 46" stroke={c(p, "#5f6a74")} strokeWidth="2" fill="none" strokeDasharray="2 2" />
      <path d="M40 18 C42 10 52 8 58 13 C62 17 60 24 52 26 C46 27 41 24 40 18Z" fill={c(p, "#8a949e")} stroke={p.ink} strokeWidth="0.6" />
      <path d="M44 24 C48 28 54 28 58 24" stroke={p.white} strokeWidth="1" fill="none" />
      {eye(52, 16, 2, p.red, p.dark)}
      <path d="M58 20 C62 21 64 18 62 16" stroke={p.blue} strokeWidth="1.6" fill="none" />
      <g fill={c(p, "#8a949e")} stroke={p.ink} strokeWidth="0.5">
        <path d="M18 54 l-6 6 l4 0 l2 2 l2 -2Z" />
        <path d="M30 52 l2 8 l3 -2 l2 2 l0 -3Z" />
        <path d="M36 36 l8 2 l-2 3 l2 2 l-4 0Z" />
        <path d="M32 28 l-8 -2 l2 3 l-2 2 l4 0Z" />
      </g>
    </g>
  ),
  // Lạc Long Quân: the Dragon Lord in a split dragon robe showing deep-blue scales, his dragon form coiling behind.
  "lac-long-quan": (p) => (
    <g>
      <path d="M4 56 C2 40 6 26 16 18 C22 13 30 12 36 14" stroke={c(p, "#2a7bb8")} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M34 10 C38 4 46 2 52 6 L58 4 L56 10 C58 14 54 18 48 18 C42 18 37 15 34 10Z" fill={c(p, "#2a7bb8")} stroke={p.ink} strokeWidth="0.6" />
      <path d="M46 4 C45 0 48 -2 50 0 M52 6 C54 2 58 2 58 4" stroke={p.gold} strokeWidth="1.2" fill="none" />
      {eye(48, 9, 1.4, p.glow, p.dark)}
      <path d="M50 16 C54 20 52 24 48 24" stroke={p.white} strokeWidth="1" fill="none" />
      <path d="M24 22 L27 16 L31 21 L34 15 L37 21 L41 16 L44 22Z" fill={p.gold} stroke={p.dark} strokeWidth="0.6" />
      {face(p, 34, 28, 6.5, "stern")}
      <path d="M30 33 C31 38 37 38 38 33 C37 41 31 41 30 33Z" fill={p.dark} />
      <path d="M16 64 C17 48 24 38 34 38 C44 38 51 48 52 64Z" fill={c(p, "#1e4f86")} stroke={p.ink} strokeWidth="0.8" />
      <path d="M34 38 L30 64 H38Z" fill={c(p, "#2a7bb8")} />
      <g fill="none" stroke={p.blue} strokeWidth="0.8">
        <path d="M31 46 q1.5 1.5 3 0 q1.5 1.5 3 0 M31 51 q1.5 1.5 3 0 q1.5 1.5 3 0 M31 56 q1.5 1.5 3 0 q1.5 1.5 3 0" />
      </g>
      <path d="M22 44 C26 42 28 46 26 50 M46 44 C42 42 40 46 42 50" stroke={p.gold} strokeWidth="1.2" fill="none" />
    </g>
  ),
  // Mẫu Thoải: Holy Mother of Waters, pearl white robes flowing like water, on a lotus throne, a silk ribbon in hand.
  "mau-thoai": (p) => (
    <g>
      <path d="M8 22 C14 14 20 20 18 28 C16 34 22 38 26 34" stroke={p.white} strokeWidth="1.6" fill="none" opacity={p.locked ? 1 : 0.8} />
      <path d="M22 9 C26 4 38 4 42 9 L40 12 H24Z" fill={p.white} stroke={p.gold} strokeWidth="0.8" />
      <circle cx="32" cy="6" r="1.4" fill={p.glow} />
      <path d="M24 16 C24 11 28 9 32 9 C36 9 40 11 40 16 L41 28 C38 25 26 25 23 28Z" fill={p.dark} />
      {face(p, 32, 18, 6.5, "calm")}
      <path d="M14 52 C15 38 22 27 32 27 C42 27 49 38 50 52Z" fill={p.white} stroke={p.blue} strokeWidth="0.8" />
      <path d="M32 27 C28 36 26 44 24 52 M32 27 C36 36 38 44 40 52" stroke={p.blue} strokeWidth="1" fill="none" />
      <path d="M6 52 C12 46 18 50 22 54 C24 48 30 46 32 52 C34 46 40 48 42 54 C46 50 52 46 58 52 C54 58 46 60 32 60 C18 60 10 58 6 52Z" fill={c(p, "#f3b6c8")} stroke={p.dark} strokeWidth="0.6" />
      <path d="M20 54 C24 56 28 56 32 54 C36 56 40 56 44 54" stroke={c(p, "#d77a96")} strokeWidth="0.8" fill="none" />
    </g>
  ),
};

// --- Hỏa (Fire) -----------------------------------------------------------------------

const HOA: Record<string, Draw> = {
  // The purple-red toad: glowing hot warts on its back, little thunder cracking as it grinds its teeth.
  "coc-tia": (p) => (
    <g>
      <path d="M6 14 L10 20 L7 21 L12 28 M58 12 L54 19 L57 20 L52 27" stroke={p.gold} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M8 46 C8 32 18 24 32 24 C46 24 56 32 56 46 C56 51 52 54 46 54 H18 C12 54 8 51 8 46Z" fill={c(p, "#8f2a5a")} stroke={p.ink} strokeWidth="0.8" />
      <circle cx="20" cy="22" r="7" fill={c(p, "#8f2a5a")} stroke={p.ink} strokeWidth="0.8" />
      <circle cx="44" cy="22" r="7" fill={c(p, "#8f2a5a")} stroke={p.ink} strokeWidth="0.8" />
      <circle cx="20" cy="21" r="3.6" fill={p.gold} />
      <circle cx="44" cy="21" r="3.6" fill={p.gold} />
      <path d="M18 21 h4 M42 21 h4" stroke={p.dark} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 38 C22 43 42 43 48 38" stroke={p.dark} strokeWidth="1.6" fill="none" />
      <path d="M20 39.5 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l2 2" stroke={p.white} strokeWidth="0.9" fill="none" />
      <g fill={p.gold}>
        <circle cx="16" cy="48" r="1.6" />
        <circle cx="26" cy="50" r="1.3" />
        <circle cx="38" cy="50" r="1.3" />
        <circle cx="48" cy="47" r="1.6" />
        <circle cx="32" cy="31" r="1.4" />
      </g>
    </g>
  ),
  // Ma Trơi: a floating violet-blue will-o'-the-wisp in the shape of a ghostly skull.
  "ma-troi": (p) => (
    <g>
      <path d="M32 4 C36 12 46 14 46 28 C46 38 40 46 32 46 C24 46 18 38 18 28 C18 20 24 18 26 10 C28 15 30 16 31 17 C32 12 32 8 32 4Z" fill={c(p, "#7a5cff")} />
      <path d="M32 14 C34 20 42 22 42 31 C42 38 37 43 32 43 C27 43 22 38 22 31 C22 25 27 23 32 14Z" fill={c(p, "#5fd0ff")} />
      <path d="M25 30 C25 25 28 22 32 22 C36 22 39 25 39 30 C39 33 37 35 36 36 V39 H28 V36 C27 35 25 33 25 30Z" fill={p.white} />
      <circle cx="29" cy="30" r="2" fill={c(p, "#3b2a8a")} />
      <circle cx="35" cy="30" r="2" fill={c(p, "#3b2a8a")} />
      <path d="M31 34 l1 -1.6 l1 1.6Z" fill={c(p, "#3b2a8a")} />
      <path d="M29.5 39 v-2 M32 39 v-2 M34.5 39 v-2" stroke={c(p, "#3b2a8a")} strokeWidth="0.7" />
      <path d="M24 50 C26 54 24 58 20 60 M40 50 C38 55 40 58 44 60 M32 50 V60" stroke={c(p, "#7a5cff")} strokeWidth="1.6" fill="none" opacity="0.7" strokeLinecap="round" />
    </g>
  ),
  // Nine-tailed fox in bright red silk: nine tails fanned out like flames, eyes that charm.
  "ho-tinh": (p) => (
    <g>
      <g fill={p.gold} stroke={c(p, "#ff8a3d")} strokeWidth="0.8">
        {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((a) => (
          <path key={a} d="M32 40 C28 30 28 18 32 6 C36 18 36 30 32 40Z" transform={`rotate(${a} 32 40)`} />
        ))}
      </g>
      <path d="M20 22 L24 34 H40 L44 22 L40 30 H24Z" fill={c(p, "#f5ead8")} />
      <path d="M22 26 L30 32 H34 L42 26 L40 40 L32 50 L24 40Z" fill={c(p, "#f5ead8")} stroke={p.dark} strokeWidth="0.6" />
      <path d="M22 26 L20 16 L28 24 M42 26 L44 16 L36 24" fill={c(p, "#f5ead8")} stroke={p.dark} strokeWidth="0.6" />
      <path d="M26 35 q2 -2 4 0 M34 35 q2 -2 4 0" stroke={p.dark} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="28" cy="36" r="0.9" fill={c(p, "#ff4fa0")} />
      <circle cx="36" cy="36" r="0.9" fill={c(p, "#ff4fa0")} />
      <circle cx="32" cy="45" r="1.6" fill={p.dark} />
      <path d="M28 30 l4 2 l4 -2" stroke={p.red} strokeWidth="1.4" fill="none" />
      <path d="M14 64 C18 54 24 50 32 50 C40 50 46 54 50 64Z" fill={p.red} />
    </g>
  ),
  // Ông Táo: cheerful kitchen god in a winged official's hat and red robe, a tray of fire, a fiery carp.
  "ong-tao": (p) => (
    <g transform="translate(0 5)">
      <path d="M12 10 C10 6 14 4 18 7 H46 C50 4 54 6 52 10 C50 13 46 12 46 12 H18 C18 12 14 13 12 10Z" fill={p.dark} />
      <path d="M22 12 C22 6 26 3 32 3 C38 3 42 6 42 12Z" fill={p.dark} />
      <path d="M24 9 H40" stroke={p.gold} strokeWidth="1" />
      {face(p, 32, 20, 7, "smile")}
      <path d="M29 26 C30 31 34 31 35 26 C34 34 30 34 29 26Z" fill={p.dark} />
      <path d="M10 64 C11 46 20 34 32 34 C44 34 53 46 54 64Z" fill={p.red} stroke={p.ink} strokeWidth="0.8" />
      <path d="M32 34 V64" stroke={p.gold} strokeWidth="1" />
      <ellipse cx="22" cy="48" rx="11" ry="3" fill={p.gold} stroke={p.dark} strokeWidth="0.6" />
      <path d="M14 47 C13 41 17 40 18 36 C20 40 21 41 23 38 C24 42 27 41 27 37 C30 41 30 44 29 47Z" fill={c(p, "#ff8a3d")} />
      <path d="M17 47 C17 44 19 43 20 41 C21 43 22 44 24 42 C25 45 26 46 26 47Z" fill={p.gold} />
      <path d="M44 46 C48 42 54 42 56 46 C54 50 48 50 44 46Z M56 46 L60 43 L60 49Z" fill={c(p, "#ff8a3d")} stroke={p.dark} strokeWidth="0.5" />
    </g>
  ),
  // Fire python: scales like glowing embers, leaving a burning trail behind it.
  "xa-tinh": (p) => (
    <g transform="translate(-4 6)">
      <path d="M4 56 C10 52 12 58 18 56 C24 54 26 58 30 56" stroke={c(p, "#ff8a3d")} strokeWidth="2" fill="none" strokeDasharray="3 2" />
      <path d="M8 50 C20 58 34 52 30 42 C26 32 18 30 22 20 C25 13 34 12 40 16" stroke={c(p, "#3a0d08")} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M8 50 C20 58 34 52 30 42 C26 32 18 30 22 20 C25 13 34 12 40 16" stroke={c(p, "#ff8a3d")} strokeWidth="2.4" fill="none" strokeDasharray="1.5 3" strokeLinecap="round" />
      <path d="M36 14 C38 6 50 4 56 10 C60 15 56 22 48 22 C42 22 38 20 36 14Z" fill={c(p, "#3a0d08")} stroke={p.gold} strokeWidth="0.8" />
      {eye(48, 12, 1.8, p.gold, p.dark)}
      <path d="M56 17 C60 18 62 22 60 24 M57 17 C60 16 63 18 63 20" stroke={c(p, "#ff8a3d")} strokeWidth="1.4" fill="none" />
      <g fill={p.gold}>
        <circle cx="58" cy="28" r="1.2" />
        <circle cx="54" cy="32" r="1" />
        <circle cx="60" cy="34" r="0.9" />
      </g>
    </g>
  ),
  // Iron Horse: forged black iron, mane and eyes of dark red flame, smoke and fire from the nostrils.
  "ngua-sat": (p) => (
    <g>
      <path d="M22 60 C22 48 24 40 22 32 C20 22 26 13 34 12 L36 6 L39 12 C46 13 52 19 54 27 L56 35 C57 39 53 41 50 38 L45 33 C41 35 38 40 38 46 V60Z" fill={c(p, "#232326")} stroke={p.ink} strokeWidth="0.8" />
      <path d="M33 13 C26 14 22 20 22 28 C18 22 18 16 22 12 C20 18 22 22 24 24 C24 18 26 14 30 12Z" fill={c(p, "#ff6a2a")} />
      <path d="M30 17 C24 22 24 30 26 36 C21 30 21 22 25 17Z" fill={p.gold} />
      {eye(44, 21, 1.8, c(p, "#ff6a2a"), p.gold)}
      <path d="M54 37 C58 38 60 36 61 33 M53 39 C57 42 60 41 62 39" stroke={p.gold} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M58 30 C60 28 60 26 58 24" stroke={p.ink} strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M28 44 h8 M26 50 h10" stroke={p.steel} strokeWidth="0.9" />
    </g>
  ),
  // Phoenix: plumage of orange flame like the sun, a long tail of endless fire, the fire egg it returns from.
  "phuong-hoang": (p) => (
    <g>
      <circle cx="32" cy="30" r="18" fill={p.gold} opacity={p.locked ? 1 : 0.25} />
      <path d="M40 11 l2 -5 2 5 3 -3 -1 6Z" fill={p.gold} />
      <path d="M42 14 C49 15 50 22 46 26 L54 28 L45 30 C44 37 38 41 31 40 C24 43 20 49 12 54 C15 47 17 43 21 39 C14 41 10 39 7 35 C14 35 19 33 23 30 C26 21 33 14 42 14Z" fill={c(p, "#ff8a3d")} stroke={p.gold} strokeWidth="0.8" />
      <path d="M23 30 C20 24 14 20 6 20 C12 24 16 28 20 34Z" fill={p.gold} />
      <path d="M30 40 C33 48 40 54 50 58 C42 59 34 56 29 50 C28 56 24 60 18 62 C22 56 24 50 26 44Z" fill={p.gold} />
      <path d="M36 44 C42 48 48 50 56 50" stroke={c(p, "#ff8a3d")} strokeWidth="1.6" fill="none" />
      {eye(43, 20, 1.4, p.dark)}
      <ellipse cx="10" cy="56" rx="4" ry="5" fill={p.gold} stroke={c(p, "#ff8a3d")} strokeWidth="1" />
    </g>
  ),
  // Thunder God: black face, fangs, muscles crackling with fire and lightning, a stone hammer and a bolt.
  "than-set": (p) => (
    <g>
      <path d="M50 2 L42 18 H50 L44 32" stroke={p.gold} strokeWidth="2" fill="none" strokeLinejoin="round" />
      <path d="M14 2 L20 14 L14 16 L22 28" stroke={p.gold} strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      <path d="M20 14 C20 8 26 5 32 5 C38 5 44 8 44 14 L46 22 L42 18 C40 16 36 15 32 15 C28 15 24 16 22 18 L18 22Z" fill={p.dark} />
      <circle cx="32" cy="22" r="8.5" fill={c(p, "#2a2a30")} />
      <path d="M24 18 l5 2 M40 18 l-5 2" stroke={p.gold} strokeWidth="1.6" strokeLinecap="round" />
      {eye(28, 21.5, 1.4, p.gold)}
      {eye(36, 21.5, 1.4, p.gold)}
      <path d="M27 27 H37 L35 30 H29Z" fill={p.red} />
      <path d="M28 27 l1 3 M36 27 l-1 3" stroke={p.white} strokeWidth="1.2" />
      <path d="M8 64 C9 46 18 32 32 32 C46 32 55 46 56 64Z" fill={c(p, "#2a2a30")} stroke={p.gold} strokeWidth="0.8" />
      <path d="M18 44 L24 48 L20 52 L26 56 M46 44 L40 48 L44 52 L38 56" stroke={p.gold} strokeWidth="1.2" fill="none" />
      <path d="M8 40 L18 30" stroke={c(p, "#8a5a2b")} strokeWidth="2.6" strokeLinecap="round" />
      <rect x="2" y="34" width="12" height="9" rx="2" fill={p.steel} stroke={p.dark} strokeWidth="0.8" transform="rotate(-45 8 38)" />
    </g>
  ),
  // Saint Gióng: a giant in red-hot iron armour on the fire-breathing Iron Horse, sweeping a bamboo clump.
  "phu-dong": (p) => (
    <g>
      <path d="M2 50 C2 42 6 38 12 38 L30 38 C34 34 38 32 42 34 L46 30 L46 36 C49 38 48 42 45 43 L40 44 L38 52 H34 L34 46 L16 46 L14 54 H10 L11 46 C6 48 3 50 2 50Z" fill={c(p, "#232326")} stroke={p.ink} strokeWidth="0.6" />
      <path d="M46 38 C52 36 56 38 60 36" stroke={p.gold} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M40 33 C36 30 34 26 36 22" stroke={c(p, "#ff6a2a")} strokeWidth="2" fill="none" />
      <path d="M20 6 C20 2 24 0 28 0 C32 0 36 2 36 6 L37 9 H19Z" fill={c(p, "#7a1a12")} stroke={p.gold} strokeWidth="0.6" />
      {face(p, 28, 13, 5.5, "fierce")}
      <path d="M16 38 C16 26 21 19 28 19 C35 19 40 26 40 38Z" fill={c(p, "#b8281e")} stroke={p.gold} strokeWidth="0.8" />
      <path d="M22 25 h12 M21 30 h14" stroke={p.gold} strokeWidth="0.8" />
      <path d="M38 24 L60 2" stroke={c(p, "#e8d27a")} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M52 10 l2 -6 M56 6 l6 -2 M55 8 l7 2 M50 12 l-1 -5" stroke={c(p, "#9fd16a")} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M44 18 l4 0 M48 14 l4 0" stroke={c(p, "#c9b25a")} strokeWidth="1" />
    </g>
  ),
  // Holy Mother Liễu Hạnh in red silk embroidered with a gold phoenix, a bronze bell, the three true fires.
  "lieu-hanh": (p) => (
    <g>
      <g fill={p.gold}>
        <path d="M8 18 C6 12 10 9 10 4 C13 9 14 13 12 18 C11 20 9 20 8 18Z" />
        <path d="M54 16 C52 10 56 7 56 2 C59 7 60 11 58 16 C57 18 55 18 54 16Z" />
        <path d="M56 34 C54 28 58 25 58 20 C61 25 62 29 60 34 C59 36 57 36 56 34Z" />
      </g>
      <path d="M22 10 C26 4 38 4 42 10 L40 13 H24Z" fill={p.gold} stroke={p.dark} strokeWidth="0.6" />
      <path d="M32 3 V7" stroke={p.white} strokeWidth="1.2" />
      <path d="M24 16 C24 11 28 9 32 9 C36 9 40 11 40 16 L42 30 C38 27 26 27 22 30Z" fill={p.dark} />
      {face(p, 32, 19, 6.5, "calm")}
      <path d="M12 64 C13 46 21 30 32 30 C43 30 51 46 52 64Z" fill={c(p, "#d62a2a")} stroke={p.gold} strokeWidth="0.8" />
      <path d="M24 44 C26 38 32 36 36 40 C40 38 44 40 44 44 C40 42 38 44 38 48 C34 46 30 48 30 52 C28 48 26 46 24 44Z" fill={p.gold} />
      <path d="M8 46 C8 40 12 36 16 36 C20 36 24 40 24 46 Z" fill={c(p, "#b8862b")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M8 46 H24" stroke={p.dark} strokeWidth="1.2" />
      <circle cx="16" cy="48" r="1.4" fill={c(p, "#b8862b")} />
      <path d="M16 36 V33" stroke={p.dark} strokeWidth="1.2" />
    </g>
  ),
};

// --- Thổ (Earth) ----------------------------------------------------------------------

const THO: Record<string, Draw> = {
  // Stone spirit: grey blocks bound by earth energy, punching the ground into a small quake.
  "thach-tinh": (p) => (
    <g>
      <path d="M4 58 L14 54 L20 58 L28 54 M36 54 L44 58 L50 54 L60 58" stroke={p.dark} strokeWidth="1.2" fill="none" />
      <g fill={c(p, "#8d8a84")} stroke={p.dark} strokeWidth="0.9">
        <path d="M22 10 L42 10 L45 28 L19 28Z" />
        <path d="M16 30 L48 30 L50 46 L14 46Z" />
        <path d="M6 30 L14 28 L16 40 L8 44Z" />
        <path d="M50 28 L58 30 L60 44 L52 46Z" />
        <path d="M2 46 L12 44 L14 54 L4 56Z" />
        <path d="M18 48 L28 48 L27 58 L19 58Z" />
        <path d="M36 48 L46 48 L45 58 L37 58Z" />
      </g>
      <path d="M14 46 L50 46 M19 28 L45 28" stroke={p.glow} strokeWidth="1.4" opacity={p.locked ? 1 : 0.9} />
      <path d="M8 42 L12 30 M53 44 L56 32" stroke={p.glow} strokeWidth="1" opacity="0.7" />
      {eye(27, 19, 2, p.glow, p.dark)}
      {eye(37, 19, 2, p.glow, p.dark)}
      <path d="M27 24 H37" stroke={p.dark} strokeWidth="1.6" />
      <path d="M30 34 L34 38 L30 42" stroke={p.dark} strokeWidth="0.8" fill="none" />
    </g>
  ),
  // Little turtle with a thick stone shell carved with rolling earth-wave patterns.
  "rua-con": (p) => (
    <g transform="translate(64 0) scale(-1 1)">
      <ellipse cx="51" cy="34" rx="7" ry="6" fill={c(p, "#7da26a")} stroke={p.dark} strokeWidth="0.8" />
      <circle cx="53" cy="32" r="1.4" fill={p.dark} />
      <path d="M53 37 q2 1 4 0" stroke={p.dark} strokeWidth="0.8" fill="none" />
      <path d="M18 24 l-7 -6 M18 44 l-7 6 M42 24 l5 -6 M42 44 l5 6 M12 34 h-6" stroke={c(p, "#7da26a")} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="30" cy="34" rx="18" ry="15" fill={c(p, "#9a948a")} stroke={p.dark} strokeWidth="1" />
      <ellipse cx="30" cy="34" rx="13" ry="10.5" fill="none" stroke={p.dark} strokeWidth="0.8" />
      <path d="M18 34 q3 -3 6 0 q3 3 6 0 q3 -3 6 0 q3 3 6 0 M20 28 q2.5 -2.5 5 0 q2.5 2.5 5 0 q2.5 -2.5 5 0 q2.5 2.5 5 0 M20 40 q2.5 -2.5 5 0 q2.5 2.5 5 0 q2.5 -2.5 5 0 q2.5 2.5 5 0" stroke={c(p, "#5f5a52")} strokeWidth="1" fill="none" />
    </g>
  ),
  // Lân: dragon-headed lion with a shaggy mane of earth gold and bright red, horn and mirror on the brow.
  lan: (p) => (
    <g>
      <path d="M8 36 C2 30 4 20 10 16 C10 22 12 24 16 24 C14 16 18 10 24 8 C24 14 26 16 30 16 C30 10 34 6 40 6 C40 12 42 14 46 14 C48 10 54 10 56 14 C52 16 52 20 54 24 C58 26 60 32 56 38Z" fill={c(p, "#d6402e")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M12 30 C10 26 12 22 16 22 M50 24 C54 24 56 28 54 32" stroke={p.gold} strokeWidth="1.4" fill="none" />
      <path d="M32 6 L34 0 L36 6" fill={p.gold} stroke={p.dark} strokeWidth="0.6" />
      <path d="M14 30 C14 20 22 14 32 14 C42 14 50 20 50 30 L50 40 C50 50 42 56 32 56 C22 56 14 50 14 40Z" fill={p.gold} stroke={p.dark} strokeWidth="0.9" />
      <circle cx="32" cy="20" r="3" fill={c(p, "#cfe8ff")} stroke={p.dark} strokeWidth="0.8" />
      <circle cx="24" cy="30" r="5" fill={p.white} stroke={p.dark} strokeWidth="0.8" />
      <circle cx="40" cy="30" r="5" fill={p.white} stroke={p.dark} strokeWidth="0.8" />
      <circle cx="25" cy="31" r="2.4" fill={p.dark} />
      <circle cx="39" cy="31" r="2.4" fill={p.dark} />
      <path d="M18 24 q6 -4 12 0 M34 24 q6 -4 12 0" stroke={p.dark} strokeWidth="2" fill="none" />
      <ellipse cx="32" cy="38" rx="5" ry="3" fill={c(p, "#d6402e")} />
      <path d="M20 44 C24 50 40 50 44 44 L42 48 C38 53 26 53 22 48Z" fill={p.dark} />
      <path d="M24 46 h16" stroke={p.white} strokeWidth="1.4" />
      <path d="M14 46 C10 52 12 58 18 60 M50 46 C54 52 52 58 46 60" stroke={c(p, "#d6402e")} strokeWidth="2.4" fill="none" />
    </g>
  ),
  // Ông Địa: big-bellied, beaming earth god in an open yellow-brown shirt, fanning himself with a paper fan.
  "ong-dia": (p) => (
    <g>
      <path d="M20 14 C20 7 25 4 31 4 C37 4 42 7 42 14 C38 11 24 11 20 14Z" fill={p.dark} />
      {face(p, 31, 17, 8, "smile")}
      <path d="M24 13 q2 -2 4 0 M34 13 q2 -2 4 0" stroke={p.dark} strokeWidth="1" fill="none" />
      <path d="M8 64 C8 44 18 28 31 28 C44 28 54 44 54 64Z" fill={c(p, "#b8862b")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M31 28 C22 34 18 46 20 64 M31 28 C40 34 44 46 42 64" stroke={p.dark} strokeWidth="0.8" fill="none" />
      <ellipse cx="31" cy="48" rx="11" ry="12" fill={p.skin} />
      <circle cx="31" cy="50" r="1.4" fill={c(p, "#a8784a")} />
      <path d="M44 34 L60 22 A14 14 0 0 1 62 40Z" fill={p.white} stroke={p.dark} strokeWidth="0.8" />
      <path d="M44 34 L60 26 M44 34 L61 30 M44 34 L62 35" stroke={p.dark} strokeWidth="0.5" />
    </g>
  ),
  // Từ Đạo Hạnh: stern Taoist master in an earth-yellow robe with a meditation staff, sealed stones floating round him.
  "tu-dao-hanh": (p) => (
    <g>
      <g fill={c(p, "#8d8a84")} stroke={p.dark} strokeWidth="0.6">
        <path d="M6 14 L12 12 L14 18 L8 20Z" />
        <path d="M52 8 L58 10 L57 16 L51 15Z" />
        <path d="M4 34 L10 33 L11 39 L5 40Z" />
      </g>
      <path d="M9 15 l3 3 M54 11 l2 3 M6 36 l3 2" stroke={p.glow} strokeWidth="0.9" />
      <path d="M24 16 C24 11 28 8 32 8 C36 8 40 11 40 16 Z" fill={p.dark} />
      <circle cx="32" cy="7" r="2.4" fill={p.dark} />
      {face(p, 32, 19, 6.5, "stern")}
      <path d="M28 24 C29 31 35 31 36 24 C35 34 29 34 28 24Z" fill={p.white} />
      <path d="M10 64 C11 46 20 32 32 32 C44 32 53 46 54 64Z" fill={c(p, "#e0a83a")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M22 36 L40 64 M42 36 L34 64" stroke={c(p, "#a84a22")} strokeWidth="3" />
      <path d="M50 64 L54 14" stroke={c(p, "#6b4a2a")} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="54" cy="12" r="3" fill="none" stroke={p.gold} strokeWidth="1.4" />
      <path d="M51 14 a3 3 0 0 0 6 0" stroke={p.gold} strokeWidth="1" fill="none" />
    </g>
  ),
  // War elephant with nine jade tusks, armoured in thick stone plates.
  "voi-chin-nga": (p) => (
    <g>
      <path d="M16 18 C4 18 2 34 6 42 C8 46 14 46 18 42Z M48 18 C60 18 62 34 58 42 C56 46 50 46 46 42Z" fill={c(p, "#8d8a84")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M32 10 C43 10 49 18 49 28 C49 36 44 40 38 41 V54 C38 60 33 62 30 58 C29 56 31 53 32 51 C26 50 26 44 27 42 C20 40 15 35 15 28 C15 18 21 10 32 10Z" fill={c(p, "#9a948a")} stroke={p.dark} strokeWidth="0.9" />
      <path d="M20 14 H44 L46 22 H18Z" fill={c(p, "#6f6a62")} stroke={p.dark} strokeWidth="0.6" />
      <path d="M24 14 V22 M32 14 V22 M40 14 V22" stroke={p.dark} strokeWidth="0.6" />
      {eye(25, 27, 1.8, p.dark)}
      {eye(39, 27, 1.8, p.dark)}
      <g stroke={c(p, "#7de0b0")} strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M27 38 C22 44 14 46 8 42" />
        <path d="M27 40 C22 48 16 52 10 52" />
        <path d="M28 42 C26 50 22 56 16 58" />
        <path d="M26 36 C20 38 14 38 10 34" />
        <path d="M37 38 C42 44 50 46 56 42" />
        <path d="M37 40 C42 48 48 52 54 52" />
        <path d="M36 42 C38 50 42 56 48 58" />
        <path d="M38 36 C44 38 50 38 54 34" />
        <path d="M32 44 C32 50 32 54 32 60" />
      </g>
    </g>
  ),
  // Mother Earth in earth-yellow robes patterned with rice ears, enthroned on an earthen tower.
  "mau-dia": (p) => (
    <g>
      <path d="M8 64 L12 50 H52 L56 64Z" fill={c(p, "#8a6118")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M12 56 H52 M14 60 H50" stroke={p.dark} strokeWidth="0.6" />
      <path d="M22 9 C26 4 38 4 42 9 L40 12 H24Z" fill={p.gold} stroke={p.dark} strokeWidth="0.6" />
      <circle cx="32" cy="5" r="1.4" fill={c(p, "#3fae6a")} />
      <path d="M24 16 C24 11 28 9 32 9 C36 9 40 11 40 16 L41 28 C38 25 26 25 23 28Z" fill={p.dark} />
      {face(p, 32, 18, 6.5, "calm")}
      <path d="M14 52 C15 38 22 27 32 27 C42 27 49 38 50 52Z" fill={c(p, "#e2b23a")} stroke={p.dark} strokeWidth="0.8" />
      <g stroke={c(p, "#7a5a10")} strokeWidth="0.9" fill="none">
        <path d="M22 50 C22 44 24 40 27 36 M24 44 l-3 -2 M25 41 l-3 -2 M26 38 l-3 -2" />
        <path d="M42 50 C42 44 40 40 37 36 M40 44 l3 -2 M39 41 l3 -2 M38 38 l3 -2" />
      </g>
      <path d="M32 30 V50" stroke={p.dark} strokeWidth="0.8" />
    </g>
  ),
  // Nghê: the Vietnamese guardian, part house dog part dragon-lion, sitting firm on a stone plinth, playful but stern.
  nghe: (p) => (
    <g>
      <path d="M10 62 V54 H54 V62Z" fill={c(p, "#8d8a84")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M10 56 H54" stroke={p.dark} strokeWidth="0.6" />
      <path d="M18 54 C16 44 18 36 24 32 L22 54Z M46 54 C48 44 46 36 40 32 L42 54Z" fill={c(p, "#3c8a6a")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M22 54 C20 42 24 34 32 34 C40 34 44 42 42 54Z" fill={c(p, "#3c8a6a")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M50 40 C56 36 58 30 56 24 C60 28 60 36 54 42Z" fill={c(p, "#3c8a6a")} stroke={p.dark} strokeWidth="0.6" />
      <path d="M14 22 C10 18 12 12 16 12 C16 8 22 6 24 9 C26 5 32 4 34 8 C38 4 44 6 44 10 C48 9 52 13 50 17 C54 19 54 25 50 27 L48 34 C44 38 20 38 16 34Z" fill={c(p, "#3c8a6a")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M16 16 q3 2 2 5 M24 11 q2 3 0 6 M34 10 q2 3 0 6 M44 12 q1 3 -1 6 M49 20 q-2 2 -1 5" stroke={p.gold} strokeWidth="1.2" fill="none" />
      <circle cx="25" cy="25" r="3.6" fill={p.white} stroke={p.dark} strokeWidth="0.6" />
      <circle cx="39" cy="25" r="3.6" fill={p.white} stroke={p.dark} strokeWidth="0.6" />
      <circle cx="26" cy="25" r="1.8" fill={p.dark} />
      <circle cx="38" cy="25" r="1.8" fill={p.dark} />
      <path d="M21 20 l7 2 M43 20 l-7 2" stroke={p.dark} strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="32" cy="30" rx="3" ry="2" fill={p.dark} />
      <path d="M24 33 Q32 38 40 33" stroke={p.dark} strokeWidth="1.4" fill="none" />
    </g>
  ),
  // Sơn Tinh: bare-chested mountain lord with a beast-hide cloak and jade beads, his staff lifting a mountain range.
  "son-tinh": (p) => (
    <g>
      <path d="M2 30 L12 12 L18 22 L26 6 L34 20 L40 12 L50 28Z" fill={c(p, "#5c7a4a")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M26 6 L22 14 L26 12 L29 16 M12 12 L9 18 L12 17" stroke={p.white} strokeWidth="1" fill="none" />
      <path d="M50 64 L56 20" stroke={c(p, "#6b4a2a")} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M56 20 C50 24 44 28 40 28" stroke={p.glow} strokeWidth="1.4" fill="none" strokeDasharray="2 2" />
      <path d="M24 30 C24 25 27 22 31 22 C35 22 38 25 38 30 Z" fill={p.dark} />
      {face({ ...p, skin: c(p, "#d29a62") }, 31, 32, 6.5, "stern")}
      <path d="M26 37 C27 42 35 42 36 37 C35 45 27 45 26 37Z" fill={p.dark} />
      <path d="M8 64 C9 52 18 42 31 42 C44 42 53 52 54 64Z" fill={c(p, "#d29a62")} />
      <path d="M22 50 C26 48 28 52 27 56 M40 50 C36 48 34 52 35 56" stroke={c(p, "#9a6a3a")} strokeWidth="1.2" fill="none" />
      <path d="M8 64 C8 52 12 44 20 42 L16 64Z M54 64 C54 52 50 44 42 42 L46 64Z" fill={c(p, "#8a5a2b")} />
      <path d="M10 50 l3 2 M11 56 l3 1 M51 50 l-3 2 M50 56 l-3 1" stroke={p.dark} strokeWidth="1" />
      <g fill={c(p, "#3fbf8f")} stroke={p.dark} strokeWidth="0.4">
        <circle cx="24" cy="44" r="1.6" />
        <circle cx="27.5" cy="46" r="1.6" />
        <circle cx="31" cy="47" r="1.8" />
        <circle cx="34.5" cy="46" r="1.6" />
        <circle cx="38" cy="44" r="1.6" />
      </g>
    </g>
  ),
  // Golden Turtle: a giant shell of royal gold armour carrying an ancient stone stele.
  "kim-quy": (p) => (
    <g transform="translate(64 0) scale(-1 1)">
      <path d="M26 6 H38 V22 H26Z" fill={c(p, "#8d8a84")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M25 6 C26 2 38 2 39 6Z" fill={c(p, "#8d8a84")} stroke={p.dark} strokeWidth="0.8" />
      <path d="M29 10 h6 M29 13 h6 M29 16 h6 M29 19 h4" stroke={p.dark} strokeWidth="0.7" />
      <ellipse cx="54" cy="38" rx="7" ry="6" fill={c(p, "#c9952f")} stroke={p.dark} strokeWidth="0.8" />
      <circle cx="56" cy="36" r="1.5" fill={p.dark} />
      <path d="M14 30 l-8 -4 M14 50 l-8 6 M46 30 l6 -6 M46 50 l6 6" stroke={c(p, "#c9952f")} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M8 42 C8 30 18 22 32 22 C46 22 52 30 52 42 C52 50 44 56 30 56 C16 56 8 50 8 42Z" fill={p.gold} stroke={p.dark} strokeWidth="1" />
      <path d="M30 26 L37 30 V38 L30 42 L23 38 V30Z M30 26 V22 M37 30 L44 27 M37 38 L45 42 M30 42 V52 M23 38 L14 42 M23 30 L16 27" stroke={c(p, "#8a6118")} strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <path d="M10 46 C18 50 40 52 50 46" stroke={c(p, "#8a6118")} strokeWidth="1" fill="none" />
      <circle cx="30" cy="34" r="2" fill={c(p, "#3fbf8f")} />
    </g>
  ),
};

export const PORTRAITS: Record<string, Draw> = { ...KIM, ...MOC, ...THUY, ...HOA, ...THO };
