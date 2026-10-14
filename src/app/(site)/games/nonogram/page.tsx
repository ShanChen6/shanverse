import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { Nonogram } from "@/features/games/nonogram/Nonogram";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("nonogram");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.nonogramTitle"),
    description: t("metadata.nonogramDescription"),
    keywords: ["nonogram", "picross", "griddler", "tô ô số", "puzzle", "Tianwu", "Shanverse"],
  });
}

export default async function NonogramPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.nonogramTitle")}
      intro={t("games.nonogramIntro")}
      description={t("metadata.nonogramDescription")}
      genre="Puzzle"
      steps={[t("games.ngHowClues"), t("games.ngHowMark"), t("games.ngHowFeedback"), t("games.ngHowHints")]}
      savedNote={t("games.ngSavedNote")}
    >
      <Nonogram />
    </GamePageShell>
  );
}
