import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
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
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title="2048"
      intro={t("games.game2048Intro")}
      description={t("metadata.game2048Description")}
      genre="Puzzle"
      steps={[
        t("games.howToMove"),
        t("games.howToMerge"),
        t("games.howToSpawn"),
        t("games.howToWin"),
        t("games.howToUndo"),
      ]}
      savedNote={t("games.savedNote")}
    >
      <Game2048 />
    </GamePageShell>
  );
}
