// Pictures for the three themes, as plain SVG: a target at each strength,
// the thing that flies, the burst when a target goes, and a small ammo icon.
// Shapes are bold and flat so the four states read at phone size; the game's
// rules list the states with these same pictures (StateLegend).

import { cn } from "@/lib/cn";

import type { ThemeId } from "./themes";

type PieceProps = { theme: ThemeId; strength: number };

/**
 * A soft glow that fades to nothing at its edge. Every copy uses the same
 * gradient id with the same stops, so duplicates on the page are harmless.
 */
function Glow({ r, color, opacity }: { r: number; color: "amber" | "orange"; opacity: number }) {
  const id = `rc-glow-${color}`;
  const stop = color === "amber" ? "#fcd34d" : "#fb923c";
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={stop} stopOpacity="1" />
          <stop offset="55%" stopColor={stop} stopOpacity="0.45" />
          <stop offset="100%" stopColor={stop} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill={`url(#${id})`} opacity={opacity} />
    </>
  );
}

export function Piece({ theme, strength }: PieceProps) {
  if (strength <= 0) return <EmptyCell theme={theme} />;
  if (theme === "lantern") return <Lantern strength={strength} />;
  if (theme === "space") return <Asteroid strength={strength} />;
  return <Junk strength={strength} />;
}

function EmptyCell({ theme }: { theme: ThemeId }) {
  if (theme === "space") {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full opacity-50">
        <circle cx="38" cy="44" r="1.6" fill="#c7d2fe" />
        <circle cx="64" cy="60" r="1.1" fill="#c7d2fe" />
      </svg>
    );
  }
  const stroke = theme === "lantern" ? "#f9c97a" : "#7fb8cc";
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full opacity-30">
      <ellipse cx="50" cy="60" rx="22" ry="5" fill="none" stroke={stroke} strokeWidth="2.5" />
      <ellipse cx="50" cy="60" rx="10" ry="2.5" fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

/** A lotus lantern: unlit at 4, a bigger flame and glow at each step, blazing at 1. */
function Lantern({ strength }: { strength: number }) {
  const lit = 4 - strength; // 0 unlit … 3 blazing
  const petal = ["#b5899c", "#e879a8", "#f0609e", "#f43f86"][lit];
  const petalDark = ["#8a6577", "#be4f80", "#c23a78", "#be185d"][lit];
  const glow = [0, 20, 30, 42][lit];
  const flameTop = [48, 38, 30, 20][lit];
  const flameWidth = [0, 5, 7, 10][lit];
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full">
      {glow ? <Glow r={glow + 6} color="amber" opacity={0.25 + lit * 0.15} /> : null}
      <ellipse cx="50" cy="80" rx="30" ry="5" fill={lit ? "#fbbf24" : "#1e2a5a"} opacity={lit ? 0.25 : 0.6} />
      <ellipse cx="50" cy="73" rx="30" ry="7" fill="#2f6b45" />
      <path d="M30 70 Q34 44 50 38 Q66 44 70 70 Z" fill={petalDark} />
      <rect x="45" y="48" width="10" height="16" rx="2" fill="#fef3c7" />
      {lit ? (
        <g className="rc-flame">
          <path d={`M50 ${flameTop} Q${50 - flameWidth} 44 50 50 Q${50 + flameWidth} 44 50 ${flameTop} Z`} fill="#f97316" />
          <path d={`M50 ${flameTop + 8} Q${50 - flameWidth / 2} 45 50 49 Q${50 + flameWidth / 2} 45 50 ${flameTop + 8} Z`} fill="#fde68a" />
        </g>
      ) : null}
      <path d="M22 74 Q20 54 36 48 Q40 62 44 74 Z" fill={petal} />
      <path d="M78 74 Q80 54 64 48 Q60 62 56 74 Z" fill={petal} />
      <path d="M38 76 Q40 58 50 52 Q60 58 62 76 Z" fill={petal} stroke={petalDark} strokeWidth="1.5" />
    </svg>
  );
}

/** A rock: whole at 4, cracked at 3, glowing cracks at 2, splitting apart at 1. */
function Asteroid({ strength }: { strength: number }) {
  const rock = ["", "#5a3a34", "#7a5048", "#7d818e", "#8d919e"][strength];
  const rockDark = ["", "#3b2420", "#55352f", "#5c606c", "#6a6e7a"][strength];
  const outline = "M30 28 L54 20 L74 30 L82 52 L72 74 L48 82 L26 72 L18 48 Z";
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full">
      {strength <= 2 ? <Glow r={strength === 1 ? 50 : 42} color="orange" opacity={strength === 1 ? 0.75 : 0.45} /> : null}
      <path d={outline} fill={rock} stroke={rockDark} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="38" cy="40" r="7" fill={rockDark} />
      <circle cx="62" cy="62" r="9" fill={rockDark} />
      <circle cx="64" cy="38" r="4" fill={rockDark} />
      {strength === 3 ? <path d="M44 22 L50 44 L42 56 M50 44 L70 52" stroke="#2a2d36" strokeWidth="3" fill="none" strokeLinecap="round" /> : null}
      {strength === 2 ? (
        <g className="rc-flame">
          <path d="M44 22 L50 44 L42 56 L48 80 M50 44 L72 50 M42 56 L22 60" stroke="#f97316" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M44 22 L50 44 L42 56 L48 80 M50 44 L72 50 M42 56 L22 60" stroke="#fde68a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      ) : null}
      {strength === 1 ? (
        <g className="rc-flame">
          <path d="M42 18 L52 44 L38 58 L50 84 M52 44 L80 46 M38 58 L16 56" stroke="#fb923c" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 18 L52 44 L38 58 L50 84 M52 44 L80 46 M38 58 L16 56" stroke="#fde68a" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="47" cy="51" r="7" fill="#fff7d6" />
        </g>
      ) : null}
    </svg>
  );
}

/** A war junk, flat: clean at 4, smoke at 3, the sail on fire at 2, charred and ablaze at 1. */
function Junk({ strength }: { strength: number }) {
  const charred = strength === 1;
  const hull = charred ? "#3a2a20" : "#9a6436";
  const hullDark = charred ? "#1f1611" : "#5e3a1e";
  const sail = charred ? "#4b4642" : "#f4ead4";
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full">
      {strength <= 2 ? <Glow r={strength === 1 ? 48 : 38} color="orange" opacity={strength === 1 ? 0.7 : 0.4} /> : null}
      <path d="M12 60 L88 60 L78 78 Q50 84 22 78 Z" fill={hull} stroke={hullDark} strokeWidth="3" strokeLinejoin="round" />
      <path d="M50 60 V18" stroke={hullDark} strokeWidth="4" strokeLinecap="round" />
      {charred ? (
        <path d="M30 26 L66 26 L62 40 L52 36 L44 48 L36 42 Z" fill={sail} />
      ) : (
        <path d="M28 22 Q50 18 72 22 L68 56 Q50 59 32 56 Z" fill={sail} stroke="#b9a37c" strokeWidth="2" />
      )}
      {!charred ? <path d="M30 34 H70 M31 45 H69" stroke="#b9a37c" strokeWidth="2" /> : null}
      {strength === 4 ? <path d="M50 18 L64 13 L50 9 Z" fill="#c0392b" /> : null}
      {strength === 3 ? (
        <g className="rc-smoke" fill="#b6bec8">
          <circle cx="40" cy="16" r="9" opacity="0.85" />
          <circle cx="54" cy="10" r="11" opacity="0.7" />
          <circle cx="66" cy="18" r="7" opacity="0.75" />
        </g>
      ) : null}
      {strength === 2 ? (
        <g className="rc-flame">
          <path d="M34 56 Q30 40 40 32 Q40 42 46 44 Q46 32 54 24 Q58 38 62 42 Q66 34 64 28 Q74 42 66 56 Z" fill="#f97316" />
          <path d="M42 56 Q40 48 45 42 Q47 48 51 49 Q51 42 55 38 Q60 48 58 56 Z" fill="#fde68a" />
        </g>
      ) : null}
      {charred ? (
        <g className="rc-flame">
          <path d="M22 62 Q14 40 28 26 Q28 40 36 42 Q32 22 48 8 Q54 30 62 34 Q66 22 62 16 Q84 36 76 62 Z" fill="#ef4444" />
          <path d="M30 62 Q26 46 36 38 Q38 48 46 48 Q44 34 52 26 Q60 44 64 46 Q72 54 68 62 Z" fill="#f97316" />
          <path d="M40 62 Q38 52 44 48 Q46 54 50 54 Q50 48 54 44 Q60 54 58 62 Z" fill="#fde68a" />
        </g>
      ) : null}
    </svg>
  );
}

/** What flies, drawn pointing up; the caller rotates it to its direction. */
export function Projectile({ theme, direction }: { theme: ThemeId; direction: number }) {
  const rotate = [0, 180, -90, 90][direction];
  return (
    <svg viewBox="0 0 100 100" className="size-full" style={{ transform: `rotate(${rotate}deg)` }}>
      {theme === "lantern" ? (
        <>
          <circle cx="50" cy="86" r="3" fill="#fde68a" opacity="0.3" />
          <circle cx="50" cy="72" r="4.5" fill="#fde68a" opacity="0.45" />
          <circle cx="50" cy="56" r="6" fill="#fde68a" opacity="0.65" />
          <circle cx="50" cy="34" r="16" fill="#f59e0b" opacity="0.45" />
          <circle cx="50" cy="34" r="9" fill="#fde68a" />
          <circle cx="50" cy="34" r="4" fill="#fff" />
        </>
      ) : theme === "space" ? (
        <>
          <path d="M44 70 Q50 98 56 70 Z" fill="#fb923c" />
          <path d="M47 70 Q50 86 53 70 Z" fill="#fde68a" />
          <path d="M50 14 Q60 28 60 48 L60 70 L40 70 L40 48 Q40 28 50 14 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
          <circle cx="50" cy="42" r="5" fill="#38bdf8" />
          <path d="M40 58 L32 72 L40 70 Z M60 58 L68 72 L60 70 Z" fill="#ef4444" />
        </>
      ) : (
        <>
          <path d="M50 92 L50 50" stroke="#7a4a26" strokeWidth="7" strokeLinecap="round" />
          <path d="M50 70 L50 98" stroke="#fb923c" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
          <path d="M50 16 Q36 32 40 46 Q44 54 50 54 Q56 54 60 46 Q64 32 50 16 Z" fill="#f97316" />
          <path d="M50 28 Q43 38 45 46 Q47 50 50 50 Q53 50 55 46 Q57 38 50 28 Z" fill="#fde68a" />
        </>
      )}
    </svg>
  );
}

/** The burst when a target goes. */
export function Burst({ theme }: { theme: ThemeId }) {
  if (theme === "lantern") {
    const colors = ["#fde68a", "#f472b6", "#7dd3fc", "#fb923c"];
    return (
      <svg viewBox="0 0 100 100" className="size-full">
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x = 50 + Math.cos(angle) * 40;
          const y = 50 + Math.sin(angle) * 40;
          const color = colors[i % colors.length];
          return (
            <g key={i}>
              <line x1={50 + Math.cos(angle) * 12} y1={50 + Math.sin(angle) * 12} x2={x} y2={y} stroke={color} strokeWidth="3" strokeLinecap="round" />
              <circle cx={x} cy={y} r="4" fill={color} />
            </g>
          );
        })}
        <circle cx="50" cy="50" r="10" fill="#fff7d6" />
      </svg>
    );
  }
  if (theme === "space") {
    return (
      <svg viewBox="0 0 100 100" className="size-full">
        <circle cx="50" cy="50" r="26" fill="#fde68a" opacity="0.7" />
        {[
          "M50 8 L58 22 L46 24 Z",
          "M88 44 L76 54 L72 42 Z",
          "M70 88 L58 76 L70 70 Z",
          "M18 82 L26 68 L34 78 Z",
          "M10 38 L26 40 L20 52 Z",
        ].map((d, i) => (
          <path key={i} d={d} fill="#8d919e" stroke="#fb923c" strokeWidth="2" />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className="size-full">
      <circle cx="50" cy="50" r="34" fill="#fb923c" opacity="0.55" />
      <path d="M50 6 L58 34 L86 22 L66 46 L94 58 L64 62 L72 92 L50 70 L28 92 L36 62 L6 58 L34 46 L14 22 L42 34 Z" fill="#fde68a" opacity="0.9" />
    </svg>
  );
}

/** One unit of ammo for the meter. */
export function AmmoIcon({ theme, lit }: { theme: ThemeId; lit: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-4", !lit && "opacity-25 grayscale")}>
      {theme === "lantern" ? (
        <>
          <circle cx="12" cy="12" r="8" fill="#f59e0b" opacity="0.4" />
          <circle cx="12" cy="12" r="5" fill="#fde68a" />
        </>
      ) : theme === "space" ? (
        <>
          <path d="M12 2 Q16 6 16 11 L16 17 L8 17 L8 11 Q8 6 12 2 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
          <path d="M10 17 Q12 23 14 17 Z" fill="#fb923c" />
          <path d="M8 13 L5 18 L8 17 Z M16 13 L19 18 L16 17 Z" fill="#ef4444" />
        </>
      ) : (
        <>
          <path d="M12 22 L12 12" stroke="#7a4a26" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M12 2 Q7 7 8.5 11 Q10 13 12 13 Q14 13 15.5 11 Q17 7 12 2 Z" fill="#f97316" />
          <path d="M12 6 Q10 9 10.6 11 Q11.2 12 12 12 Q12.8 12 13.4 11 Q14 9 12 6 Z" fill="#fde68a" />
        </>
      )}
    </svg>
  );
}
