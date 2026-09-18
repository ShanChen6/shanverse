"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { locales, localizeHref } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const [isPending, startTransition] = React.useTransition();
  const suffix = searchParams.size ? `?${searchParams.toString()}` : "";

  function switchLocale(nextLocale: (typeof locales)[number]) {
    if (nextLocale === locale || isPending) return;
    const target = localizeHref(`${pathname}${suffix}`, nextLocale);
    startTransition(() => router.replace(target, { scroll: false }));
  }

  return (
    <div role="group" aria-label={t("navigation.language")} className="flex items-center rounded-lg border border-border bg-surface p-0.5">
      {locales.map((nextLocale) => (
        <button
          type="button"
          key={nextLocale}
          lang={nextLocale}
          aria-pressed={locale === nextLocale}
          aria-label={`${t("navigation.language")}: ${nextLocale.toUpperCase()}`}
          disabled={isPending}
          onClick={() => switchLocale(nextLocale)}
          className={cn(
            "flex min-h-9 min-w-10 items-center justify-center rounded-md px-2 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait disabled:opacity-70",
            locale === nextLocale
              ? "bg-primary text-white"
              : "text-foreground-secondary hover:bg-background hover:text-foreground",
            compact && "min-h-8 min-w-9 px-1.5",
          )}
        >
          {nextLocale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
