import * as React from "react";
import type { Metadata } from "next";

import { AboutPageView } from "@/features/about";
import { getTranslator } from "@/i18n/server";
import { buildPageMetadata } from "@/config/seo.config";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  const title = t("metadata.aboutTitle");
  const description = t("metadata.aboutDescription");
  return buildPageMetadata({ locale, path: "/about", title, description, keywords: ["Shanverse", "software engineer", "portfolio"] });
}

export default function AboutPage() {
  return <AboutPageView />;
}
