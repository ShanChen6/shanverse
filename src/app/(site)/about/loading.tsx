import * as React from "react";

import { DetailPageSkeleton } from "@/components/common/PageSkeletons";
import { getTranslator } from "@/i18n/server";

export default async function AboutLoading() {
  const { locale } = await getTranslator();
  return <DetailPageSkeleton label={locale === "vi" ? "Đang tải trang giới thiệu" : "Loading about page"} />;
}
