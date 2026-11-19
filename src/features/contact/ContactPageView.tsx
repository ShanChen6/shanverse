import * as React from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ROUTES } from "@/constants/routes";
import { getTranslator } from "@/i18n/server";
import type { ContactConfig } from "./contact-config";
import { ContactForm } from "./components/ContactForm";
import { ContactMethods } from "./components/ContactMethods";
import { ContactTopics } from "./components/ContactTopics";

export async function ContactPageView({ config, providerConfigured }: { config: ContactConfig; providerConfigured: boolean }) {
  const { t } = await getTranslator();
  return (
    <PageContainer rhythm="loose">
        <Breadcrumb items={[{ label: t("common.home"), href: ROUTES.HOME }, { label: t("common.contact") }]} />
        <PageHeader title={t("contact.heroTitle")} description={t("contact.heroDescription")} />
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section aria-labelledby="contact-form-heading" className="rounded-card border border-border bg-surface shadow-card p-5 sm:p-8">
            <h2 id="contact-form-heading" className="text-2xl font-semibold">{t("contact.sendMessage")}</h2>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t("contact.formDescription")}</p>
            {!providerConfigured ? <p role="note" className="mt-5 rounded-xl border border-border bg-background p-4 text-sm leading-6 text-foreground-secondary">{t("contact.notConfigured")}</p> : null}
            <div className="mt-6"><ContactForm /></div>
          </section>
          <ContactMethods config={config} />
        </div>
        <ContactTopics />
    </PageContainer>
  );
}
