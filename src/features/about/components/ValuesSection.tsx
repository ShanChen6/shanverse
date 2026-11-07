import * as React from "react";
import { getTranslator } from "@/i18n/server";
import { productPrinciples, values } from "../data/about.data";

/** Values and the way I work, in one section: what I care about, then how it shows up in the work. */
export async function ValuesSection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="values-heading" className="space-y-8">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("about.valuesEyebrow")}</p><h2 id="values-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("about.valuesTitle")}</h2></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {values.map(({ key, icon: Icon }) => <article key={key} className="flex h-full gap-4 rounded-card border border-border bg-surface p-5"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span><div><h3 className="font-semibold">{t(`about.values.${key}.title`)}</h3><p className="mt-2 text-sm leading-6 text-foreground-secondary">{t(`about.values.${key}.description`)}</p></div></article>)}
      </div>
      <div className="space-y-4">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("about.approachEyebrow")}</p><h3 id="approach-heading" className="mt-1 text-xl font-bold tracking-tight">{t("about.approachTitle")}</h3></div>
        <ol aria-labelledby="approach-heading" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productPrinciples.map(({ key, icon: Icon }, index) => <li key={key} className="h-full rounded-card border border-border bg-surface p-5"><div className="flex items-center justify-between"><span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span><span aria-hidden="true" className="text-xs font-semibold text-primary">0{index + 1}</span></div><h4 className="mt-4 font-semibold">{t(`about.principles.${key}.title`)}</h4><p className="mt-2 text-sm leading-6 text-foreground-secondary">{t(`about.principles.${key}.description`)}</p></li>)}
        </ol>
      </div>
    </section>
  );
}
