import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { CoVietNam, PieceLegend } from "@/features/games/co-viet-nam/CoVietNam";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("co-viet-nam");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.cvnTitle"),
    description: t("metadata.cvnDescription"),
    keywords: ["Cờ Việt Nam", "strategy board game", "war game", "two player", "Tianwu", "Shanverse"],
  });
}

export default async function CoVietNamPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.cvnTitle")}
      intro={t("games.cvnIntro")}
      description={t("metadata.cvnDescription")}
      genre="Strategy"
      steps={[t("games.cvnHowTurn"), t("games.cvnHowTerrain"), t("games.cvnHowCapture"), t("games.cvnHowCarry"), t("games.cvnHowAir"), t("games.cvnHowWin")]}
      savedNote={t("games.cvnSavedNote")}
      rulesExtra={<PieceLegend />}
    >
      <CoVietNam />
    </GamePageShell>
  );
}
