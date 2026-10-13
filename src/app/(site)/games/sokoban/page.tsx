import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { Sokoban } from "@/features/games/sokoban/Sokoban";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("sokoban");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.sokobanTitle"),
    description: t("metadata.sokobanDescription"),
    keywords: ["sokoban", "đẩy thùng", "puzzle", "Tianwu", "Shanverse"],
  });
}

export default async function SokobanPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.sokobanTitle")}
      intro={t("games.sokobanIntro")}
      description={t("metadata.sokobanDescription")}
      genre="Puzzle"
      steps={[t("games.skHowMove"), t("games.skHowPush"), t("games.skHowUndo"), t("games.skHowWin")]}
      savedNote={t("games.skSavedNote")}
    >
      <Sokoban />
    </GamePageShell>
  );
}
