import * as React from "react";

import { DetailPageSkeleton } from "@/components/common/PageSkeletons";
import { getTranslator } from "@/i18n/server";

export default async function ContactLoading() {
  const { locale } = await getTranslator();
  return <DetailPageSkeleton label={locale === "vi" ? "Đang tải trang liên hệ" : "Loading contact page"} />;
}
