import * as React from "react";

import type { PieceType } from "./logic";

// Flat piece symbols, drawn for Shanverse on a 24×24 grid. They are drawn in
// `currentColor` so the side colour comes from the token around them.

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const GLYPHS: Record<PieceType, React.ReactNode> = {
  // Commander: a five-point star.
  c: <path d="M12 3.5l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.2l-5 2.7 1-5.6-4.1-3.9 5.6-.7z" fill="currentColor" />,
  // Headquarters: a low bunker with a flag.
  h: (
    <g {...STROKE}>
      <path d="M4 19h16M6 19v-5a6 6 0 0 1 12 0v5" />
      <path d="M12 8V3.5l4 1.5-4 1.5" />
      <path d="M10 19v-3h4v3" />
    </g>
  ),
  // Infantry: a helmet.
  i: (
    <g {...STROKE}>
      <path d="M4.5 15.5a7.5 7.5 0 0 1 15 0z" />
      <path d="M3 15.5h18M12 8v-1" />
    </g>
  ),
  // Militia: a conical hat.
  m: (
    <g {...STROKE}>
      <path d="M12 4.5L3.5 16h17z" />
      <path d="M8 19.5c2.5 1 5.5 1 8 0" />
    </g>
  ),
  // Engineer: a bridge span.
  e: (
    <g {...STROKE}>
      <path d="M3 10h18M3 10v8M21 10v8" />
      <path d="M6 18a6 6 0 0 1 12 0" />
      <path d="M9 10v3M15 10v3" />
    </g>
  ),
  // Tank: tracks, hull and turret with a gun.
  t: (
    <g {...STROKE}>
      <rect x="3" y="14" width="18" height="5" rx="2.5" />
      <path d="M7 14v-3h8v3M15 12h6" />
    </g>
  ),
  // Artillery: a gun on a wheel.
  a: (
    <g {...STROKE}>
      <circle cx="9" cy="16" r="3.5" />
      <path d="M10.5 13l9-7M4 20h10" />
    </g>
  ),
  // Anti-air gun: twin barrels pointing up.
  g: (
    <g {...STROKE}>
      <path d="M5 19h14M8 19l2-5h4l2 5" />
      <path d="M10.5 14l-2-9M13.5 14l2-9" />
    </g>
  ),
  // Missile: an upright rocket.
  s: (
    <g {...STROKE}>
      <path d="M12 3c2.2 2 3 4.8 3 8v6H9v-6c0-3.2.8-6 3-8z" />
      <path d="M9 14l-3 3.5V20h3M15 14l3 3.5V20h-3M12 17v3" />
    </g>
  ),
  // Air force: a jet seen from above.
  f: <path d="M12 2.8c.9 0 1.4 1.2 1.4 3v3.7l7 4.3v2l-7-2.2v3.8l2.2 1.7v1.6L12 19.7l-3.6 1v-1.6l2.2-1.7v-3.8l-7 2.2v-2l7-4.3V5.8c0-1.8.5-3 1.4-3z" fill="currentColor" />,
  // Navy: a ship's hull with a bridge.
  n: (
    <g {...STROKE}>
      <path d="M3 15h18l-2.5 4.5h-13z" />
      <path d="M8 15v-4h6v4M11 11V7.5h2" />
    </g>
  ),
};

export function PieceGlyph({ type, ...props }: { type: PieceType } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      {GLYPHS[type]}
    </svg>
  );
}

/** The glyph as SVG children, for drawing inside the board's own SVG. */
export function glyph(type: PieceType) {
  return GLYPHS[type];
}
