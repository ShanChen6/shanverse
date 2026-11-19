// Pictures for the three themes: a target at each strength, the thing that
// flies, the burst when a target goes, and a small ammo icon. The painted art
// lives in public/games/red-cliffs/<theme>/; the game's rules list the states
// with these same pictures (StateLegend). Only the 16px ammo icon stays SVG.

import { preload } from "react-dom";

import { cn } from "@/lib/cn";

import type { ThemeId } from "./themes";

type PieceProps = { theme: ThemeId; strength: number };

const art = (theme: ThemeId, name: string) => `/games/red-cliffs/${theme}/${name}.webp`;

/* Plain <img> on purpose: small fixed sprites drawn dozens of times per board,
   already sized and compressed, so next/image would only add wrappers. */

/** A target at strength 4 (untouched) down to 1 (goes off on the next hit); empty water shows the board. */
export function Piece({ theme, strength }: PieceProps) {
  if (strength <= 0) return null;
  return (
    <img
      src={art(theme, `target-${Math.min(strength, 4)}`)}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="size-full select-none object-contain"
    />
  );
}

/** What flies, drawn pointing up; rotated to its direction. */
export function Projectile({ theme, direction }: { theme: ThemeId; direction: number }) {
  const rotate = [0, 180, -90, 90][direction];
  return (
    <img
      src={art(theme, "projectile")}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="size-full select-none object-contain"
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  );
}

/** Fetch a theme's art ahead of time, so a projectile or burst never pops in blank mid-animation. */
export function preloadThemeArt(theme: ThemeId) {
  for (const name of ["target-4", "target-3", "target-2", "target-1", "projectile", "burst", "board", "backdrop"]) {
    preload(art(theme, name), { as: "image", fetchPriority: name === "backdrop" ? "low" : "auto" });
  }
}

/** The burst when a target goes. */
export function Burst({ theme }: { theme: ThemeId }) {
  return <img src={art(theme, "burst")} alt="" aria-hidden="true" draggable={false} className="size-full select-none object-contain" />;
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
