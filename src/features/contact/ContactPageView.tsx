import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ROUTES } from "@/constants/routes";
import { getTranslator } from "@/i18n/server";
import type { ContactConfig } from "./contact-config";
import { ContactForm } from "./components/ContactForm";
import { ContactHero } from "./components/ContactHero";
import { ContactMethods } from "./components/ContactMethods";
import { ContactTopics } from "./components/ContactTopics";

export async function ContactPageView({ config, providerConfigured }: { config: ContactConfig; providerConfigured: boolean }) {
  const { t } = await getTranslator();
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6 sm:py-12 lg:space-y-16">
        <Breadcrumb items={[{ label: t("common.home"), href: ROUTES.HOME }, { label: t("common.contact") }]} />
        <ContactHero />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <ContactMethods config={config} />
          <section aria-labelledby="contact-form-heading" className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-8">
            <h2 id="contact-form-heading" className="text-2xl font-semibold">{t("contact.sendMessage")}</h2>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t("contact.formDescription")}</p>
            {!providerConfigured ? <p role="note" className="mt-5 rounded-xl border border-border bg-background p-4 text-sm leading-6 text-foreground-secondary">{t("contact.notConfigured")}</p> : null}
            <div className="mt-6"><ContactForm /></div>
          </section>
        </div>
        <ContactTopics />
        <section aria-labelledby="contact-explore-heading" className="flex flex-col justify-between gap-5 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center">
          <div><h2 id="contact-explore-heading" className="text-xl font-semibold">{t("contact.exploreTitle")}</h2><p className="mt-2 text-sm text-foreground-secondary">{t("contact.exploreDescription")}</p></div>
          <div className="flex flex-col gap-3 sm:flex-row"><Link href={ROUTES.PROJECTS} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary">{t("common.projects")} <ArrowRight aria-hidden="true" className="size-4" /></Link><Link href={ROUTES.BLOG} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">{t("common.blog")}</Link></div>
        </section>
    </div>
  );
}
