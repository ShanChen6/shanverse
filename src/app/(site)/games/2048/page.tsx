import * as React from "react";
import type { Metadata } from "next";
import { ArrowLeft, Info } from "lucide-react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildAbsoluteUrl, buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { Game2048 } from "@/features/games/game-2048/Game2048";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("2048");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.game2048Title"),
    description: t("metadata.game2048Description"),
    keywords: ["2048", "2048 game", "puzzle", "Shanverse"],
  });
}

export default async function Game2048Page() {
  const { locale, t } = await getTranslator();
  const steps = [
    t("games.howToMove"),
    t("games.howToMerge"),
    t("games.howToSpawn"),
    t("games.howToWin"),
    t("games.howToUndo"),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: "2048",
          description: t("metadata.game2048Description"),
          url: buildAbsoluteUrl(`/${locale}${PATH}`),
          genre: "Puzzle",
          gamePlatform: "Web browser",
          applicationCategory: "Game",
          operatingSystem: "Any",
          author: { "@type": "Person", name: "Shanverse" },
        }}
      />
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: t("common.home"), href: ROUTES.HOME },
            { label: t("common.games"), href: ROUTES.GAMES },
            { label: "2048" },
          ]}
        />
        <Link href={ROUTES.GAMES} className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">
          <ArrowLeft aria-hidden="true" className="size-4" /> {t("games.back")}
        </Link>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,32rem)_20rem] lg:justify-center lg:gap-12">
        <section aria-labelledby="game-title" className="space-y-6">
          <header className="space-y-2 text-center lg:text-left">
            <h1 id="game-title" className="brand-gradient-text text-5xl font-extrabold tracking-tight sm:text-6xl">2048</h1>
            <p className="text-foreground-secondary">{t("games.game2048Intro")}</p>
          </header>
          <Game2048 />
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-semibold">{t("games.howToPlay")}</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-foreground-secondary">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="flex gap-2 rounded-2xl border border-border bg-surface p-4 text-xs leading-relaxed text-muted">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {t("games.savedNote")}
          </p>
        </aside>
      </div>
    </div>
  );
}
