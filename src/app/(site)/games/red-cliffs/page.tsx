import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { RedCliffs } from "@/features/games/red-cliffs/RedCliffs";
import { StateLegend } from "@/features/games/red-cliffs/StateLegend";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("red-cliffs");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.redCliffsTitle"),
    description: t("metadata.redCliffsDescription"),
    keywords: ["red cliffs", "phản ứng dây chuyền", "chain reaction", "hoa đăng", "thiên thạch", "xích bích", "puzzle", "Shanverse"],
  });
}

export default async function RedCliffsPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.redCliffsTitle")}
      intro={t("games.redCliffsIntro")}
      description={t("metadata.redCliffsDescription")}
      genre="Puzzle"
      steps={[t("games.rcHowHit"), t("games.rcHowChain"), t("games.rcHowOrder"), t("games.rcHowWin")]}
      savedNote={t("games.rcSavedNote")}
      rulesExtra={<StateLegend />}
    >
      <RedCliffs />
    </GamePageShell>
  );
}
