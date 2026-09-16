"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActiveRoute, NAVIGATION_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/cn";

export function MobileBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
    >
      <div className="grid h-(--mobile-bottom-nav-height) grid-cols-5 px-1">
        {NAVIGATION_ITEMS.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden px-0.5 text-[10px] font-medium whitespace-nowrap text-muted transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary min-[375px]:text-[11px]",
                active &&
                  "font-semibold text-primary after:absolute after:inset-x-4 after:top-0 after:h-0.5 after:rounded-b-full after:bg-primary",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex min-h-7 min-w-12 items-center justify-center rounded-full",
                  active && "bg-primary/10",
                )}
              >
                <Icon className="size-5.5" strokeWidth={active ? 2.25 : 1.8} />
              </span>
              <span className="max-w-full truncate leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div aria-hidden="true" className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
