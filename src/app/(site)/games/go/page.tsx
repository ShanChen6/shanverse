import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { Go } from "@/features/games/go/Go";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("go");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.goTitle"),
    description: t("metadata.goDescription"),
    keywords: ["cờ vây", "go", "baduk", "weiqi", "KataGo", "Tianwu", "Shanverse"],
  });
}

export default async function GoPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.goTitle")}
      intro={t("games.goIntro")}
      description={t("metadata.goDescription")}
      genre="Board"
      steps={[t("games.goHowPlace"), t("games.goHowCapture"), t("games.goHowKo"), t("games.goHowEnd")]}
      savedNote={t("games.goSavedNote")}
    >
      <Go />
    </GamePageShell>
  );
}
