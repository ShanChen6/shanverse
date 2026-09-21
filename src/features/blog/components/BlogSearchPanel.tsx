"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";
import { normalizeSearchText } from "@/features/search/search-text";
import { SearchCombobox } from "@/features/search/components/SearchCombobox";
import type { SearchDocument } from "@/features/search/search.types";
import { blogHref, type BlogQuery } from "@/features/blog/blog-query";
import type { BlogFilterOption } from "@/features/blog/blog-search";

type Props = {
  query: BlogQuery;
  categories: BlogFilterOption[];
  documents: SearchDocument[];
  totalPosts: number;
};

export function BlogSearchPanel({ query, categories, documents, totalPosts }: Props) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [input, setInput] = React.useState(query.q);

  React.useEffect(() => setInput(query.q), [query.q, query.category, query.tag]);

  const navigate = (next: Partial<BlogQuery>) => {
    router.push(localizeHref(blogHref(query, { ...next, page: 1 }), locale));
  };

  const hasActiveFilters = Boolean(query.q || query.category || query.tag);

  return (
    <section aria-labelledby="blog-search-heading" className="space-y-5 rounded-3xl border border-border bg-surface p-4 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{locale === "vi" ? "Tìm nội dung bạn quan tâm" : "Find your next read"}</p>
        <h2 id="blog-search-heading" className="mt-1 text-xl font-semibold">{t("blog.searchTitle")}</h2>
      </div>

      <SearchCombobox
        documents={documents}
        value={input}
        onValueChange={setInput}
        onSelect={(document) => router.push(localizeHref(document.href, locale))}
        onSubmit={(value) => navigate({ q: value })}
        label={t("blog.searchPlaceholder")}
        placeholder={t("blog.searchPlaceholder")}
        submitLabel={t("blog.searchButton")}
        suggestionsLabel={t("search.suggestions")}
        emptyLabel={t("search.noSuggestions")}
        loadingLabel={locale === "vi" ? "Đang tìm kiếm..." : "Searching..."}
        clearLabel={t("search.clear")}
        typeLabels={{ post: locale === "vi" ? "Bài viết" : "Article", project: locale === "vi" ? "Dự án" : "Project", category: locale === "vi" ? "Danh mục" : "Category", tag: locale === "vi" ? "Thẻ" : "Tag" }}
      />

      <div>
        <p id="blog-category-label" className="mb-2 text-xs font-medium text-muted">{t("blog.categories")}</p>
        <div role="group" aria-labelledby="blog-category-label" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          <button type="button" aria-pressed={!query.category} onClick={() => navigate({ category: "" })} className={cn("min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary", !query.category ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary")}>
            {t("blog.allPosts")} <span className="ml-1 text-xs opacity-70">{totalPosts}</span>
          </button>
          {categories.map((category) => {
            const active = normalizeSearchText(query.category) === normalizeSearchText(category.slug) || normalizeSearchText(query.category) === normalizeSearchText(category.name);
            return <button key={category.slug} type="button" aria-pressed={active} onClick={() => navigate({ category: active ? "" : category.slug })} className={cn("min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary", active ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary")}>
              {category.name}<span className="ml-1 text-xs opacity-70">{category.count}</span>
            </button>;
          })}
        </div>
      </div>

      {hasActiveFilters ? <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4 text-sm">
        <span className="text-foreground-secondary">Active:</span>
        {query.q ? <button type="button" onClick={() => navigate({ q: "" })} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-background px-3 focus-visible:ring-2 focus-visible:ring-primary">“{query.q}” <X className="size-3.5" aria-hidden="true" /></button> : null}
        {query.category ? <button type="button" onClick={() => navigate({ category: "" })} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-background px-3 focus-visible:ring-2 focus-visible:ring-primary">{categories.find((item) => normalizeSearchText(item.slug) === normalizeSearchText(query.category))?.name ?? query.category}<X className="size-3.5" aria-hidden="true" /></button> : null}
        {query.tag ? <button type="button" onClick={() => navigate({ tag: "" })} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-background px-3 focus-visible:ring-2 focus-visible:ring-primary">#{query.tag} <X className="size-3.5" aria-hidden="true" /></button> : null}
        <button type="button" onClick={() => router.push(localizeHref("/blog", locale))} className="min-h-9 rounded-sm font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">{t("common.clearAll")}</button>
      </div> : null}
    </section>
  );
}
