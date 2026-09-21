import * as React from "react";
import type { Metadata } from "next";
import { HomePageView } from "@/features/home";
import { getTranslator } from "@/i18n/server";
import { buildPageMetadata } from "@/config/seo.config";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return buildPageMetadata({ locale, path: "", title: t("metadata.homeTitle"), description: t("metadata.homeDescription"), keywords: ["software development", "frontend", "backend", "system design"] });
}

export default function Home() {
  return <HomePageView />;
}
