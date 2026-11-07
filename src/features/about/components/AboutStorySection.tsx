import * as React from "react";
import { Sprout } from "lucide-react";
import { getTranslator } from "@/i18n/server";

export async function AboutStorySection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="story-heading" className="space-y-4 rounded-card border border-border bg-surface p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Sprout aria-hidden="true" className="size-6 text-primary" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("about.storyEyebrow")}</p>
          <h2 id="story-heading" className="text-xl font-bold tracking-tight sm:text-2xl">{t("about.storyTitle")}</h2>
        </div>
      </div>
      <div className="space-y-4 leading-8 text-foreground-secondary">
        <p>{t("about.story.first")}</p>
        <p>{t("about.story.second")}</p>
        <p>{t("about.story.third")}</p>
      </div>
    </section>
  );
}
