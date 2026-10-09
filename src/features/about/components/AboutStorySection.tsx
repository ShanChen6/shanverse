import * as React from "react";
import { Sprout } from "lucide-react";
import { getTranslator } from "@/i18n/server";

export async function AboutStorySection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="story-heading" className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("about.storyEyebrow")}</p><h2 id="story-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("about.storyTitle")}</h2></div>
      <div className="space-y-5 rounded-2xl border border-border bg-surface p-6 leading-8 text-foreground-secondary sm:p-8">
        <Sprout aria-hidden="true" className="size-6 text-primary" />
        <p>{t("about.story.first")}</p>
        <p>{t("about.story.second")}</p>
        <p>{t("about.story.third")}</p>
      </div>
    </section>
  );
}
