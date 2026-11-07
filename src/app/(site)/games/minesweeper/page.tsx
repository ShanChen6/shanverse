import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
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
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.minesweeperTitle")}
      intro={t("games.minesweeperIntro")}
      description={t("metadata.minesweeperDescription")}
      genre="Puzzle"
      steps={[
        t("games.msHowReveal"),
        t("games.msHowNumbers"),
        t("games.msHowFlag"),
        t("games.msHowChord"),
        t("games.msHowWin"),
      ]}
      savedNote={t("games.msSavedNote")}
    >
      <Minesweeper />
    </GamePageShell>
  );
}
