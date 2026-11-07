import * as React from "react";

import { ListPageSkeleton } from "@/components/common/PageSkeletons";
import { getTranslator } from "@/i18n/server";

export default async function GamesLoading() {
  const { t } = await getTranslator();
  return <ListPageSkeleton label={t("common.loadingGames")} />;
}
