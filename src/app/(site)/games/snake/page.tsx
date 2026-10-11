import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { SnakeGame } from "@/features/games/snake/SnakeGame";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("snake");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.snakeTitle"),
    description: t("metadata.snakeDescription"),
    keywords: ["snake", "rắn săn mồi", "arcade", "Shanverse"],
  });
}

export default async function SnakeGamePage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.snakeTitle")}
      intro={t("games.snakeIntro")}
      description={t("metadata.snakeDescription")}
      genre="Arcade"
      steps={[
        t("games.snakeHowMove"),
        t("games.snakeHowGrow"),
        t("games.snakeHowPause"),
      ]}
      savedNote={t("games.snakeSavedNote")}
    >
      <SnakeGame />
    </GamePageShell>
  );
}
