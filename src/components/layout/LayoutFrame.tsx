"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { isGamePlayRoute } from "@/constants/navigation";
import { cn } from "@/lib/cn";

/** Page frame. Reserves room for the mobile bottom bar, except on game pages where that bar is hidden. */
export function LayoutFrame({ children }: { children: React.ReactNode }) {
  const inGame = isGamePlayRoute(usePathname());
  return (
    <div
      className={cn(
        "flex min-h-screen w-full flex-col overflow-x-clip bg-background text-foreground md:pb-0",
        !inGame && "pb-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom))]",
      )}
    >
      {children}
    </div>
  );
}
