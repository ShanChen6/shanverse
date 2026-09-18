import * as React from "react";
import type { Metadata } from "next";
import { HomePageView } from "@/features/home";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  return {
    title: t("metadata.homeTitle"),
    description: t("metadata.homeDescription"),
    alternates: {
      canonical: `/${locale}`,
      languages: { vi: "/vi", en: "/en" },
    },
  };
}

export default function Home() {
  return <HomePageView />;
}
