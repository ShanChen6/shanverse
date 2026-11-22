"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { isActiveRoute, isGamePlayRoute, NAVIGATION_ITEMS } from "@/constants/navigation";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";

/** Flat bottom tab bar for phones: five tabs, the active one in the primary colour with a short bar on top. */
export function MobileBottomNavigation() {
  const pathname = usePathname();
  const { t } = useI18n();

  if (isGamePlayRoute(pathname)) return null;

  return (
    <nav
      aria-label={t("navigation.mobile")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-elevated/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex h-[var(--mobile-bottom-nav-height)] max-w-lg">
        {NAVIGATION_ITEMS.map((item) => {
          const active = isActiveRoute(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                  active ? "text-primary" : "text-muted hover:text-foreground",
                )}
              >
                {active ? <span aria-hidden="true" className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary" /> : null}
                <Icon aria-hidden="true" className="size-6" strokeWidth={active ? 2.2 : 1.9} />
                <span className="max-w-full truncate px-1">{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
