"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { locales, localizeHref } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const suffix = searchParams.size ? `?${searchParams.toString()}` : "";

  return (
    <nav aria-label={t("navigation.language")} className="flex items-center rounded-lg border border-border bg-surface p-0.5">
      {locales.map((nextLocale) => (
        <Link
          key={nextLocale}
          href={localizeHref(`${pathname}${suffix}`, nextLocale)}
          hrefLang={nextLocale}
          lang={nextLocale}
          aria-current={locale === nextLocale ? "true" : undefined}
          aria-label={`${t("navigation.language")}: ${nextLocale.toUpperCase()}`}
          className={cn(
            "flex min-h-9 min-w-10 items-center justify-center rounded-md px-2 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary",
            locale === nextLocale
              ? "bg-primary text-white"
              : "text-foreground-secondary hover:bg-background hover:text-foreground",
            compact && "min-h-8 min-w-9 px-1.5",
          )}
        >
          {nextLocale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
