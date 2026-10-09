import * as React from "react";
import { getTranslator } from "@/i18n/server";
import { productPrinciples } from "../data/about.data";

export async function ApproachSection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="approach-heading" className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("about.approachEyebrow")}</p><h2 id="approach-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("about.approachTitle")}</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productPrinciples.map(({ key, icon: Icon }, index) => <article key={key} className="h-full rounded-2xl border border-border bg-surface p-5"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span><p className="mt-5 text-xs font-semibold text-primary">0{index + 1}</p><h3 className="mt-1 font-semibold">{t(`about.principles.${key}.title`)}</h3><p className="mt-2 text-sm leading-6 text-foreground-secondary">{t(`about.principles.${key}.description`)}</p></article>)}
      </div>
    </section>
  );
}
