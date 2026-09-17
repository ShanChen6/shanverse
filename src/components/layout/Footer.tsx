"use client";

import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { AtSign } from "lucide-react";

import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/common/icons/BrandIcons";
import { SITE_CONFIG } from "@/config/site.config";
import {
  FOOTER_EXPLORE_ITEMS,
  NAVIGATION_ITEMS,
} from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { BrandLogo } from "./BrandLogo";
import { useI18n } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";
import { useRuntimeConfig } from "@/providers/RuntimeConfigProvider";

const socialIcons = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  Email: AtSign,
};

const footerLinkClass =
  "rounded-sm text-sm text-foreground-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary";

export function Footer() {
  const { locale, t } = useI18n();
  const { socialLinks, currentYear } = useRuntimeConfig();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <BrandLogo />
            <p className="max-w-xs text-sm leading-relaxed text-foreground-secondary">
              {SITE_CONFIG.description}
            </p>
          </div>

          <div className="hidden md:block">
            <h2 className="mb-4 text-sm font-semibold text-foreground">{t("footer.navigation")}</h2>
            <nav aria-label={t("footer.navigation")} className="flex flex-col items-start gap-3">
              {NAVIGATION_ITEMS.map((item) => (
                <Link key={item.href} href={localizeHref(item.href, locale)} className={footerLinkClass}>
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:block">
            <h2 className="mb-4 text-sm font-semibold text-foreground">{t("footer.explore")}</h2>
            <nav aria-label={t("footer.explore")} className="flex flex-col items-start gap-3">
              {FOOTER_EXPLORE_ITEMS.map((item) => (
                <Link key={item.href} href={localizeHref(item.href, locale)} className={footerLinkClass}>
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">{t("footer.connect")}</h2>
            {socialLinks.length ? (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ label, href }) => {
                  const Icon = socialIcons[label];
                  const external = !href.startsWith("mailto:");
                  return (
                    <a
                      key={label}
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      aria-label={label}
                      className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <Link href={localizeHref(ROUTES.CONTACT, locale)} className={footerLinkClass}>{t("common.contact")}</Link>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} {SITE_CONFIG.name}. {t("footer.rights")}</p>
          <p>{t("footer.builtWith")}</p>
        </div>
      </div>
    </footer>
  );
}
