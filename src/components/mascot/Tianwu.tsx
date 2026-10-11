import * as React from "react";

// Tianwu, the Shanverse mascot: a slow-but-steady astronaut turtle.
// Three shared details make every version recognisable: the glass helmet,
// the antenna with a gold star, and the navy shell with a gold rim.
//
// Pure SVG with fixed colours (no ids, no hooks), so these work in server
// and client components and on light or dark backgrounds alike.

export const MASCOT_NAME = "Tianwu";

const C = {
  shell: "#1D3A7D",
  shellDark: "#0E2156",
  gold: "#D9AF62",
  goldLight: "#F0C27B",
  suit: "#F4F1EA",
  suitLine: "#CFC7B6",
  plate: "#E8D9A8",
  plateLine: "#C9A75F",
  glass: "#EAF0FA",
  glassLine: "#C8D3E6",
  skin: "#7FBF85",
  limb: "#6FAE7A",
  limbDark: "#4E8A5B",
  ink: "#031242",
  mouth: "#2D5A37",
  cheek: "#F2A7A0",
  metal: "#9AA3B5",
  sweat: "#8FB0F5",
};

type SvgProps = {
  className?: string;
  /** Accessible description. Without it the drawing is decorative. */
  title?: string;
};

function a11y(title?: string) {
  return title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
}

const star = (cx: number, cy: number, r: number, fill: string) => (
  <path
    d={`M${cx} ${cy - r} Q${cx + r * 0.2} ${cy - r * 0.2} ${cx + r} ${cy} Q${cx + r * 0.2} ${cy + r * 0.2} ${cx} ${cy + r} Q${cx - r * 0.2} ${cy + r * 0.2} ${cx - r} ${cy} Q${cx - r * 0.2} ${cy - r * 0.2} ${cx} ${cy - r}Z`}
    fill={fill}
  />
);

export type TianwuPose = "stand" | "wave" | "push" | "determined";

/** Front-facing Tianwu (version A) for pages: About, 404, empty states, game messages. */
export function Tianwu({ pose = "stand", className, title }: SvgProps & { pose?: TianwuPose }) {
  if (pose === "push") return <TianwuPushing className={className} title={title} />;
  const waving = pose === "wave";
  const determined = pose === "determined";

  return (
    <svg viewBox="0 0 200 220" className={className} {...a11y(title)}>
      <path d="M100 30 V12" stroke={C.metal} strokeWidth="3" strokeLinecap="round" />
      {star(100, waving ? 11 : 11, waving ? 10 : 8, waving ? C.goldLight : C.gold)}
      {waving ? (
        <g stroke={C.goldLight} strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <path d="M84 6 L78 2" />
          <path d="M116 6 L122 2" />
        </g>
      ) : null}
      <ellipse cx="100" cy="132" rx="62" ry="54" fill={C.shell} stroke={C.gold} strokeWidth="4" />
      <rect x="70" y="168" width="22" height="34" rx="10" fill={C.suit} stroke={C.suitLine} strokeWidth="2" />
      <rect x="108" y="168" width="22" height="34" rx="10" fill={C.suit} stroke={C.suitLine} strokeWidth="2" />
      <ellipse cx="81" cy="203" rx="15" ry="8" fill={C.shell} />
      <ellipse cx="119" cy="203" rx="15" ry="8" fill={C.shell} />
      <path d="M60 118 Q38 132 42 156" stroke={C.suit} strokeWidth="18" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="158" r="10" fill={C.limb} />
      {waving ? (
        <>
          <path d="M140 116 Q164 100 166 72" stroke={C.suit} strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="166" cy="66" r="10" fill={C.limb} />
          <g stroke={C.metal} strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M180 58 Q186 66 182 76" />
            <path d="M186 50 Q196 64 189 82" />
          </g>
        </>
      ) : determined ? (
        <>
          <path d="M140 118 Q166 116 162 92" stroke={C.suit} strokeWidth="18" strokeLinecap="round" fill="none" />
          <rect x="150" y="74" width="22" height="20" rx="8" fill={C.limb} />
          <path d="M156 78 V86 M162 78 V86" stroke={C.limbDark} strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M140 118 Q162 132 158 156" stroke={C.suit} strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="158" cy="158" r="10" fill={C.limb} />
        </>
      )}
      <path d="M62 112 Q62 92 100 92 Q138 92 138 112 V160 Q138 180 100 180 Q62 180 62 160Z" fill={C.suit} stroke={C.suitLine} strokeWidth="2" />
      <path d="M80 118 H120 Q122 150 100 166 Q78 150 80 118Z" fill={C.plate} stroke={C.plateLine} strokeWidth="2" />
      <path d="M80 132 H120 M83 146 H117" stroke={C.plateLine} strokeWidth="2" />
      {pose === "stand" ? (
        <>
          <circle cx="128" cy="110" r="7" fill={C.shell} />
          {star(128, 110, 5, C.gold)}
        </>
      ) : null}
      <circle cx="100" cy="62" r="38" fill={C.glass} stroke={C.glassLine} strokeWidth="3" />
      <ellipse cx="100" cy="66" rx="26" ry="24" fill={C.skin} />
      {waving ? (
        <>
          <path d="M85 64 Q90 58 95 64" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M105 64 Q110 58 115 64" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M90 74 Q100 84 110 74 Z" fill={C.mouth} />
        </>
      ) : (
        <>
          {determined ? (
            <>
              <path d="M83 55 L95 59" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
              <path d="M117 55 L105 59" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
              <path d="M124 46 Q129 55 124 59 Q119 55 124 46Z" fill={C.sweat} />
            </>
          ) : null}
          <ellipse cx="90" cy="64" rx="5.5" ry="6.5" fill={C.ink} />
          <ellipse cx="110" cy="64" rx="5.5" ry="6.5" fill={C.ink} />
          <circle cx="92" cy="62" r="1.8" fill="#FFFFFF" />
          <circle cx="112" cy="62" r="1.8" fill="#FFFFFF" />
          <path d="M93 76 Q100 81 107 76" stroke={C.mouth} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="84" cy="73" rx="4" ry="2.5" fill={C.cheek} opacity="0.7" />
      <ellipse cx="116" cy="73" rx="4" ry="2.5" fill={C.cheek} opacity="0.7" />
      <path d="M74 46 Q82 32 98 30" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
      <rect x="72" y="94" width="56" height="10" rx="5" fill={C.gold} />
    </svg>
  );
}

function TianwuPushing({ className, title }: SvgProps) {
  return (
    <svg viewBox="0 0 280 220" className={className} {...a11y(title)}>
      <ellipse cx="140" cy="208" rx="120" ry="7" fill={C.ink} opacity="0.08" />
      <g transform="translate(176 104)">
        <rect width="96" height="96" rx="10" fill={C.shell} stroke={C.gold} strokeWidth="4" />
        <path d="M10 10 L86 86 M86 10 L10 86" stroke={C.gold} strokeOpacity="0.3" strokeWidth="2" />
        <circle cx="48" cy="48" r="16" fill={C.shellDark} stroke={C.gold} strokeWidth="2" />
        {star(48, 48, 12, C.goldLight)}
      </g>
      <g stroke={C.metal} strokeWidth="3" strokeLinecap="round">
        <path d="M10 120 H30" />
        <path d="M4 140 H28" />
        <path d="M12 160 H30" />
      </g>
      <g transform="rotate(10 100 200) translate(10 0)">
        <path d="M100 30 V14" stroke={C.metal} strokeWidth="3" strokeLinecap="round" />
        {star(100, 13, 9, C.gold)}
        <ellipse cx="100" cy="132" rx="62" ry="54" fill={C.shell} stroke={C.gold} strokeWidth="4" />
        <rect x="62" y="166" width="22" height="34" rx="10" fill={C.suit} stroke={C.suitLine} strokeWidth="2" transform="rotate(-18 73 183)" />
        <rect x="108" y="168" width="22" height="34" rx="10" fill={C.suit} stroke={C.suitLine} strokeWidth="2" />
        <ellipse cx="64" cy="203" rx="15" ry="8" fill={C.shell} />
        <ellipse cx="119" cy="203" rx="15" ry="8" fill={C.shell} />
        <path d="M62 112 Q62 92 100 92 Q138 92 138 112 V160 Q138 180 100 180 Q62 180 62 160Z" fill={C.suit} stroke={C.suitLine} strokeWidth="2" />
        <path d="M80 118 H120 Q122 150 100 166 Q78 150 80 118Z" fill={C.plate} stroke={C.plateLine} strokeWidth="2" />
        <path d="M80 132 H120 M83 146 H117" stroke={C.plateLine} strokeWidth="2" />
        <path d="M128 116 Q150 112 160 108" stroke={C.suit} strokeWidth="18" strokeLinecap="round" fill="none" />
        <path d="M128 140 Q150 140 160 136" stroke={C.suit} strokeWidth="18" strokeLinecap="round" fill="none" />
        <circle cx="164" cy="106" r="10" fill={C.limb} />
        <circle cx="164" cy="136" r="10" fill={C.limb} />
        <circle cx="100" cy="62" r="38" fill={C.glass} stroke={C.glassLine} strokeWidth="3" />
        <ellipse cx="102" cy="66" rx="26" ry="24" fill={C.skin} />
        <path d="M86 56 L97 60" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
        <path d="M118 56 L107 60" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="92" cy="66" rx="4.5" ry="5" fill={C.ink} />
        <ellipse cx="112" cy="66" rx="4.5" ry="5" fill={C.ink} />
        <path d="M94 78 H110" stroke={C.mouth} strokeWidth="3" strokeLinecap="round" />
        <path d="M128 50 Q132 58 128 62 Q124 58 128 50Z" fill={C.sweat} />
        <path d="M74 46 Q82 32 98 30" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" />
        <rect x="72" y="94" width="56" height="10" rx="5" fill={C.gold} />
      </g>
    </svg>
  );
}

export type Facing = "up" | "down" | "left" | "right";
const ROTATION: Record<Facing, number> = { up: 0, right: 90, down: 180, left: 270 };

/** Top-down Tianwu (version C) for game boards. The head points where it faces. */
export function TianwuTop({ facing = "up", className, title }: SvgProps & { facing?: Facing }) {
  return (
    <svg viewBox="0 0 100 100" className={className} {...a11y(title)}>
      <g transform={`rotate(${ROTATION[facing]} 50 50)`}>
        <ellipse cx="25" cy="36" rx="10" ry="7" fill={C.limb} transform="rotate(-35 25 36)" />
        <ellipse cx="75" cy="36" rx="10" ry="7" fill={C.limb} transform="rotate(35 75 36)" />
        <ellipse cx="28" cy="74" rx="9" ry="6" fill={C.limb} transform="rotate(35 28 74)" />
        <ellipse cx="72" cy="74" rx="9" ry="6" fill={C.limb} transform="rotate(-35 72 74)" />
        <path d="M50 88 L46 95 L54 95Z" fill={C.limb} />
        <circle cx="50" cy="18" r="13" fill={C.glass} stroke={C.glassLine} strokeWidth="2" />
        <ellipse cx="50" cy="19" rx="8.5" ry="8" fill={C.skin} />
        <circle cx="46" cy="16" r="2.2" fill={C.ink} />
        <circle cx="54" cy="16" r="2.2" fill={C.ink} />
        <path d="M43 11 Q46 7 51 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
        <ellipse cx="50" cy="57" rx="27" ry="30" fill={C.shell} stroke={C.gold} strokeWidth="3" />
        <path d="M41 50 L50 45 L59 50 L59 62 L50 67 L41 62Z" fill={C.shellDark} stroke={C.gold} strokeWidth="1.6" />
        <g stroke={C.gold} strokeOpacity="0.55" strokeWidth="1.6">
          <path d="M50 45 V28" />
          <path d="M59 50 L74 42" />
          <path d="M59 62 L75 70" />
          <path d="M50 67 V86" />
          <path d="M41 62 L25 70" />
          <path d="M41 50 L26 42" />
        </g>
        {star(50, 56, 5, C.goldLight)}
      </g>
    </svg>
  );
}

/** Round badge (version D) for avatars, author boxes and small callouts. */
export function TianwuBadge({ className, title }: SvgProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} {...a11y(title)}>
      <circle cx="100" cy="100" r="96" fill={C.ink} stroke={C.gold} strokeWidth="6" />
      <circle cx="100" cy="80" r="70" fill={C.shell} opacity="0.55" />
      <g fill="#FAF7F0" opacity="0.7">
        <circle cx="40" cy="60" r="1.6" />
        <circle cx="160" cy="50" r="1.2" />
        <circle cx="150" cy="140" r="1.4" />
        <circle cx="30" cy="120" r="1" />
        <circle cx="70" cy="30" r="1.2" />
      </g>
      {star(168, 84, 8, C.gold)}
      {star(34, 91, 5, C.gold)}
      {/* Shoulders, kept inside the circle so no clip path is needed. */}
      <path d="M36 168 Q52 150 100 148 Q148 150 164 168 A92 92 0 0 1 36 168Z" fill={C.shell} stroke={C.gold} strokeWidth="4" />
      <path d="M62 178 Q62 156 100 156 Q138 156 138 178 A92 92 0 0 1 62 178Z" fill={C.suit} />
      <rect x="72" y="150" width="56" height="10" rx="5" fill={C.gold} />
      <circle cx="100" cy="104" r="46" fill={C.glass} stroke={C.glassLine} strokeWidth="3" />
      <ellipse cx="100" cy="109" rx="32" ry="29" fill={C.skin} />
      <ellipse cx="88" cy="106" rx="6.5" ry="7.5" fill={C.ink} />
      <ellipse cx="112" cy="106" rx="6.5" ry="7.5" fill={C.ink} />
      <circle cx="90" cy="104" r="2.2" fill="#FFFFFF" />
      <circle cx="114" cy="104" r="2.2" fill="#FFFFFF" />
      <path d="M91 121 Q100 128 109 121" stroke={C.mouth} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="80" cy="117" rx="5" ry="3" fill={C.cheek} opacity="0.75" />
      <ellipse cx="120" cy="117" rx="5" ry="3" fill={C.cheek} opacity="0.75" />
      <path d="M68 86 Q76 68 96 64" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M100 58 V42" stroke={C.metal} strokeWidth="3" strokeLinecap="round" />
      {star(100, 38, 10, C.goldLight)}
    </svg>
  );
}
