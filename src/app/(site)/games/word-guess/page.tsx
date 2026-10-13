import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { WordGuess } from "@/features/games/word-guess/WordGuess";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("word-guess");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.wordGuessTitle"),
    description: t("metadata.wordGuessDescription"),
    keywords: ["đoán từ", "word guess", "câu đố", "Tianwu", "Shanverse"],
  });
}

export default async function WordGuessPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.wordGuessTitle")}
      intro={t("games.wordGuessIntro")}
      description={t("metadata.wordGuessDescription")}
      genre="Puzzle"
      steps={[t("games.wgHowRead"), t("games.wgHowGuess"), t("games.wgHowHint"), t("games.wgHowWin")]}
      savedNote={t("games.wgSavedNote")}
    >
      <WordGuess />
    </GamePageShell>
  );
}
