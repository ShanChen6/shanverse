import * as React from "react";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ArrowRight, Mail, Sparkles } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { getTranslator } from "@/i18n/server";

export async function AboutHeroSection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="about-title" className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-10 lg:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-primary/15" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1.5 text-xs font-semibold text-primary"><Sparkles aria-hidden="true" className="size-4" /> {t("about.heroEyebrow")}</p>
          <h1 id="about-title" className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("about.heroTitle")}</h1>
          <p className="max-w-3xl text-pretty text-lg leading-8 text-foreground-secondary">{t("about.heroDescription")}</p>
          <p className="text-sm font-medium text-primary">{t("about.heroTagline")}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={ROUTES.PROJECTS} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">{t("common.viewProjects")} <ArrowRight aria-hidden="true" className="size-4" /></Link>
            <Link href={ROUTES.CONTACT} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"><Mail aria-hidden="true" className="size-4" /> {t("common.contactMe")}</Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-64">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-primary/20 bg-background p-6 shadow-sm">
            <Image src="/logo/logo_shanverse.png" alt={t("about.logoAlt")} fill priority sizes="256px" className="object-contain p-6" />
          </div>
        </div>
      </div>
    </section>
  );
}
