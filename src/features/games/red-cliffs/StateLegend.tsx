"use client";

import * as React from "react";

import { useI18n } from "@/i18n/client";
import { Piece } from "./pieces";
import { DEFAULT_THEME, THEMES, THEME_EVENT, isThemeId, readStoredTheme, type ThemeId } from "./themes";

/**
 * The four states of a target, with their pictures, for the "how to play"
 * box. Follows the theme picked in the game (same page, separate tree), so
 * it listens for the game's theme event.
 */
export function StateLegend() {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  const [theme, setTheme] = React.useState<ThemeId>(DEFAULT_THEME);

  React.useEffect(() => {
    setTheme(readStoredTheme());
    const onTheme = (event: Event) => {
      const next = (event as CustomEvent<unknown>).detail;
      if (isThemeId(next)) setTheme(next);
    };
    window.addEventListener(THEME_EVENT, onTheme);
    return () => window.removeEventListener(THEME_EVENT, onTheme);
  }, []);

  const states = THEMES[theme].states;

  return (
    <div className="mt-5 border-t border-border pt-4">
      <h3 className="text-sm font-semibold">{t("games.rcLegendTitle")}</h3>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {[4, 3, 2, 1].map((strength) => {
          const name = states[strength - 1][lang];
          return (
            <li key={strength} className="flex items-center gap-2.5 rounded-xl border border-border bg-background/40 p-2">
              <span aria-hidden="true" className="rc-swatch" data-theme={theme}>
                <Piece theme={theme} strength={strength} />
              </span>
              <span className="min-w-0 text-xs leading-snug">
                <span className="block font-semibold text-foreground">{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                <span className="block text-muted">{strength === 1 ? t("games.rcLegendLast") : t("games.rcLegendHits", { n: strength })}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
