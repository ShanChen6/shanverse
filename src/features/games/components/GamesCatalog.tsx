"use client";

import * as React from "react";

import { Chip } from "@/components/ui/chip";
import { isCategoryId, type CategoryId } from "../categories";
import { recentSlugs } from "../play-history";

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
  /** Heading of the "recently played" row. */
  recentLabel: string;
  chipsLabel: string;
  /** Shown after the games in every view (the "more games coming" card). */
  trailing?: React.ReactNode;
};

/**
 * The game list on /games: one grid of every game, filtered by the category chips
 * (a picked category shows every game in it, main or extra). Cards are rendered on the
 * server and the first paint is "All", so every game is in the HTML search
 * engines see; picking only filters, and is kept in ?category= for sharing.
 */
export function GamesCatalog({ categories, items, allLabel, recentLabel, chipsLabel, trailing }: Props) {
  const [picked, setPicked] = React.useState<CategoryId | null>(null);
  const [recent, setRecent] = React.useState<string[]>([]);

  // Read after mount: the list lives in this browser, so the server render never has it.
  React.useEffect(() => {
    setRecent(recentSlugs(items.map((item) => item.slug)));
  }, [items]);

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

  const grid = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 wide:grid-cols-4";
  const countIn = (id: CategoryId) => items.filter((item) => item.categories.includes(id)).length;

  return (
    <div className="space-y-8">
      <div role="group" aria-label={chipsLabel} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <Chip selected={picked === null} count={items.length} onClick={() => pick(null)}>
          {allLabel}
        </Chip>
        {categories.map((category) => (
          <Chip key={category.id} selected={picked === category.id} count={countIn(category.id)} onClick={() => pick(category.id)}>
            {category.label}
          </Chip>
        ))}
      </div>

      {picked === null ? (
        <>
          {recent.length ? (
            <section aria-labelledby="games-recent" className="space-y-4">
              <h2 id="games-recent" className="border-b border-border pb-2 text-xl font-semibold tracking-tight sm:text-2xl">{recentLabel}</h2>
              <div className={grid}>
                {recent.map((slug) => (
                  <React.Fragment key={slug}>{items.find((item) => item.slug === slug)?.card}</React.Fragment>
                ))}
              </div>
            </section>
          ) : null}
          <section aria-labelledby="games-all" className="space-y-4">
            {/* The heading only shows when a "recently played" row sits above. */}
            <h2 id="games-all" className={recent.length ? "border-b border-border pb-2 text-xl font-semibold tracking-tight sm:text-2xl" : "sr-only"}>{allLabel}</h2>
            <div className={grid}>
              {items.map((item) => (
                <React.Fragment key={item.slug}>{item.card}</React.Fragment>
              ))}
              <React.Fragment key="trailing">{trailing}</React.Fragment>
            </div>
          </section>
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
