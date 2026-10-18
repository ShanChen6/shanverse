"use client";

import * as React from "react";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";

import { SITE_CONFIG } from "@/config/site.config";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

export function BrandLogo({
  compact = false,
  priority = false,
  large = false,
  className,
}: {
  compact?: boolean;
  priority?: boolean;
  large?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <Link
      href={ROUTES.HOME}
      aria-label={`${SITE_CONFIG.name} ${t("common.home")}`}
      className={cn(
        "inline-flex min-h-10 items-center gap-2.5 rounded-lg text-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      {compact ? (
        <Image
          src={SITE_CONFIG.logo}
          alt=""
          width={36}
          height={36}
          sizes="36px"
          className="size-9 shrink-0 object-contain"
          priority={priority}
        />
      ) : (
        <Image
          src={SITE_CONFIG.logoHorizontal}
          alt=""
          width={720}
          height={283}
          sizes="(min-width: 768px) 160px, 128px"
          className={cn("w-auto shrink-0", large ? "h-14" : "h-10")}
          priority={priority}
        />
      )}
    </Link>
  );
}
