import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { TowerOfHanoi } from "@/features/games/hanoi/TowerOfHanoi";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("hanoi");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.hanoiTitle"),
    description: t("metadata.hanoiDescription"),
    keywords: ["tower of hanoi", "tháp hà nội", "puzzle", "Shanverse"],
  });
}

export default async function TowerOfHanoiPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.hanoiTitle")}
      intro={t("games.hanoiIntro")}
      description={t("metadata.hanoiDescription")}
      genre="Puzzle"
      steps={[t("games.hanoiHowPick"), t("games.hanoiHowRule"), t("games.hanoiHowWin"), t("games.hanoiHowHelp")]}
      savedNote={t("games.hanoiSavedNote")}
    >
      <TowerOfHanoi />
    </GamePageShell>
  );
}
