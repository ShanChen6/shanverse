import * as React from "react";
import type { Metadata } from "next";

import { ContactPageView, getContactConfig } from "@/features/contact";
import { isContactProviderConfigured } from "@/features/contact/adapters/contact-mailer";
import { getTranslator } from "@/i18n/server";

function siteUrl() {
  try {
    const url = new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    );
    return ["http:", "https:"].includes(url.protocol)
      ? url.origin
      : "http://localhost:3000";
  } catch {
    return "http://localhost:3000";
  }
}

const image = new URL("/logo/logo_shanverse.png", siteUrl()).toString();

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  const canonical = new URL(`/${locale}/contact`, siteUrl()).toString();
  const title = t("metadata.contactTitle");
  const description = t("metadata.contactDescription");
  return {
    title, description, alternates: { canonical, languages: { vi: "/vi/contact", en: "/en/contact" } },
    openGraph: { type: "website", url: canonical, title, description, images: [{ url: image, alt: "Shanverse" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function ContactPage() {
  return (
    <ContactPageView
      config={getContactConfig()}
      providerConfigured={isContactProviderConfigured()}
    />
  );
}
