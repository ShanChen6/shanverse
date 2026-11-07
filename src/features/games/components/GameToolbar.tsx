import * as React from "react";

import { cn } from "@/lib/cn";

/** Action buttons of a game (undo, restart, pause...), laid out the same way in every game. */
export function GameToolbar({ label, className, children }: { label?: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="toolbar" aria-label={label} className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}
