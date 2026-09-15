import * as React from "react";
import type { AboutStats } from "../about-data";

export function AboutStatsSection({ stats }: { stats: AboutStats | null }) {
  if (!stats) return null;
  const items = [
    { value: stats.posts, label: "Bài viết đã chia sẻ" },
    { value: stats.projects, label: "Dự án đã xây dựng" },
    { value: stats.technologies, label: "Công nghệ đang khám phá" },
  ].filter((item) => item.value > 0);
  if (!items.length) return null;

  return (
    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading" className="sr-only">Shanverse qua những con số</h2>
      <dl className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => <div key={item.label} className="rounded-2xl border border-border bg-surface p-5"><dd className="text-3xl font-bold text-primary">{item.value}</dd><dt className="mt-1 text-sm text-foreground-secondary">{item.label}</dt></div>)}
      </dl>
    </section>
  );
}
