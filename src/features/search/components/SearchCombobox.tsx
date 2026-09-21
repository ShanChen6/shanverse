"use client";

import * as React from "react";
import Fuse, { type FuseResultMatch } from "fuse.js";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { DEFAULT_SEARCH_LIMIT, FUSE_SEARCH_OPTIONS, MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from "../search.config";
import type { SearchDocument, SearchDocumentType } from "../search.types";

type Props = {
  documents: SearchDocument[];
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (document: SearchDocument) => void;
  onSubmit: (query: string) => void;
  label: string;
  placeholder: string;
  submitLabel: string;
  suggestionsLabel: string;
  emptyLabel: string;
  loadingLabel: string;
  clearLabel: string;
  typeLabels: Record<SearchDocumentType, string>;
  className?: string;
  limit?: number;
};

function HighlightedText({ text, matches }: { text: string; matches: readonly FuseResultMatch[] | undefined }) {
  const indices = matches?.flatMap((match) => match.indices).sort((a, b) => a[0] - b[0]);
  if (!indices?.length) return text;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of indices) {
    if (start < cursor) continue;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    nodes.push(<mark key={`${start}-${end}`} className="rounded-sm bg-primary/15 text-inherit">{text.slice(start, end + 1)}</mark>);
    cursor = end + 1;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function SearchCombobox({ documents, value, onValueChange, onSelect, onSubmit, label, placeholder, submitLabel, suggestionsLabel, emptyLabel, loadingLabel, clearLabel, typeLabels, className, limit = DEFAULT_SEARCH_LIMIT }: Props) {
  const id = React.useId();
  const inputId = `${id}-input`;
  const listboxId = `${id}-listbox`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const optionRefs = React.useRef(new Map<number, HTMLButtonElement>());
  const [focused, setFocused] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  const fuse = React.useMemo(() => new Fuse(documents, { ...FUSE_SEARCH_OPTIONS, keys: [...FUSE_SEARCH_OPTIONS.keys] }), [documents]);
  const trimmedQuery = value.trim();
  const searchableQuery = debouncedValue.trim();
  const searching = trimmedQuery.length >= MIN_SEARCH_LENGTH && debouncedValue !== value;
  const results = React.useMemo(() => {
    if (searchableQuery.length < MIN_SEARCH_LENGTH) return [];
    return fuse.search(searchableQuery).sort((a, b) => {
      const scoreDifference = (a.score ?? 1) - (b.score ?? 1);
      if (Math.abs(scoreDifference) > 0.025) return scoreDifference;
      return Number(Boolean(b.item.featured)) - Number(Boolean(a.item.featured)) || scoreDifference || (b.item.timestamp ?? 0) - (a.item.timestamp ?? 0) || a.item.id.localeCompare(b.item.id);
    }).slice(0, limit);
  }, [fuse, limit, searchableQuery]);
  const open = focused && !dismissed && trimmedQuery.length >= MIN_SEARCH_LENGTH;

  React.useEffect(() => setActiveIndex(-1), [debouncedValue]);
  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setFocused(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);
  React.useEffect(() => {
    optionRefs.current.get(activeIndex)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const choose = (document: SearchDocument) => {
    setFocused(false);
    setDismissed(true);
    onSelect(document);
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const active = results[activeIndex]?.item;
    if (active) choose(active);
    else {
      setFocused(false);
      setDismissed(true);
      onSubmit(value.trim());
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (open) { event.preventDefault(); setDismissed(true); setActiveIndex(-1); }
      else inputRef.current?.blur();
      return;
    }
    if (!open || results.length === 0) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((current) => (current + 1) % results.length); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((current) => current <= 0 ? results.length - 1 : current - 1); }
    else if (event.key === "Home") { event.preventDefault(); setActiveIndex(0); }
    else if (event.key === "End") { event.preventDefault(); setActiveIndex(results.length - 1); }
  };

  return <div ref={rootRef} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  }} className={cn("relative z-20", className)}>
    <form role="search" onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <label htmlFor={inputId} className="sr-only">{label}</label>
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <Input ref={inputRef} id={inputId} value={value} onChange={(event) => { onValueChange(event.target.value); setDismissed(false); setActiveIndex(-1); }} onFocus={() => { setFocused(true); setDismissed(false); }} onKeyDown={handleKeyDown} role="combobox" aria-expanded={open} aria-controls={listboxId} aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined} aria-autocomplete="list" autoComplete="off" placeholder={placeholder} inputSize="lg" className="h-12 bg-background pl-12 pr-11 text-base" />
        {value ? <button type="button" onClick={() => { onValueChange(""); setActiveIndex(-1); inputRef.current?.focus(); }} aria-label={clearLabel} className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"><X aria-hidden="true" className="size-4" /></button> : null}
      </div>
      <Button type="submit" size="lg" className="h-12 sm:px-6">{submitLabel}</Button>
    </form>
    {open ? <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-2xl border border-border bg-surface-elevated text-left shadow-xl">
      <div id={listboxId} role="listbox" aria-label={suggestionsLabel} className="max-h-[min(420px,50vh)] overflow-y-auto overscroll-contain p-2">
        {searching ? <p role="status" className="px-4 py-5 text-center text-sm text-foreground-secondary">{loadingLabel}</p> : results.length ? results.map((result, index) => {
          const selected = index === activeIndex;
          return <button key={result.item.id} ref={(node) => { if (node) optionRefs.current.set(index, node); else optionRefs.current.delete(index); }} id={`${id}-option-${index}`} type="button" role="option" aria-selected={selected} onMouseEnter={() => setActiveIndex(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(result.item)} className={cn("flex min-h-14 w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary", selected ? "bg-primary/10" : "hover:bg-surface") }>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold"><HighlightedText text={result.item.title} matches={result.matches?.filter((match) => match.key === "title")} /></span>{result.item.description ? <span className="mt-0.5 block line-clamp-1 text-xs text-foreground-secondary"><HighlightedText text={result.item.description} matches={result.matches?.filter((match) => match.key === "description")} /></span> : null}</span>
            <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted">{typeLabels[result.item.type]}</span>
          </button>;
        }) : <p className="px-4 py-5 text-center text-sm text-foreground-secondary">{emptyLabel}</p>}
      </div>
    </div> : null}
    <p className="sr-only" aria-live="polite" aria-atomic="true">{open && !searching ? `${results.length} ${suggestionsLabel}` : ""}</p>
  </div>;
}
