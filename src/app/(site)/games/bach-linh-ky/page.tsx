import * as React from "react";
import type { Metadata } from "next";

import { buildPageMetadata } from "@/config/seo.config";
import { ROUTES } from "@/constants/routes";
import { BachLinhKy } from "@/features/games/bach-linh-ky/BachLinhKy";
import { Legend } from "@/features/games/bach-linh-ky/Legend";
import { MAX_TURNS } from "@/features/games/bach-linh-ky/rules";
import { GamePageShell } from "@/features/games/components/GamePageShell";
import { getTranslator } from "@/i18n/server";

const PATH = ROUTES.GAME_DETAIL("bach-linh-ky");

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({
    locale,
    path: PATH,
    title: t("metadata.bachLinhKyTitle"),
    description: t("metadata.bachLinhKyDescription"),
    keywords: ["bách linh kỳ", "cờ thần thoại", "thần thoại việt nam", "ngũ hành", "capsule monster chess", "strategy", "Shanverse"],
  });
}

export default async function BachLinhKyPage() {
  const { t } = await getTranslator();
  return (
    <GamePageShell
      path={PATH}
      title={t("games.bachLinhKyTitle")}
      intro={t("games.bachLinhKyIntro")}
      description={t("metadata.bachLinhKyDescription")}
      genre="Strategy"
      steps={[t("games.blkHowTeam"), t("games.blkHowPlace"), t("games.blkHowTurn"), t("games.blkHowFight"), t("games.blkHowWin", { max: MAX_TURNS })]}
      savedNote={t("games.blkSavedNote")}
      rulesExtra={<Legend />}
    >
      <BachLinhKy />
    </GamePageShell>
  );
}
