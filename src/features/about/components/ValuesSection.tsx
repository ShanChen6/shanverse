import * as React from "react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { getTranslator } from "@/i18n/server";
import { productPrinciples, values } from "../data/about.data";

/** What I care about, then how it shows up in the work: two plain four-column lists. */
export async function ValuesSection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="values-heading" className="space-y-10">
      <div className="space-y-5">
        <SectionHeader titleId="values-heading" title={t("about.valuesTitle")} description={t("about.valuesDescription")} />
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((key) => (
            <li key={key} className="border-t border-border pt-4">
              <h3 className="font-semibold">{t(`about.values.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t(`about.values.${key}.description`)}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-5">
        <SectionHeader titleId="approach-heading" title={t("about.approachTitle")} description={t("about.approachDescription")} />
        <ul aria-labelledby="approach-heading" className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {productPrinciples.map((key) => (
            <li key={key} className="border-t border-border pt-4">
              <h3 className="font-semibold">{t(`about.principles.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">{t(`about.principles.${key}.description`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
