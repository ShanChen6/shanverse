"use client";

import * as React from "react";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";

import { SITE_CONFIG } from "@/config/site.config";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";

export function BrandLogo({
  compact = false,
  priority = false,
  className,
}: {
  compact?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const { locale, t } = useI18n();
  return (
    <Link
      href={localizeHref(ROUTES.HOME, locale)}
      aria-label={`${SITE_CONFIG.name} ${t("common.home")}`}
      className={cn(
        "inline-flex min-h-10 items-center gap-2.5 rounded-lg text-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      <Image
        src={SITE_CONFIG.logo}
        alt=""
        width={36}
        height={36}
        sizes="36px"
        className="size-9 shrink-0 rounded-full object-cover"
        priority={priority}
      />
      {!compact ? (
        <span className="text-lg font-bold tracking-tight">{SITE_CONFIG.name}</span>
      ) : null}
    </Link>
  );
}
