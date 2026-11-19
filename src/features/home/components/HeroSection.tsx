"use client";

import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ArrowRight } from "lucide-react";

import { SocialIcon } from "@/components/common/icons/SocialIcon";
import { Button } from "@/components/ui/button";
import type { SocialLink } from "@/constants/social";
import { useI18n } from "@/i18n/client";
import { HOME_HERO } from "../home.data";
import { useTypewriter } from "../hooks/useTypewriter";

export function HeroSection({ socialLinks }: { socialLinks: SocialLink[] }) {
  const { t } = useI18n();
  const roles = React.useMemo(
    () => [t("home.heroRoleOne"), t("home.heroRoleTwo"), t("home.heroRoleThree")],
    [t],
  );
  const rolePrefix = t("home.heroRolePrefix");
  const { text, prefersReducedMotion } = useTypewriter({ words: roles });
  const longestPhrase = roles.reduce(
    (longest, phrase) => (phrase.length > longest.length ? phrase : longest),
    "",
  );
  const visibleSocials = socialLinks.filter((link) => link.label !== "Email");

  return (
    <div className="min-w-0 space-y-6 lg:col-span-7">
      <p className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
        <span aria-hidden="true" className="size-2 rounded-full bg-success" />
        {t("home.heroBadge")}
      </p>

      <div className="space-y-3">
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {t("home.heroGreeting")}{" "}
          <span className="brand-gradient-text">{HOME_HERO.name}</span>
        </h1>

        <p className="sr-only">
          {rolePrefix} {roles.join(", ")}
        </p>
        <div
          aria-hidden="true"
          className="min-h-9 overflow-hidden text-xl font-semibold text-foreground-secondary sm:min-h-10 sm:text-2xl"
        >
          <span>{rolePrefix} </span>
          <span className="relative inline-grid max-w-full text-primary">
            <span className="invisible col-start-1 row-start-1 whitespace-nowrap">
              {longestPhrase}
            </span>
            <span className="col-start-1 row-start-1 whitespace-nowrap">
              {prefersReducedMotion ? roles[0] : text}
              {!prefersReducedMotion ? (
                <span className="ml-0.5 border-r-2 border-primary" />
              ) : null}
            </span>
          </span>
        </div>
      </div>

      <p className="max-w-2xl text-pretty text-base leading-7 text-foreground-secondary sm:text-lg sm:leading-8">
        {t("home.heroDescription")}
      </p>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
          <Link href={HOME_HERO.primaryCta.href}>
            {t("home.heroAboutCta")}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="brand-gradient-border w-full sm:w-auto"
        >
          <Link href={HOME_HERO.secondaryCta.href}>
            {t("home.heroContactCta")}
          </Link>
        </Button>
      </div>

      {visibleSocials.length ? (
        <nav
          aria-label={t("home.heroSocialLabel")}
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          {visibleSocials.map(({ label, href }) => {
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex size-10 items-center justify-center rounded-lg text-foreground-secondary hover:bg-surface hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
              >
                <SocialIcon label={label} className="size-5" />
              </a>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
