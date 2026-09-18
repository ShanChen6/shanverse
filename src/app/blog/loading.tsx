import * as React from "react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { ListPageSkeleton } from "@/components/common/PageSkeletons";
import { getTranslator } from "@/i18n/server";

export default async function BlogLoading() {
  const { locale } = await getTranslator();
  return <LandingLayout><ListPageSkeleton label={locale === "vi" ? "Đang tải danh sách bài viết" : "Loading articles"} /></LandingLayout>;
}
