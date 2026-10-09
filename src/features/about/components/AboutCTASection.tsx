import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ArrowRight, Mail } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { getTranslator } from "@/i18n/server";

export async function AboutCTASection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="about-cta-heading" className="rounded-3xl border border-primary/20 bg-surface px-6 py-10 text-center sm:px-10 sm:py-14">
      <h2 id="about-cta-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">{t("about.ctaTitle")}</h2>
      <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-foreground-secondary">{t("about.ctaDescription")}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href={ROUTES.CONTACT} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"><Mail aria-hidden="true" className="size-4" /> {t("common.contactMe")}</Link>
        <Link href={ROUTES.PROJECTS} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">{t("about.ctaProjects")} <ArrowRight aria-hidden="true" className="size-4" /></Link>
      </div>
      <Link href={ROUTES.BLOG} className="mt-6 inline-flex rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary">{t("about.ctaBlog")}</Link>
    </section>
  );
}
