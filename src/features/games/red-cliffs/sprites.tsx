// Ships, torches and blasts for Hỏa thiêu Xích Bích, drawn as plain SVG so
// both the game and its card preview can use them.

import { cn } from "@/lib/cn";

/** A war junk drawn in four states: safe, smoking, burning, burnt out. Open water shows ripples. */
export function Ship({ strength }: { strength: number }) {
  if (strength === 0) {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full opacity-40">
        <ellipse cx="50" cy="62" rx="24" ry="6" fill="none" stroke="#7fb8cc" strokeWidth="2.5" />
        <ellipse cx="50" cy="62" rx="12" ry="3" fill="none" stroke="#7fb8cc" strokeWidth="2" />
      </svg>
    );
  }
  const charred = strength === 1;
  const hull = charred ? "#3a2a20" : "#8a5a32";
  const hullDark = charred ? "#1f1611" : "#5e3a1e";
  const sail = charred ? "#5b5650" : strength === 2 ? "#f0d9b0" : "#f4ead4";
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="size-full drop-shadow-[0_3px_3px_rgba(0,0,0,0.35)]">
      <ellipse cx="50" cy="80" rx="34" ry="6" fill="#0b2a3b" opacity="0.45" />
      {/* hull */}
      <path d="M14 62 L86 62 L76 78 Q50 84 24 78 Z" fill={hull} stroke={hullDark} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 68 H80" stroke={hullDark} strokeWidth="2" opacity="0.7" />
      {/* masts and sails */}
      <path d="M38 62 V24 M62 62 V30" stroke={hullDark} strokeWidth="3" strokeLinecap="round" />
      {charred ? (
        <>
          <path d="M28 30 L46 30 L44 44 L36 40 L30 48 Z" fill={sail} stroke="#2a2420" strokeWidth="1.5" />
          <path d="M54 36 L70 36 L68 46 L60 44 Z" fill={sail} stroke="#2a2420" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <path d="M26 26 Q38 24 48 26 L46 56 Q36 58 28 56 Z" fill={sail} stroke="#b9a37c" strokeWidth="1.5" />
          <path d="M28 36 H46 M28 46 H46" stroke="#b9a37c" strokeWidth="1.2" />
          <path d="M52 32 Q62 30 72 32 L70 56 Q62 58 54 56 Z" fill={sail} stroke="#b9a37c" strokeWidth="1.5" />
          <path d="M53 42 H71" stroke="#b9a37c" strokeWidth="1.2" />
          <path d="M38 24 L48 19 L38 17 Z" fill="#c0392b" />
        </>
      )}
      {strength === 3 ? (
        <g className="rc-smoke" fill="#aeb6bf">
          <circle cx="46" cy="22" r="7" opacity="0.8" />
          <circle cx="56" cy="14" r="9" opacity="0.65" />
          <circle cx="66" cy="20" r="6" opacity="0.7" />
        </g>
      ) : null}
      {strength === 2 ? (
        <g className="rc-flame">
          <path d="M40 58 Q34 44 42 34 Q42 44 48 46 Q46 36 54 28 Q56 40 62 44 Q66 38 64 32 Q74 44 66 58 Z" fill="#f97316" />
          <path d="M46 58 Q42 50 47 44 Q48 50 52 51 Q52 44 56 40 Q60 50 58 58 Z" fill="#fcd34d" />
        </g>
      ) : null}
      {charred ? (
        <g className="rc-flame">
          <circle cx="50" cy="44" r="30" fill="#ff7a1a" opacity="0.28" />
          <path d="M28 62 Q20 40 32 28 Q32 42 40 44 Q36 26 50 12 Q54 32 62 36 Q66 26 62 20 Q80 38 72 62 Z" fill="#ef4444" />
          <path d="M34 62 Q30 46 40 38 Q42 48 48 48 Q46 36 54 28 Q60 44 64 46 Q70 54 66 62 Z" fill="#f97316" />
          <path d="M42 62 Q40 52 46 48 Q48 54 52 54 Q52 48 56 44 Q60 54 58 62 Z" fill="#fde68a" />
        </g>
      ) : null}
    </svg>
  );
}

/** A torch in flight, pointing the way it flies. */
export function FlyingTorch({ direction }: { direction: number }) {
  const rotate = [0, 180, -90, 90][direction];
  return (
    <svg viewBox="0 0 100 100" className="size-full" style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M50 92 L50 50" stroke="#7a4a26" strokeWidth="7" strokeLinecap="round" />
      <path d="M50 70 L50 96" stroke="#fb923c" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <path d="M50 18 Q36 34 40 48 Q44 56 50 56 Q56 56 60 48 Q64 34 50 18 Z" fill="#f97316" />
      <path d="M50 30 Q43 40 45 48 Q47 52 50 52 Q53 52 55 48 Q57 40 50 30 Z" fill="#fde68a" />
    </svg>
  );
}

export function Blast() {
  return (
    <svg viewBox="0 0 100 100" className="size-full">
      <circle cx="50" cy="50" r="34" fill="#fb923c" opacity="0.55" />
      <path d="M50 6 L58 34 L86 22 L66 46 L94 58 L64 62 L72 92 L50 70 L28 92 L36 62 L6 58 L34 46 L14 22 L42 34 Z" fill="#fde68a" opacity="0.9" />
    </svg>
  );
}

export function TorchIcon({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-4", !lit && "opacity-25 grayscale")}>
      <path d="M12 22 L12 12" stroke="#7a4a26" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 2 Q7 7 8.5 11 Q10 13 12 13 Q14 13 15.5 11 Q17 7 12 2 Z" fill="#f97316" />
      <path d="M12 6 Q10 9 10.6 11 Q11.2 12 12 12 Q12.8 12 13.4 11 Q14 9 12 6 Z" fill="#fde68a" />
    </svg>
  );
}
