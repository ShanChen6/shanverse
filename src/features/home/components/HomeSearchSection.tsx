"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { useI18n } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";
import { SearchCombobox } from "@/features/search/components/SearchCombobox";
import type { SearchDocument } from "@/features/search/search.types";
import type { HomeSearchCategory } from "../home-search";

type Props = {
  categories: HomeSearchCategory[];
  documents: SearchDocument[];
};

export function HomeSearchSection({ categories, documents }: Props) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const goToBlog = (params: { q?: string; category?: string }) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.category) search.set("category", params.category);
    const queryString = search.toString();
    router.push(localizeHref(queryString ? `${ROUTES.BLOG}?${queryString}` : ROUTES.BLOG, locale));
  };

  return (
    <section aria-labelledby="home-search-heading" className="relative rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface-elevated to-surface p-5 shadow-sm sm:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("home.searchEyebrow")}</p>
        <h2 id="home-search-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t("home.searchTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground-secondary sm:text-base">{t("home.searchDescription")}</p>
        <SearchCombobox
          documents={documents}
          value={query}
          onValueChange={setQuery}
          onSelect={(document) => router.push(localizeHref(document.href, locale))}
          onSubmit={(value) => {
            if (value || activeCategory) goToBlog({ q: value || undefined, category: activeCategory ?? undefined });
          }}
          label={t("home.searchLabel")}
          placeholder={t("home.searchPlaceholder")}
          submitLabel={t("blog.searchButton")}
          suggestionsLabel={t("search.suggestions")}
          emptyLabel={t("home.searchEmpty")}
          loadingLabel={t("search.loading")}
          clearLabel={t("search.clear")}
          typeLabels={{ post: t("search.typePost"), project: t("search.typeProject"), category: t("search.typeCategory"), tag: t("search.typeTag") }}
          className="mx-auto mt-6 max-w-2xl"
        />
        <p id="home-category-label" className="mt-6 text-xs font-medium text-muted">{t("home.popularTopics")}</p>
      </div>

      <div role="group" aria-labelledby="home-category-label" className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        <button type="button" onClick={() => { setActiveCategory(null); goToBlog({ q: query.trim() || undefined }); }} className={cn("min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary", activeCategory === null ? "border-transparent bg-primary text-white" : "border-border text-foreground-secondary hover:border-primary/50 hover:text-primary")} aria-pressed={activeCategory === null}>{t("home.allTopics")}</button>
        {categories.map((category) => (
          <button key={category.id} type="button" onClick={() => { setActiveCategory(category.slug); goToBlog({ q: query.trim() || undefined, category: category.slug }); }} className={cn("min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary", activeCategory === category.slug ? "border-transparent bg-primary text-white" : "border-border text-foreground-secondary hover:border-primary/50 hover:text-primary")} aria-pressed={activeCategory === category.slug}>{category.name}</button>
        ))}
      </div>
    </section>
  );
}
