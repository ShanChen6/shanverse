import * as React from "react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { getTranslator } from "@/i18n/server";
import { journey } from "../data/about.data";

export async function JourneySection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="journey-heading" className="space-y-5">
      <SectionHeader titleId="journey-heading" title={t("about.journeyTitle")} />
      <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {journey.map((item, index) => (
          <li key={item.key} className="border-t border-border pt-4">
            <h3 className="font-semibold">{t(`about.journey.${item.key}.title`)}</h3>
            {item.hasOrganization ? <p className="mt-1 text-sm font-medium text-primary">{t("about.journey.university.organization")}</p> : null}
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t(`about.journey.${item.key}.description`)}</p>
            <span className="sr-only">{index + 1}/{journey.length}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
