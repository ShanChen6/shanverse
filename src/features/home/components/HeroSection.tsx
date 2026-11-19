import * as React from "react";
import { ArrowRight } from "lucide-react";

import { SocialIcon } from "@/components/common/icons/SocialIcon";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { Tianwu } from "@/components/mascot/Tianwu";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { SocialLink } from "@/constants/social";
import { getTranslator } from "@/i18n/server";

/** Compact home intro: who I am in two lines, two links, and Tianwu on the right. */
export async function HeroSection({ socialLinks }: { socialLinks: SocialLink[] }) {
  const { t } = await getTranslator();
  const visibleSocials = socialLinks.filter((link) => link.label !== "Email");

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
      <div className="min-w-0 max-w-2xl space-y-5">
        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {t("home.heroTitle")}
        </h1>
        <p className="text-pretty text-base leading-7 text-foreground-secondary sm:text-lg sm:leading-8">
          {t("home.heroIntro")}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button asChild size="lg" className="gap-2">
            <Link href={ROUTES.PROJECTS}>
              {t("home.heroProjectsCta")}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={ROUTES.ABOUT}>{t("home.heroAboutCta")}</Link>
          </Button>
          {visibleSocials.length ? (
            <nav aria-label={t("home.heroSocialLabel")} className="flex items-center gap-1 sm:ml-2">
              {visibleSocials.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-10 items-center justify-center rounded-control text-foreground-secondary hover:bg-surface hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <SocialIcon label={label} className="size-5" />
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>

      <Tianwu pose="wave" title={t("home.heroMascotAlt")} className="mx-auto hidden w-48 md:block lg:w-60" />
    </div>
  );
}
