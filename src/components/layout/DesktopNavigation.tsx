"use client";

import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { usePathname } from "next/navigation";

import { isActiveRoute, NAVIGATION_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

export function DesktopNavigation() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav aria-label={t("navigation.primary")} className="hidden items-center gap-1 md:flex">
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
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
