"use client";

import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";

import { SocialIcon } from "@/components/common/icons/SocialIcon";
import { SITE_CONFIG } from "@/config/site.config";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { BrandLogo } from "./BrandLogo";
import { useI18n } from "@/i18n/client";
import { useRuntimeConfig } from "@/providers/RuntimeConfigProvider";

const footerLinkClass =
  "rounded-sm text-sm text-foreground-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary";

export function Footer() {
  const { t } = useI18n();
  const { socialLinks, currentYear } = useRuntimeConfig();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-page px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.5fr]">
          <div className="space-y-4">
            <BrandLogo large />
            <p className="max-w-xs text-sm leading-relaxed text-foreground-secondary">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="hidden md:block">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              {t("footer.navigation")}
            </h2>
            <nav
              aria-label={t("footer.navigation")}
              className="flex flex-col items-start gap-3"
            >
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={footerLinkClass}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              {t("footer.connect")}
            </h2>
            <p className="text-sm leading-relaxed text-foreground-secondary">
              {t("footer.contactLine")}{" "}
              <Link href={ROUTES.CONTACT} className="font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary">
                {t("common.contact")}
              </Link>
            </p>
            {socialLinks.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {socialLinks.map(({ label, href }) => {
                  const external = !href.startsWith("mailto:");
                  return (
                    <a
                      key={label}
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      aria-label={label}
                      className="inline-flex size-10 items-center justify-center rounded-control border border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <SocialIcon label={label} className="size-4" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} {SITE_CONFIG.name}. {t("footer.rights")}
          </p>
          <p>{t("footer.builtWith")}</p>
        </div>
      </div>
    </footer>
  );
}
