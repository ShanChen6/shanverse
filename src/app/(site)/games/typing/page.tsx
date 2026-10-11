import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { TypingTest } from "@/features/games/typing/TypingTest";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("typing");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.typingTitle"),
    description: t("metadata.typingDescription"),
    keywords: ["typing test", "WPM", "gõ phím", "Shanverse"],
  });
}

export default async function TypingTestPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.typingTitle")}
      intro={t("games.typingIntro")}
      description={t("metadata.typingDescription")}
      genre="Typing"
      steps={[
        t("games.typingHowStart"),
        t("games.typingHowErrors"),
        t("games.typingHowCode"),
        t("games.typingHowWpm"),
      ]}
      savedNote={t("games.typingSavedNote")}
    >
      <TypingTest />
    </GamePageShell>
  );
}
