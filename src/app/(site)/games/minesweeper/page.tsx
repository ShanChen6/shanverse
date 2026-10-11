import * as React from "react";
import type { Metadata } from "next";
import { ArrowLeft, Info } from "lucide-react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildAbsoluteUrl, buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { Minesweeper } from "@/features/games/minesweeper/Minesweeper";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("minesweeper");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.minesweeperTitle"),
    description: t("metadata.minesweeperDescription"),
    keywords: ["minesweeper", "dò mìn", "puzzle", "Shanverse"],
  });
}

export default async function MinesweeperPage() {
  const { locale, t } = await getTranslator();
  const title = t("games.minesweeperTitle");
  const steps = [
    t("games.msHowReveal"),
    t("games.msHowNumbers"),
    t("games.msHowFlag"),
    t("games.msHowChord"),
    t("games.msHowWin"),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: title,
          description: t("metadata.minesweeperDescription"),
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
            { label: title },
          ]}
        />
        <Link href={ROUTES.GAMES} className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary">
          <ArrowLeft aria-hidden="true" className="size-4" /> {t("games.back")}
        </Link>
      </div>

      <section aria-labelledby="game-title" className="space-y-6">
        <header className="space-y-2 text-center">
          <h1 id="game-title" className="brand-gradient-text text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mx-auto max-w-xl text-foreground-secondary">{t("games.minesweeperIntro")}</p>
        </header>
        <Minesweeper />
      </section>

      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-[minmax(0,1fr)_16rem]">
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
        <p className="flex h-fit gap-2 rounded-2xl border border-border bg-surface p-4 text-xs leading-relaxed text-muted">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {t("games.msSavedNote")}
        </p>
      </div>
    </div>
  );
}
