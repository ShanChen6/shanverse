"use client";

/* Notched bottom tab bar based on Lucian UX/UI Prompt #041 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#041 */

import * as React from "react";
import { Ellipsis } from "lucide-react";
import { usePathname } from "next/navigation";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { isActiveRoute, MOBILE_MORE_ITEMS, MOBILE_TAB_ITEMS } from "@/constants/navigation";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";

import styles from "./MobileBottomNavigation.module.css";

const TAB_COUNT = MOBILE_TAB_ITEMS.length + 1;
const MORE_INDEX = MOBILE_TAB_ITEMS.length;

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const rootRef = React.useRef<HTMLElement>(null);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const tabRefs = React.useRef<(HTMLElement | null)[]>([]);
  const motion = React.useRef({ x: 0, v: 0, raf: 0, ready: false });

  const tabIndex = MOBILE_TAB_ITEMS.findIndex((item) => isActiveRoute(pathname, item.href));
  const moreActive = MOBILE_MORE_ITEMS.some((item) => isActiveRoute(pathname, item.href));
  const activeIndex = tabIndex >= 0 ? tabIndex : moreActive ? MORE_INDEX : -1;

  // Slide the notch and bubble to the active tab with the same spring as the original.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || activeIndex < 0) return;
    const m = motion.current;
    const centre = () => {
      const li = itemRefs.current[activeIndex];
      return li ? li.offsetLeft + li.offsetWidth / 2 : 0;
    };
    const apply = () => root.style.setProperty("--x", `${m.x.toFixed(2)}px`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = centre();

    const snap = () => {
      cancelAnimationFrame(m.raf);
      m.raf = 0;
      target = centre();
      m.x = target;
      m.v = 0;
      apply();
    };
    const step = () => {
      const a = (target - m.x) * 0.16 - m.v * 0.42;
      m.v += a;
      m.x += m.v;
      apply();
      if (Math.abs(target - m.x) > 0.3 || Math.abs(m.v) > 0.3) m.raf = requestAnimationFrame(step);
      else snap();
    };

    if (reduced || !m.ready) snap();
    else if (!m.raf) m.raf = requestAnimationFrame(step);
    m.ready = true;

    const observer = new ResizeObserver(snap);
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(m.raf);
      m.raf = 0;
    };
  }, [activeIndex]);

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      tabRefs.current[event.key === "Home" ? 0 : TAB_COUNT - 1]?.focus();
    } else if (delta) {
      event.preventDefault();
      tabRefs.current[(index + delta + TAB_COUNT) % TAB_COUNT]?.focus();
    }
  }

  const iconProps = { "aria-hidden": true, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

  return (
    <nav
      ref={rootRef}
      aria-label={t("navigation.mobile")}
      className={cn(styles.u041, "md:hidden")}
      data-idle={activeIndex < 0}
      style={{ "--i": Math.max(activeIndex, 0) } as React.CSSProperties}
    >
      <span className={styles.shadow} aria-hidden="true" />
      <span className={styles.bar} aria-hidden="true" />
      <span className={styles.bubble} aria-hidden="true" />
      <ul className={styles.tabs}>
        {MOBILE_TAB_ITEMS.map((item, index) => {
          const active = index === activeIndex;
          const Icon = item.icon;
          return (
            <li key={item.href} ref={(el) => { itemRefs.current[index] = el; }}>
              <Link
                ref={(el: HTMLAnchorElement | null) => { tabRefs.current[index] = el; }}
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-active={active}
                className={styles.tab}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <span className={styles.icon} aria-hidden="true"><Icon {...iconProps} /></span>
                <span className={styles.label}>{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
        <li ref={(el) => { itemRefs.current[MORE_INDEX] = el; }}>
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                ref={(el) => { tabRefs.current[MORE_INDEX] = el; }}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={moreOpen}
                aria-current={moreActive ? "page" : undefined}
                data-active={moreActive}
                className={styles.tab}
                onKeyDown={(event) => onKeyDown(event, MORE_INDEX)}
              >
                <span className={styles.icon} aria-hidden="true"><Ellipsis {...iconProps} /></span>
                <span className={styles.label}>{t("navigation.more")}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <SheetTitle>{t("navigation.moreTitle")}</SheetTitle>
              <SheetDescription className="sr-only">{t("navigation.moreDescription")}</SheetDescription>
              <ul className="mt-4 grid gap-2">
                {MOBILE_MORE_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-12 items-center gap-3 rounded-xl border border-border px-4 text-base font-medium transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary",
                            active && "bg-surface-selected font-semibold text-primary",
                          )}
                        >
                          <Icon aria-hidden="true" className="size-5" />
                          {t(item.labelKey)}
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
