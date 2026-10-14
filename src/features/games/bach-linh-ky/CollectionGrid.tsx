"use client";

import * as React from "react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { ElementDot, Token } from "./art";
import { LOSSES_PER_SUMMON, type Collection as CollectionData } from "./collection";
import { MonsterInfo } from "./MonsterInfo";
import { ELEMENTS, ELEMENT_NAME, LEVELS, MONSTERS, monster } from "./monsters";

/**
 * All 50 monsters laid out by element (columns) and level (rows). Owned ones
 * are in colour and open their card; the rest are grey silhouettes showing
 * only their level.
 */
export function CollectionGrid({ collection }: { collection: CollectionData }) {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  const [picked, setPicked] = React.useState<string | null>(null);
  const owned = new Set(collection.owned);
  const lossesLeft = LOSSES_PER_SUMMON - collection.lossStreak;
  const pickedOwned = picked !== null && owned.has(picked);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold">{t("games.blkOwned", { n: owned.size, total: MONSTERS.length })}</span>
          <span className="text-foreground-secondary">{t("games.blkRecord", { w: collection.wins, l: collection.losses })}</span>
          <span className="text-muted">{owned.size === MONSTERS.length ? t("games.blkComplete") : t("games.blkNextSummon", { n: lossesLeft })}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-hover" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${(owned.size / MONSTERS.length) * 100}%` }} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-separate border-spacing-1.5">
            <thead>
              <tr>
                <th className="w-14" />
                {ELEMENTS.map((element) => (
                  <th key={element} scope="col" className="text-xs font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <ElementDot element={element} lang={lang} /> {ELEMENT_NAME[element][lang]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((level) => (
                <tr key={level}>
                  <th scope="row" className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {t("games.blkLevel", { n: level })}
                  </th>
                  {ELEMENTS.map((element) => (
                    <td key={element} className="rounded-xl bg-surface-hover/50 p-1">
                      <div className="flex justify-center gap-1">
                        {MONSTERS.filter((m) => m.level === level && m.element === element).map((m) => {
                          const has = owned.has(m.id);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              aria-pressed={picked === m.id}
                              aria-label={has ? m.name[lang] : t("games.blkLockedLabel", { n: level })}
                              onClick={() => setPicked(m.id)}
                              className={cn(
                                "rounded-full transition-transform focus-visible:ring-2 focus-visible:ring-primary",
                                picked === m.id ? "scale-110 ring-2 ring-primary" : "hover:scale-105",
                              )}
                            >
                              <Token monsterId={m.id} level={m.level} side={0} locked={!has} className="size-11 sm:size-12" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <aside className="rounded-2xl border border-border bg-surface p-4" aria-live="polite">
        {picked === null ? (
          <p className="text-sm text-muted">{t("games.blkCollectionHint")}</p>
        ) : pickedOwned ? (
          <MonsterInfo monsterId={picked} />
        ) : (
          <div className="flex items-start gap-3">
            <Token monsterId={picked} level={monster(picked).level} side={0} locked className="size-14 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">{t("games.blkLockedLabel", { n: monster(picked).level })}</p>
              <p className="text-sm text-foreground-secondary">{t("games.blkLockedHint")}</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
