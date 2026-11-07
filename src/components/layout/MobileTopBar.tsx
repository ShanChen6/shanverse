"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { isGamePlayRoute } from "@/constants/navigation";

/** Mobile top bar (logo, language, theme). Hidden on game pages, which have their own compact bar. */
export function MobileTopBar({ children }: { children: React.ReactNode }) {
  if (isGamePlayRoute(usePathname())) return null;
  return <header className="border-b border-border bg-background md:hidden">{children}</header>;
}
