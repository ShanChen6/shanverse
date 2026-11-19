import * as React from "react";
import { getTranslator } from "@/i18n/server";
import type { AboutStats } from "../about-data";

export async function AboutStatsSection({ stats }: { stats: AboutStats | null }) {
  if (!stats) return null;
  const { t } = await getTranslator();
  const items = [
    { value: stats.posts, label: t("about.statsPosts") },
    { value: stats.projects, label: t("about.statsProjects") },
    { value: stats.technologies, label: t("about.statsTechnologies") },
  ].filter((item) => item.value > 0);
  if (!items.length) return null;

  return (
    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">{t("about.statsHeading")}</h2>
      <dl className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col-reverse">
            <dt className="text-xs text-foreground-secondary">{item.label}</dt>
            <dd className="text-2xl font-bold text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
