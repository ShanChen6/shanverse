import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { MemoryMatch } from "@/features/games/memory/MemoryMatch";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("memory");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.memoryTitle"),
    description: t("metadata.memoryDescription"),
    keywords: ["memory game", "lật thẻ", "React", "Shanverse"],
  });
}

export default async function MemoryMatchPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.memoryTitle")}
      intro={t("games.memoryIntro")}
      description={t("metadata.memoryDescription")}
      genre="Puzzle"
      steps={[
        t("games.memoryHowFlip"),
        t("games.memoryHowMatch"),
        t("games.memoryHowWin"),
      ]}
      savedNote={t("games.memorySavedNote")}
    >
      <MemoryMatch />
    </GamePageShell>
  );
}
