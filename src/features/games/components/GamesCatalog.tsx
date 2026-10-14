"use client";

import * as React from "react";

import { cn } from "@/lib/cn";
import { isCategoryId, type CategoryId } from "../categories";

export type CatalogItem = {
  slug: string;
  /** Main category first, then extras. */
  categories: CategoryId[];
  /** The game's card, rendered on the server. */
  card: React.ReactNode;
};

type Props = {
  /** Categories that have games, in display order, with their translated labels. */
  categories: { id: CategoryId; label: string }[];
  items: CatalogItem[];
  allLabel: string;
  chipsLabel: string;
  /** Section count, with {n} for the number, e.g. "{n} games". */
  countTemplate: string;
  /** Shown after the games in every view (the "more games coming" card). */
  trailing?: React.ReactNode;
};

/**
 * The game list on /games: "All" shows a section per main category; a picked
 * category shows every game in it, main or extra. Cards are rendered on the
 * server and the first paint is "All", so every game is in the HTML search
 * engines see; picking only filters, and is kept in ?category= for sharing.
 */
export function GamesCatalog({ categories, items, allLabel, chipsLabel, countTemplate, trailing }: Props) {
  const [picked, setPicked] = React.useState<CategoryId | null>(null);

  React.useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("category");
    if (isCategoryId(fromUrl) && categories.some((category) => category.id === fromUrl)) setPicked(fromUrl);
  }, [categories]);

  const pick = (id: CategoryId | null) => {
    setPicked(id);
    try {
      const url = new URL(window.location.href);
      if (id) url.searchParams.set("category", id);
      else url.searchParams.delete("category");
      window.history.replaceState(window.history.state, "", url);
    } catch {
      // The filter still works; only the shareable URL is not updated.
    }
  };

  const grid = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";
  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary",
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground-secondary hover:border-primary/50 hover:text-foreground",
    );
  const countIn = (id: CategoryId) => items.filter((item) => item.categories.includes(id)).length;

  return (
    <div className="space-y-8">
      <div role="group" aria-label={chipsLabel} className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={picked === null} onClick={() => pick(null)} className={chip(picked === null)}>
          {allLabel}
          <span className="text-xs opacity-70">{items.length}</span>
        </button>
        {categories.map((category) => (
          <button key={category.id} type="button" aria-pressed={picked === category.id} onClick={() => pick(category.id)} className={chip(picked === category.id)}>
            {category.label}
            <span className="text-xs opacity-70">{countIn(category.id)}</span>
          </button>
        ))}
      </div>

      {picked === null ? (
        <>
          {categories.map((category) => {
            const inSection = items.filter((item) => item.categories[0] === category.id);
            if (!inSection.length) return null;
            return (
              <section key={category.id} aria-labelledby={`cat-${category.id}`} className="space-y-4">
                <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
                  <h2 id={`cat-${category.id}`} className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {category.label}
                  </h2>
                  <span className="text-sm text-muted">{countTemplate.replace("{n}", String(inSection.length))}</span>
                </div>
                <div className={grid}>
                  {inSection.map((item) => (
                    <React.Fragment key={item.slug}>{item.card}</React.Fragment>
                  ))}
                </div>
              </section>
            );
          })}
          {trailing ? <div className={grid}>{trailing}</div> : null}
        </>
      ) : (
        <section aria-label={categories.find((category) => category.id === picked)?.label} className={grid}>
          {items
            .filter((item) => item.categories.includes(picked))
            .map((item) => (
              <React.Fragment key={item.slug}>{item.card}</React.Fragment>
            ))}
          {trailing}
        </section>
      )}
    </div>
  );
}
