"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { isGamePlayRoute } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { useI18n } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";
import type { SearchCategory, SearchDocument } from "../search.types";
import { SearchCombobox } from "./SearchCombobox";

type Index = { documents: SearchDocument[]; categories: SearchCategory[] };
type Status = "idle" | "loading" | "ready" | "error";

function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

/**
 * Site-wide search: a header button (and the "/" key, or Ctrl/Cmd+K) opens a dialog.
 * The index is fetched from /api/search the first time it opens, so pages do not pay for it.
 */
export function SearchDialog() {
  const router = useRouter();
  const inGame = isGamePlayRoute(usePathname());
  const { locale, t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState<Index>({ documents: [], categories: [] });
  const [status, setStatus] = React.useState<Status>("idle");

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey) return;
      const slash = event.key === "/" && !event.ctrlKey && !event.metaKey;
      const palette = event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey);
      if (!slash && !palette) return;
      // Games listen for keys themselves (a typing test uses "/"), so the shortcut stays out of their way.
      if (slash && (inGame || isTypingTarget(event.target))) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inGame]);

  const load = React.useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/search");
      if (!response.ok) throw new Error(String(response.status));
      setIndex((await response.json()) as Index);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    if (open && (status === "idle" || status === "error")) void load();
  }, [open, status, load]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(localizeHref(href, locale));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label={t("search.open")}
        aria-keyshortcuts="/"
        aria-haspopup="dialog"
        className="lg:w-auto lg:gap-2 lg:px-3"
      >
        <Search aria-hidden="true" className="size-5" />
        <span className="hidden text-sm font-medium lg:inline">{t("search.open")}</span>
        <kbd aria-hidden="true" className="hidden rounded border border-border px-1.5 text-xs font-medium text-muted lg:inline">/</kbd>
      </Button>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className="top-[6%] w-[min(94vw,40rem)] -translate-y-0 p-4 sm:top-[12%] sm:p-6"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("site-search-input-anchor")?.querySelector("input")?.focus();
          }}
        >
          <DialogPrimitive.Title className="text-lg font-bold tracking-tight">{t("home.searchTitle")}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-sm text-foreground-secondary">{t("home.searchDescription")}</DialogPrimitive.Description>

          <div id="site-search-input-anchor" className="mt-4">
            <SearchCombobox
              documents={index.documents}
              value={query}
              onValueChange={setQuery}
              onSelect={(document) => go(document.href)}
              onSubmit={(value) => go(value ? `${ROUTES.BLOG}?q=${encodeURIComponent(value)}` : ROUTES.BLOG)}
              label={t("home.searchLabel")}
              placeholder={t("home.searchPlaceholder")}
              submitLabel={t("blog.searchButton")}
              suggestionsLabel={t("search.suggestions")}
              emptyLabel={t("home.searchEmpty")}
              loadingLabel={t("search.loading")}
              clearLabel={t("search.clear")}
              typeLabels={{ post: t("search.typePost"), project: t("search.typeProject"), category: t("search.typeCategory"), tag: t("search.typeTag") }}
            />
          </div>

          <div aria-live="polite" className="mt-4 min-h-6 text-sm text-foreground-secondary">
            {status === "loading" ? t("search.loading") : status === "error" ? t("search.unavailable") : null}
          </div>

          {index.categories.length ? (
            <div className="mt-2">
              <p id="site-search-topics" className="text-xs font-medium text-muted">{t("home.popularTopics")}</p>
              <ul aria-labelledby="site-search-topics" className="mt-2 flex flex-wrap gap-2">
                {index.categories.slice(0, 8).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`${ROUTES.BLOG}?category=${encodeURIComponent(category.slug)}`}
                      onClick={() => setOpen(false)}
                      className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground-secondary hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
