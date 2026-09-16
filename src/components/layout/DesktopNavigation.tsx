"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActiveRoute, NAVIGATION_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/cn";

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
      {NAVIGATION_ITEMS.map((item) => {
        const active = isActiveRoute(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-lg px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary",
              active &&
                "bg-surface text-foreground after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary",
              item.href === "/contact" && "ml-1 border border-primary/30 text-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
