"use client";

import { useI18n } from "@/i18n/client";
import { ElementDot } from "./art";
import { CYCLE_SRC, fxSrc, pairSrc } from "./assets";
import { ELEMENTS, ELEMENT_NAME, PARTNERS, RIVALS, monster } from "./monsters";

/** The rules reference under "how to play": elements, terrain and bonuses. */
export function Legend() {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  return (
    <div className="mt-4 grid gap-4 text-sm @2xl:grid-cols-3">
      <section className="space-y-1.5">
        <h3 className="font-semibold">{t("games.blkLegendElements")}</h3>
        <p className="flex flex-wrap gap-x-3 gap-y-1">
          {ELEMENTS.map((element) => (
            <span key={element} className="inline-flex items-center gap-1">
              <ElementDot element={element} lang={lang} /> {ELEMENT_NAME[element][lang]}
            </span>
          ))}
        </p>
        <img src={CYCLE_SRC} alt="" width={640} height={640} className="mx-auto w-full max-w-56" loading="lazy" decoding="async" />
        <p className="flex items-start gap-2 text-foreground-secondary">
          <img src={fxSrc("counter")} alt="" className="size-8 shrink-0 rounded-full bg-surface-hover" loading="lazy" />
          <span>{t("games.blkLegendKhac")}</span>
        </p>
        <p className="flex items-start gap-2 text-foreground-secondary">
          <img src={fxSrc("feed")} alt="" className="size-8 shrink-0 rounded-full bg-surface-hover" loading="lazy" />
          <span>{t("games.blkLegendSinh")}</span>
        </p>
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
        <ul className="grid grid-cols-2 gap-2 pt-1">
          {[...PARTNERS, ...RIVALS].map(([a, b]) => {
            const src = pairSrc(a, b);
            const names = `${monster(a).name[lang]} · ${monster(b).name[lang]}`;
            return src ? (
              <li key={`${a}-${b}`} className="space-y-1">
                <img src={src} alt={names} width={960} height={540} className="aspect-video w-full rounded-control object-cover" loading="lazy" decoding="async" />
                <p className="text-xs leading-tight text-muted">{names}</p>
              </li>
            ) : null;
          })}
        </ul>
      </section>
    </div>
  );
}
