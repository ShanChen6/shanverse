"use client";

import * as React from "react";
import { ChevronDown, ListTree } from "lucide-react";

import type { TableOfContentsItem } from "@/components/common/notion/table-of-contents";
import { AutoHideScrollArea } from "@/components/ui/AutoHideScrollArea";

const ARTICLE_SELECTOR = "[data-blog-content]";
const ACTIVE_LINE_OFFSET = 96;

type ArticleTableOfContentsProps = {
  items: TableOfContentsItem[];
  label: string;
  mobileLabel: string;
};

export function ArticleTableOfContents({
  items,
  label,
  mobileLabel,
}: ArticleTableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const desktopNavRef = React.useRef<HTMLDivElement>(null);
  const mobileDetailsRef = React.useRef<HTMLDetailsElement>(null);
  const itemIds = React.useMemo(() => items.map((item) => item.id), [items]);

  React.useEffect(() => {
    const article = document.querySelector<HTMLElement>(ARTICLE_SELECTOR);
    const headings = itemIds
      .map((id) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => heading !== null);

    if (!article || headings.length === 0 || !("IntersectionObserver" in window)) {
      return;
    }

    const updateActiveHeading = () => {
      const articleBottom = article.getBoundingClientRect().bottom;
      const atArticleEnd = articleBottom <= window.innerHeight;
      let nextId = headings[0].id;

      if (atArticleEnd) {
        nextId = headings[headings.length - 1].id;
      } else {
        for (const heading of headings) {
          if (heading.getBoundingClientRect().top <= ACTIVE_LINE_OFFSET) {
            nextId = heading.id;
          } else {
            break;
          }
        }
      }

      setActiveId((current) => (current === nextId ? current : nextId));
    };

    const observer = new IntersectionObserver(updateActiveHeading, {
      rootMargin: `-${ACTIVE_LINE_OFFSET}px 0px -65% 0px`,
      threshold: [0, 1],
    });

    headings.forEach((heading) => observer.observe(heading));
    updateActiveHeading();

    return () => observer.disconnect();
  }, [itemIds]);

  React.useEffect(() => {
    if (!activeId || !desktopNavRef.current) return;

    const nav = desktopNavRef.current;
    const activeLink = Array.from(
      nav.querySelectorAll<HTMLAnchorElement>("[data-toc-id]"),
    ).find((link) => link.dataset.tocId === activeId);

    if (!activeLink) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    if (linkRect.top >= navRect.top && linkRect.bottom <= navRect.bottom) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    nav.scrollTo({
      top: nav.scrollTop + linkRect.top - navRect.top - nav.clientHeight / 3,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [activeId]);

  React.useEffect(() => {
    if (!window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!itemIds.includes(id)) return;

    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
  }, [itemIds]);

  const handleItemClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const heading = document.getElementById(id);
      if (!heading) return;

      event.preventDefault();
      window.history.pushState(null, "", `#${encodeURIComponent(id)}`);
      heading.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      setActiveId(id);
      if (mobileDetailsRef.current) mobileDetailsRef.current.open = false;
    },
    [],
  );

  const list = () => (
    <ol className="relative border-l border-border py-1 text-sm">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id} className={item.level === 3 ? "ml-3" : undefined}>
            <a
              href={`#${item.id}`}
              data-toc-id={item.id}
              aria-current={active ? "location" : undefined}
              onClick={(event) => handleItemClick(event, item.id)}
              className={`relative flex min-h-11 items-center py-2 pl-4 pr-2 leading-5 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
                item.level === 3 ? "text-[0.8125rem]" : "text-sm"
              } ${
                active
                  ? "font-medium text-primary"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute -left-px top-2 bottom-2 w-0.5 rounded-full bg-primary transition-opacity motion-reduce:transition-none ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
              <span className="line-clamp-2">{item.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <details
        ref={mobileDetailsRef}
        className="group order-first min-w-0 rounded-2xl border border-border bg-surface lg:hidden"
      >
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
          <ListTree aria-hidden="true" className="size-4 text-primary" />
          <span>{mobileLabel}</span>
          <span className="text-sm font-normal text-foreground-secondary">
            ({items.length})
          </span>
          <ChevronDown
            aria-hidden="true"
            className="ml-auto size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <nav aria-label={mobileLabel} className="border-t border-border">
          <AutoHideScrollArea
            orientation="vertical"
            hideDelay={1600}
            viewportClassName="max-h-[50vh] px-4 py-3"
          >
            {list()}
          </AutoHideScrollArea>
        </nav>
      </details>

      <aside className="sticky top-24 hidden min-w-0 self-start overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-sm backdrop-blur lg:block">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <ListTree aria-hidden="true" className="size-4 text-primary" />
          <p className="text-sm font-semibold">{label}</p>
        </header>
        <nav aria-label={label}>
          <AutoHideScrollArea
            ref={desktopNavRef}
            orientation="vertical"
            hideDelay={1600}
            viewportClassName="max-h-[calc(100vh-8rem)] px-4 py-3"
          >
            {list()}
          </AutoHideScrollArea>
        </nav>
      </aside>
    </>
  );
}
