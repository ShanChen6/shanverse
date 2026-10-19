import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { CoLau } from "@/features/games/co-lau/CoLau";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("co-lau");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.coLauTitle"),
    description: t("metadata.coLauDescription"),
    keywords: ["cờ lau", "co lau", "match-3", "loạn 12 sứ quân", "đinh bộ lĩnh", "ngũ hành", "Tianwu", "Shanverse"],
  });
}

export default async function CoLauPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.coLauTitle")}
      intro={t("games.coLauIntro")}
      description={t("metadata.coLauDescription")}
      genre="Puzzle"
      steps={[t("games.clHowMatch"), t("games.clHowTurn"), t("games.clHowSkills"), t("games.clHowWin")]}
      savedNote={t("games.clSavedNote")}
    >
      <CoLau />
    </GamePageShell>
  );
}
