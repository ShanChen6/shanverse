import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ArrowRight, Download } from "lucide-react";

import { Tianwu } from "@/components/mascot/Tianwu";
import { TIANWU_STICKERS } from "@/components/mascot/stickers";
import { ROUTES } from "@/constants/routes";
import { getTranslator } from "@/i18n/server";

export async function TianwuStorySection() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="tianwu-heading" className="space-y-4">
      <div className="grid items-center gap-8 overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
        <div className="tw-sky relative mx-auto w-56 rounded-3xl p-6 sm:w-64 lg:w-full">
          <Tianwu pose="wave" className="tw-sway relative h-auto w-full" title={t("mascot.artWaving")} />
        </div>
        <div className="space-y-4 leading-8 text-foreground-secondary">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("mascot.storyEyebrow")}</p>
          <h2 id="tianwu-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t("mascot.storyTitle")}</h2>
          <p>{t("mascot.storyFirst")}</p>
          <details className="group">
            <summary className="inline-flex min-h-10 cursor-pointer items-center rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">{t("mascot.storyMore")}</summary>
            <div className="mt-3 space-y-4">
              <p>{t("mascot.storySecond")}</p>
              <p>{t("mascot.storyThird")}</p>
            </div>
          </details>
          <blockquote className="border-l-4 border-[#D9AF62] pl-4 text-lg font-semibold text-foreground">{t("mascot.storyMotto")}</blockquote>
          <Link href={ROUTES.GAME_DETAIL("sokoban")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">
            {t("mascot.storyPlay")} <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>

      <details className="rounded-card border border-border bg-surface p-4 sm:p-5">
        <summary id="tianwu-stickers-heading" className="flex min-h-10 cursor-pointer items-center justify-between gap-3 text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-primary">{t("mascot.stickersTitle")}</summary>
        <div className="mt-4 space-y-4">
          <p className="text-sm text-foreground-secondary">{t("mascot.stickersDescription")}</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TIANWU_STICKERS.map((sticker) => {
            const name = t(sticker.labelKey);
            return (
              <li key={sticker.id}>
                <a
                  href={sticker.href}
                  download
                  aria-label={t("mascot.stickerDownload", { name })}
                  className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-sm font-medium transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <img src={sticker.href} alt="" loading="lazy" className="h-24 w-full object-contain transition-transform group-hover:-rotate-3 group-hover:scale-105" />
                  <span className="inline-flex items-center gap-1.5 text-foreground-secondary group-hover:text-primary">
                    <Download aria-hidden="true" className="size-4" /> {name}
                  </span>
                </a>
              </li>
            );
          })}
          </ul>
        </div>
      </details>
    </section>
  );
}
