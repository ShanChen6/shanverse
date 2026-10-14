"use client";

import { useI18n } from "@/i18n/client";
import { ElementDot } from "./art";
import { ELEMENTS, ELEMENT_NAME } from "./monsters";

/** The rules reference under "how to play": elements, terrain and bonuses. */
export function Legend() {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  return (
    <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
      <section className="space-y-1.5">
        <h3 className="font-semibold">{t("games.blkLegendElements")}</h3>
        <p className="flex flex-wrap gap-x-3 gap-y-1">
          {ELEMENTS.map((element) => (
            <span key={element} className="inline-flex items-center gap-1">
              <ElementDot element={element} lang={lang} /> {ELEMENT_NAME[element][lang]}
            </span>
          ))}
        </p>
        <p className="text-foreground-secondary">{t("games.blkLegendKhac")}</p>
        <p className="text-foreground-secondary">{t("games.blkLegendSinh")}</p>
      </section>
      <section className="space-y-1.5">
        <h3 className="font-semibold">{t("games.blkLegendTerrain")}</h3>
        <ul className="space-y-1 text-foreground-secondary">
          {(["Mountain", "River", "Shrine", "Temple"] as const).map((k) => (
            <li key={k} className="flex gap-2">
              <span aria-hidden="true" className="blk-swatch mt-0.5 shrink-0" data-terrain={k.toLowerCase()} />
              <span>{t(`games.blkLegend${k}`)}</span>
            </li>
          ))}
        </ul>
        <h3 className="pt-1 font-semibold">{t("games.blkLegendLinhDia")}</h3>
        <ul className="space-y-1 text-foreground-secondary">
          {(["Ore", "Forest", "Marsh", "Lava", "Mound"] as const).map((k) => (
            <li key={k} className="flex gap-2">
              <span aria-hidden="true" className="blk-swatch mt-0.5 shrink-0" data-terrain={k.toLowerCase()} />
              <span>{t(`games.blkLegend${k}`)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-1.5">
        <h3 className="font-semibold">{t("games.blkLegendBonuses")}</h3>
        <ul className="list-disc space-y-1 pl-4 text-foreground-secondary">
          <li>{t("games.blkLegendAmbush")}</li>
          <li>{t("games.blkLegendPartner")}</li>
          <li>{t("games.blkLegendRival")}</li>
        </ul>
      </section>
    </div>
  );
}
