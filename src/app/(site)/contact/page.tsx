import * as React from "react";
import type { Metadata } from "next";

import { ContactPageView, getContactConfig } from "@/features/contact";
import { isContactProviderConfigured } from "@/features/contact/adapters/contact-mailer";
import { getTranslator } from "@/i18n/server";
import { buildPageMetadata } from "@/config/seo.config";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getTranslator();
  const title = t("metadata.contactTitle");
  const description = t("metadata.contactDescription");
  return buildPageMetadata({ locale, path: "/contact", title, description });
}

export default function ContactPage() {
  return (
    <ContactPageView
      config={getContactConfig()}
      providerConfigured={isContactProviderConfigured()}
    />
  );
}
