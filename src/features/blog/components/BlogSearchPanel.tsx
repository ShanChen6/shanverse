"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CalendarDays, Clock, Search, Tag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { normalizeSearchText } from "@/features/search/search-text";
import {
  blogHref,
  type BlogQuery,
} from "@/features/blog/blog-query";
import {
  rankBlogSuggestions,
  type BlogFilterOption,
  type BlogSearchSuggestion,
} from "@/features/blog/blog-search";

type Props = {
  query: BlogQuery;
  categories: BlogFilterOption[];
  suggestions: BlogSearchSuggestion[];
  totalPosts: number;
};

const typeLabel = {
  article: "Articles",
  category: "Categories",
  tag: "Tags",
} as const;

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function BlogSearchPanel({
  query,
  categories,
  suggestions,
  totalPosts,
}: Props) {
  const router = useRouter();
  const [input, setInput] = React.useState(query.q);
  const deferredInput = React.useDeferredValue(input);
  const [focused, setFocused] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const optionRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const results = React.useMemo(
    () => rankBlogSuggestions(suggestions, deferredInput, 8),
    [deferredInput, suggestions],
  );
  const groups = React.useMemo(
    () =>
      (["article", "category", "tag"] as const)
        .map((type) => ({
          type,
          items: results.filter((result) => result.type === type),
        }))
        .filter((group) => group.items.length > 0),
    [results],
  );
  const orderedResults = React.useMemo(
    () => groups.flatMap((group) => group.items),
    [groups],
  );
  const open =
    focused && !dismissed && normalizeSearchText(input).length >= 2;

  React.useEffect(() => {
    setInput(query.q);
    setDismissed(true);
    setActiveIndex(-1);
  }, [query.q, query.category, query.tag]);

  React.useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing =
        target?.matches("input, textarea, select") || target?.isContentEditable;
      if (
        event.key === "/" &&
        !editing &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setFocused(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  React.useEffect(() => {
    const active = orderedResults[activeIndex];
    if (active) {
      optionRefs.current.get(active.id)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, orderedResults]);

  const navigate = (next: Partial<BlogQuery>) => {
    router.push(blogHref(query, { ...next, page: 1 }));
    setFocused(false);
    setDismissed(true);
  };

  const selectSuggestion = (suggestion: BlogSearchSuggestion) => {
    if (suggestion.type === "article") {
      router.push(suggestion.href);
    } else if (suggestion.type === "category") {
      navigate({ category: suggestion.slug ?? suggestion.title });
    } else {
      navigate({ tag: suggestion.slug ?? suggestion.title });
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const active = orderedResults[activeIndex];
    if (active) {
      selectSuggestion(active);
      return;
    }
    navigate({ q: input.trim() });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setDismissed(true);
        setActiveIndex(-1);
      } else {
        inputRef.current?.blur();
      }
      return;
    }
    if (!open || orderedResults.length === 0) return;
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

  const hasActiveFilters = Boolean(query.q || query.category || query.tag);

  return (
    <section
      aria-labelledby="blog-search-heading"
      className="space-y-5 rounded-3xl border border-border bg-surface p-4 sm:p-6"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Find your next read
        </p>
        <h2 id="blog-search-heading" className="mt-1 text-xl font-semibold">
          Search the garden
        </h2>
      </div>

      <div ref={rootRef} className="relative z-20">
        <form role="search" onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="blog-search" className="sr-only">
              Search articles, topics, or technologies
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
            />
            <Input
              ref={inputRef}
              id="blog-search"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setDismissed(false);
                setActiveIndex(-1);
              }}
              onFocus={() => {
                setFocused(true);
                setDismissed(false);
              }}
              onBlur={() => {
                window.setTimeout(() => {
                  if (!rootRef.current?.contains(document.activeElement)) {
                    setFocused(false);
                  }
                }, 0);
              }}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={open}
              aria-controls="blog-search-listbox"
              aria-activedescendant={
                activeIndex >= 0 && orderedResults[activeIndex]
                  ? `blog-search-option-${orderedResults[activeIndex].id}`
                  : undefined
              }
              aria-autocomplete="list"
              autoComplete="off"
              placeholder="Search articles, topics, or technologies..."
              inputSize="lg"
              className="h-12 bg-background pl-12 pr-20 text-base"
            />
            <span className="pointer-events-none absolute right-12 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted sm:block">
              /
            </span>
            {input ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setInput("");
                  setActiveIndex(-1);
                  navigate({ q: "" });
                }}
                className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <Button type="submit" size="lg" className="h-12 sm:px-6">
            Search
          </Button>
        </form>

        {open ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-xl">
            <div
              id="blog-search-listbox"
              role="listbox"
              aria-label="Blog search suggestions"
              className="max-h-[min(420px,50vh)] overflow-y-auto overscroll-contain p-2"
            >
              {groups.length ? (
                groups.map((group) => (
                  <div key={group.type} className="py-1">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
                      {typeLabel[group.type]}
                    </p>
                    {group.items.map((suggestion) => {
                      const index = orderedResults.findIndex(
                        (item) => item.id === suggestion.id,
                      );
                      const selected = index === activeIndex;
                      const date = formatDate(suggestion.publishedAt);
                      return (
                        <button
                          key={suggestion.id}
                          ref={(node) => {
                            if (node) optionRefs.current.set(suggestion.id, node);
                            else optionRefs.current.delete(suggestion.id);
                          }}
                          id={`blog-search-option-${suggestion.id}`}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectSuggestion(suggestion)}
                          className={cn(
                            "flex min-h-14 w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                            selected ? "bg-primary/10" : "hover:bg-surface",
                          )}
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                            {suggestion.type === "article" ? (
                              <BookOpen className="size-4" aria-hidden="true" />
                            ) : (
                              <Tag className="size-4" aria-hidden="true" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {suggestion.title}
                            </span>
                            {suggestion.type === "article" ? (
                              <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
                                {suggestion.category ? <span>{suggestion.category}</span> : null}
                                {date ? (
                                  <span className="inline-flex items-center gap-1">
                                    <CalendarDays className="size-3" aria-hidden="true" />
                                    {date}
                                  </span>
                                ) : null}
                                {suggestion.readingTimeMinutes && suggestion.readingTimeMinutes > 0 ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="size-3" aria-hidden="true" />
                                    {suggestion.readingTimeMinutes} min read
                                  </span>
                                ) : null}
                              </span>
                            ) : suggestion.description ? (
                              <span className="mt-0.5 block truncate text-xs text-foreground-secondary">
                                {suggestion.description}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="px-4 py-5 text-center">
                  <p className="text-sm font-medium">No suggestions found.</p>
                  <p className="mt-1 text-xs text-foreground-secondary">
                    You can still search all articles for “{input.trim()}”.
                  </p>
                </div>
              )}
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => navigate({ q: input.trim() })}
                className="mt-1 flex min-h-11 w-full items-center justify-center rounded-xl border-t border-border px-3 pt-3 text-sm font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary"
              >
                View all results for “{input.trim()}”
              </button>
            </div>
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {open
            ? results.length
              ? `${results.length} suggestions found`
              : "No suggestions found"
            : ""}
        </p>
      </div>

      <div>
        <p id="blog-category-label" className="mb-2 text-xs font-medium text-muted">
          Browse categories
        </p>
        <div
          role="group"
          aria-labelledby="blog-category-label"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          <button
            type="button"
            aria-pressed={!query.category}
            onClick={() => navigate({ category: "" })}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary",
              !query.category
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary",
            )}
          >
            All posts <span className="ml-1 text-xs opacity-70">{totalPosts}</span>
          </button>
          {categories.map((category) => {
            const active =
              normalizeSearchText(query.category) ===
                normalizeSearchText(category.slug) ||
              normalizeSearchText(query.category) ===
                normalizeSearchText(category.name);
            return (
              <button
                key={category.slug}
                type="button"
                aria-pressed={active}
                onClick={() => navigate({ category: active ? "" : category.slug })}
                className={cn(
                  "min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary",
                  active
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary",
                )}
              >
                {category.name}
                <span className="ml-1 text-xs opacity-70">{category.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4 text-sm">
          <span className="text-foreground-secondary">Active:</span>
          {query.q ? (
            <button type="button" onClick={() => navigate({ q: "" })} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-background px-3 focus-visible:ring-2 focus-visible:ring-primary">
              “{query.q}” <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
          {query.category ? (
            <button type="button" onClick={() => navigate({ category: "" })} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-background px-3 focus-visible:ring-2 focus-visible:ring-primary">
              {categories.find((item) => normalizeSearchText(item.slug) === normalizeSearchText(query.category))?.name ?? query.category}
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
          {query.tag ? (
            <button type="button" onClick={() => navigate({ tag: "" })} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-background px-3 focus-visible:ring-2 focus-visible:ring-primary">
              #{query.tag} <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
          <button type="button" onClick={() => router.push("/blog")} className="min-h-9 rounded-sm font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">
            Clear all
          </button>
        </div>
      ) : null}
    </section>
  );
}
