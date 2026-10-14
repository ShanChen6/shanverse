"use client";

import * as React from "react";
import { FastForward, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { ELEMENT_COLOR, Token } from "./art";
import { MonsterInfo } from "./MonsterInfo";
import { monster, type Element } from "./monsters";

/** The bright colour of each element's light when an urn bursts open. */
const GLOW: Record<Element, string> = { kim: "#ffe9a8", moc: "#7dffb0", thuy: "#7fc8ff", hoa: "#ff9a5c", tho: "#ffd166" };

function canUse3d(): boolean {
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type Stage = "loading" | "playing" | "revealed";

/**
 * Thỉnh quân: a full-screen moment for a newly summoned monster. With WebGL
 * (and motion allowed) a three.js urn bursts open; otherwise, or if three.js
 * fails to load, the monster's card simply appears. Escape or "Skip" jumps to
 * the card.
 */
export function SummonCeremony({ monsterId, onClose }: { monsterId: string; onClose: () => void }) {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  const m = monster(monsterId);
  const stage3d = React.useRef<HTMLDivElement>(null);
  const dialog = React.useRef<HTMLDivElement>(null);
  const [stage, setStage] = React.useState<Stage>("loading");

  React.useEffect(() => {
    if (!canUse3d() || !stage3d.current) {
      setStage("revealed");
      return;
    }
    let stop: (() => void) | null = null;
    let cancelled = false;
    import("./summon-three")
      .then(({ playSummon }) => {
        if (cancelled || !stage3d.current) return;
        setStage("playing");
        stop = playSummon(stage3d.current, {
          glow: GLOW[m.element],
          onOpen: () => undefined,
          onDone: () => setStage("revealed"),
        });
      })
      .catch(() => setStage("revealed"));
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [m.element]);

  // Keep focus on the one button that matters: Skip while playing, Close on the card.
  React.useEffect(() => {
    dialog.current?.querySelector<HTMLButtonElement>("[data-focus]")?.focus();
  }, [stage]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (stage === "revealed") onClose();
      else setStage("revealed");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, onClose]);

  const color = ELEMENT_COLOR[m.element];
  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={t("games.blkSummonTitle")}
      className="blk-ceremony fixed inset-0 z-50 grid place-items-center p-4"
      style={{ ["--blk-glow" as string]: GLOW[m.element], ["--blk-base" as string]: color.base }}
    >
      <div ref={stage3d} aria-hidden="true" className={stage === "revealed" ? "hidden" : "absolute inset-0"} />
      {stage !== "revealed" ? (
        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
          <p className="text-lg font-bold tracking-wide text-white drop-shadow">{t("games.blkSummonTitle")}</p>
          <button
            data-focus=""
            type="button"
            onClick={() => setStage("revealed")}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-3 py-1 text-sm font-semibold text-white/90 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
          >
            <FastForward aria-hidden="true" className="size-4" /> {t("games.blkSummonSkip")}
          </button>
        </div>
      ) : (
        <div className="blk-summon-card relative w-full max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-5 text-left shadow-2xl">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles aria-hidden="true" className="size-4" /> {t("games.blkSummonNew")}
            </span>
            <span className="blk-summon-token">
              <Token monsterId={monsterId} level={m.level} side={0} className="size-28" title={m.name[lang]} />
            </span>
          </div>
          <MonsterInfo monsterId={monsterId} showToken={false} />
          <div className="flex justify-center">
            <Button data-focus="" type="button" onClick={onClose}>
              {t("games.blkClose")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
