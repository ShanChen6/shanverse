import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ArrowRight } from "lucide-react";

import { SocialIcon } from "@/components/common/icons/SocialIcon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { SocialLink } from "@/constants/social";
import { getTranslator } from "@/i18n/server";

export async function ContactSection({ socialLinks }: { socialLinks: SocialLink[] }) {
  const { t } = await getTranslator();
  return (
    <section
      aria-labelledby="home-contact-heading"
      className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 lg:p-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border border-primary/10"
      />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t("home.contactEyebrow")}
          </p>
          <h2
            id="home-contact-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {t("projects.ctaTitle")}
          </h2>
          <p className="mt-4 text-pretty leading-7 text-foreground-secondary">
            {t("about.ctaDescription")}
          </p>

          {socialLinks.length ? (
            <nav
              className="mt-6 flex flex-wrap gap-2"
              aria-label={t("contact.methodsEyebrow")}
            >
              {socialLinks.map(({ label, href }) => {
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
                    <SocialIcon label={label} className="size-4" />
                  </a>
                );
              })}
            </nav>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
          <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
            <Link href={ROUTES.CONTACT}>
              {t("common.contactMe")}{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full bg-background sm:w-auto"
          >
            <Link href={ROUTES.PROJECTS}>{t("common.viewProjects")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
