// Pieces for Bách Linh Kỳ: painted lacquer medallions by element, each
// with its monster's painted portrait (art-images.ts, assets.ts).

import { figureSrc, tokenSrc } from "./art-images";
import { PIECE, elementIcon } from "./assets";
import { ELEMENT_NAME, monster, type Element } from "./monsters";

/** Ngũ hành colours, after the traditional ones: Kim white-gold, Mộc green, Thủy deep blue-black, Hỏa red, Thổ yellow-ochre. */
export const ELEMENT_COLOR: Record<Element, { base: string; deep: string; ink: string }> = {
  kim: { base: "#e9dfc6", deep: "#b49b5e", ink: "#3a2f1a" },
  moc: { base: "#2f7d52", deep: "#1c5236", ink: "#f3ecd8" },
  thuy: { base: "#25466e", deep: "#142b47", ink: "#e8f0fb" },
  hoa: { base: "#b8392d", deep: "#7e2119", ink: "#fbecd9" },
  tho: { base: "#c9952f", deep: "#8a6118", ink: "#2d1f08" },
};

/** The bright colour of each element's light: magic and glows (also the colours the art prompts ask for). */
export const ELEMENT_GLOW: Record<Element, string> = { kim: "#5fc8ff", moc: "#9dff7a", thuy: "#7fd8ff", hoa: "#ffd23f", tho: "#7dffcf" };

/** A monster's painted face (already cropped, see art-images.ts), filling the medallion. Locked: a dark silhouette. */
function ArtImage({ id, locked }: { id: string; locked: boolean }) {
  return <image href={tokenSrc(id)} x="9" y="9" width="46" height="46" style={locked ? { filter: "brightness(0)", opacity: 0.6 } : undefined} />;
}

/** The whole painted figure of a monster, for places with room to show it. */
export function MonsterFigure({ monsterId, className, title }: { monsterId: string; className?: string; title?: string }) {
  return <img src={figureSrc(monsterId)} width={448} height={448} alt={title ?? ""} className={className} loading="lazy" decoding="async" />;
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
 * A round piece, built from painted lacquer parts (assets.ts): the element's
 * medallion with the monster's portrait inside, under a gold rim for the
 * player or a black one for Tianwu. Face down: the red lacquer back with only
 * the level. Every piece carries its level on a badge.
 */
export function Token({ monsterId, level, side, locked = false, className, title }: TokenProps) {
  const label = title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
  const ring = side === 0 ? "#e2b84a" : "#1a1a22";
  if (!monsterId) {
    return (
      <svg viewBox="0 0 64 64" className={className} {...label}>
        {title ? <title>{title}</title> : null}
        <image href={PIECE.back} x="1" y="1" width="62" height="62" />
        <circle cx="32" cy="32" r="30.5" fill="none" stroke={ring} strokeWidth="2" />
        <text x="32" y="38.5" textAnchor="middle" fontSize="17" fontWeight="800" fill="#f3d58a" stroke="#5a1414" strokeWidth="0.8" paintOrder="stroke" fontFamily="ui-sans-serif, system-ui">
          {level}
        </text>
      </svg>
    );
  }
  const m = monster(monsterId);
  const grey = locked ? { filter: "grayscale(1) brightness(0.55)" } : undefined;
  return (
    <svg viewBox="0 0 64 64" className={className} {...label}>
      {title ? <title>{title}</title> : null}
      <image href={PIECE.base(m.element)} x="1" y="1" width="62" height="62" style={grey} />
      <clipPath id="blk-clip">
        <circle cx="32" cy="32" r="23" />
      </clipPath>
      <g clipPath="url(#blk-clip)">
        <ArtImage id={m.id} locked={locked} />
      </g>
      <image href={PIECE.rim(side)} x="0" y="0" width="64" height="64" style={grey} />
      <circle cx="51" cy="51" r="9" fill="#111827" stroke={ring} strokeWidth="1.6" />
      <text x="51" y="55" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#fff" fontFamily="ui-sans-serif, system-ui">
        {level}
      </text>
    </svg>
  );
}

/** The painted emblem of an element, with its name for screen readers. */
export function ElementDot({ element, lang, className }: { element: Element; lang: "vi" | "en"; className?: string }) {
  return (
    <img
      src={elementIcon(element)}
      width={128}
      height={128}
      alt={ELEMENT_NAME[element][lang]}
      title={ELEMENT_NAME[element][lang]}
      className={className}
      style={{ display: "inline-block", width: "1.25em", height: "1.25em", verticalAlign: "middle" }}
      loading="lazy"
      decoding="async"
    />
  );
}
