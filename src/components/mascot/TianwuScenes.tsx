"use client";

import * as React from "react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";

import { Tianwu, TianwuShip } from "./Tianwu";

// Small scenes built from the Tianwu drawings. Motion lives in
// src/styles/mascot.css and stops under prefers-reduced-motion.

const STARS: Array<[number, number, number]> = [
  [8, 18, 2], [22, 70, 1.5], [35, 12, 1], [48, 82, 2], [62, 24, 1.5],
  [74, 64, 1], [86, 14, 2], [92, 78, 1.5], [15, 45, 1], [80, 40, 1],
];

function Starfield({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      {STARS.map(([left, top, size], index) => (
        <span
          key={index}
          className="tw-twinkle absolute rounded-full bg-[#F0C27B]"
          style={{ left: `${left}%`, top: `${top}%`, width: size * 2, height: size * 2, animationDelay: `${(index % 5) * 0.6}s` }}
        />
      ))}
    </div>
  );
}

/** Loading banner: Tianwu's ship glides slowly across a strip of night sky. */
export function TianwuLoader({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div aria-hidden="true" className={cn("space-y-2", className)}>
      <div className="tw-sky relative h-20 overflow-hidden rounded-2xl border border-border sm:h-24">
        <Starfield />
        <div className="tw-trail absolute inset-x-0 top-1/2 border-t-2 border-dashed border-[#D9AF62]/35" />
        <div className="tw-glide absolute inset-0">
          <div className="tw-bob absolute top-1/2 left-0 w-24 -translate-y-1/2 sm:w-28">
            <TianwuShip className="h-auto w-full" />
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-foreground-secondary">{t("mascot.loading")}</p>
    </div>
  );
}

/** 404 art: Tianwu drifting in space, safety line come loose. */
export function TianwuLost({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn("tw-sky relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-3xl border border-border", className)}>
      <Starfield />
      <svg aria-hidden="true" viewBox="0 0 400 300" className="absolute inset-0 size-full">
        <circle cx="330" cy="62" r="34" fill="#D9AF62" opacity="0.9" />
        <ellipse cx="330" cy="62" rx="56" ry="11" fill="none" stroke="#F0C27B" strokeWidth="3" opacity="0.7" transform="rotate(-18 330 62)" />
        <circle cx="52" cy="250" r="20" fill="#2E55A8" opacity="0.8" />
        <path d="M30 40 Q120 110 150 170" fill="none" stroke="#9AA3B5" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" opacity="0.8" />
      </svg>
      <div className="tw-drift absolute left-1/2 top-[18%] w-[46%]">
        <Tianwu pose="wave" className="h-auto w-full" title={t("mascot.lostArt")} />
      </div>
    </div>
  );
}
