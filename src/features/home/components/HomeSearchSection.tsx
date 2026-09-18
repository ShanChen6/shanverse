"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  FolderKanban,
  Search,
  Tag,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { useI18n } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";
import {
  indexSearchSuggestions,
  normalizeSearchText,
  rankSearchSuggestions,
  type HomeSearchCategory,
  type HomeSearchSuggestion,
} from "../home-search";

interface HomeSearchSectionProps {
  categories: HomeSearchCategory[];
  suggestions: HomeSearchSuggestion[];
}

const TYPE_LABELS = {
  post: "Articles",
  project: "Projects",
  category: "Topics",
} as const;

const TYPE_ICONS = {
  post: BookOpen,
  project: FolderKanban,
  category: Tag,
} as const;

export function HomeSearchSection({
  categories,
  suggestions,
}: HomeSearchSectionProps) {
  const router = useRouter();
  const { locale } = useI18n();
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(query);
  const [isFocused, setIsFocused] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(
    null,
  );
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const optionRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const indexedSuggestions = React.useMemo(
    () => indexSearchSuggestions(suggestions),
    [suggestions],
  );
  const normalizedQuery = normalizeSearchText(query);
  const results = React.useMemo(
    () => rankSearchSuggestions(indexedSuggestions, deferredQuery, 8),
    [deferredQuery, indexedSuggestions],
  );
  const groupedResults = React.useMemo(
    () =>
      (["post", "project", "category"] as const)
        .map((type) => ({
          type,
          items: results.filter((result) => result.type === type),
        }))
        .filter((group) => group.items.length > 0),
    [results],
  );
  const orderedResults = React.useMemo(
    () => groupedResults.flatMap((group) => group.items),
    [groupedResults],
  );
  const isOpen = isFocused && normalizedQuery.length >= 2;

  React.useEffect(() => {
    setActiveIndex(-1);
  }, [deferredQuery]);

  React.useEffect(() => {
    setIsFocused(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsFocused(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  React.useEffect(() => {
    const active = orderedResults[activeIndex];
    if (active) {
      optionRefs.current.get(active.id)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, orderedResults]);

  const goToBlog = (params: { q?: string; category?: string }) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.category) search.set("category", params.category);
    const queryString = search.toString();
    router.push(localizeHref(queryString ? `${ROUTES.BLOG}?${queryString}` : ROUTES.BLOG, locale));
    setIsFocused(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (activeIndex >= 0 && orderedResults[activeIndex]) {
      router.push(localizeHref(orderedResults[activeIndex].href, locale));
      setIsFocused(false);
      return;
    }
    if (!query.trim() && !activeCategory) return;
    goToBlog({
      q: query.trim() || undefined,
      category: activeCategory ?? undefined,
    });
  };

  const handleCategoryClick = (slug: string | null) => {
    setActiveCategory(slug);
    goToBlog({ q: query.trim() || undefined, category: slug ?? undefined });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsFocused(false);
      return;
    }
    if (!isOpen || orderedResults.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % orderedResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? orderedResults.length - 1 : current - 1,
      );
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(orderedResults.length - 1);
    }
  };

  const selectSuggestion = (suggestion: HomeSearchSuggestion) => {
    setIsFocused(false);
    router.push(localizeHref(suggestion.href, locale));
  };

  return (
    <section
      aria-labelledby="home-search-heading"
      className="relative rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface-elevated to-surface p-5 shadow-sm sm:p-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Explore Shanverse
        </p>
        <h2
          id="home-search-heading"
          className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
        >
          What would you like to explore?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground-secondary sm:text-base">
          Search articles, projects, or browse by topic.
        </p>

        <div ref={rootRef} className="relative z-20 mx-auto mt-6 max-w-2xl">
          <form
            onSubmit={handleSubmit}
            role="search"
            className="flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <label htmlFor="home-search-input" className="sr-only">
                Search articles, projects, or topics
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <Input
                ref={inputRef}
                id="home-search-input"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setIsFocused(true);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => {
                    if (!rootRef.current?.contains(document.activeElement)) {
                      setIsFocused(false);
                    }
                  }, 0);
                }}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded={isOpen}
                aria-controls="home-search-listbox"
                aria-activedescendant={
                  activeIndex >= 0 && orderedResults[activeIndex]
                    ? `home-search-option-${orderedResults[activeIndex].id}`
                    : undefined
                }
                aria-autocomplete="list"
                autoComplete="off"
                placeholder="Search articles, projects, or topics..."
                inputSize="lg"
                className="h-12 bg-background pl-12 pr-11 text-base shadow-sm"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveIndex(-1);
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            <Button type="submit" size="lg" className="h-12 sm:px-6">
              Search <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </form>

          {isOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-2xl border border-border bg-surface-elevated text-left shadow-xl">
              <div
                id="home-search-listbox"
                role="listbox"
                aria-label="Search suggestions"
                className="max-h-[min(420px,50vh)] overflow-y-auto overscroll-contain p-2"
              >
                {groupedResults.length > 0 ? (
                  groupedResults.map((group) => (
                    <div key={group.type} className="py-1">
                      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
                        {TYPE_LABELS[group.type]}
                      </p>
                      {group.items.map((suggestion) => {
                        const resultIndex = orderedResults.findIndex(
                          (item) => item.id === suggestion.id,
                        );
                        const active = resultIndex === activeIndex;
                        const Icon = TYPE_ICONS[suggestion.type];
                        return (
                          <button
                            key={suggestion.id}
                            ref={(node) => {
                              if (node) optionRefs.current.set(suggestion.id, node);
                              else optionRefs.current.delete(suggestion.id);
                            }}
                            id={`home-search-option-${suggestion.id}`}
                            type="button"
                            role="option"
                            aria-selected={active}
                            onMouseEnter={() => setActiveIndex(resultIndex)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectSuggestion(suggestion)}
                            className={cn(
                              "flex min-h-16 w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                              active
                                ? "bg-primary/10 text-foreground"
                                : "hover:bg-surface",
                            )}
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                              <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold">
                                {suggestion.title}
                              </span>
                              {suggestion.description ? (
                                <span className="mt-0.5 block line-clamp-1 text-xs text-foreground-secondary">
                                  {suggestion.description}
                                </span>
                              ) : null}
                            </span>
                            <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted">
                              {TYPE_LABELS[suggestion.type].slice(0, -1)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-5 text-center">
                    <p className="text-sm font-medium">
                      No results for “{query.trim()}”.
                    </p>
                    <p className="mt-1 text-xs text-foreground-secondary">
                      Try another keyword or browse a topic below.
                    </p>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => goToBlog({ q: query.trim() })}
                      className="mt-3 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      View all articles
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {isOpen
              ? results.length > 0
                ? `${results.length} results found`
                : "No results found"
              : ""}
          </p>
        </div>

        <p id="home-category-label" className="mt-6 text-xs font-medium text-muted">
          Popular topics
        </p>
      </div>

      <div
        role="group"
        aria-labelledby="home-category-label"
        className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
      >
        <button
          type="button"
          onClick={() => handleCategoryClick(null)}
          className={cn(
            "min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary",
            activeCategory === null
              ? "border-transparent bg-primary text-white"
              : "border-border text-foreground-secondary hover:border-primary/50 hover:text-primary",
          )}
          aria-pressed={activeCategory === null}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryClick(category.slug)}
            className={cn(
              "min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary",
              activeCategory === category.slug
                ? "border-transparent bg-primary text-white"
                : "border-border text-foreground-secondary hover:border-primary/50 hover:text-primary",
            )}
            aria-pressed={activeCategory === category.slug}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
}
