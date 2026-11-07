import * as React from "react";

import { cn } from "@/lib/cn";

export type GameStat = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  /** Draw attention to the main number (usually the score). */
  highlight?: boolean;
  /** Extra overlay, e.g. a floating "+8" next to the score. */
  extra?: React.ReactNode;
};

/** Row of score boxes shared by every game: label on top, big number below. */
export function GameStatBar({ stats, className }: { stats: GameStat[]; className?: string }) {
  return (
    <div className={cn("flex items-stretch gap-2 sm:gap-3", className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "relative min-w-[4.25rem] flex-1 rounded-xl border bg-surface px-2 py-1.5 text-center sm:min-w-20 sm:flex-none sm:px-3",
            stat.highlight ? "border-primary/40" : "border-border",
          )}
        >
          <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {stat.icon}
            {stat.label}
          </p>
          <p className={cn("text-lg font-extrabold tabular-nums", stat.highlight && "text-primary")}>{stat.value}</p>
          {stat.extra}
        </div>
      ))}
    </div>
  );
}
