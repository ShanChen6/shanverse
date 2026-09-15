import * as React from "react";
import type { Metadata } from "next";

import { ContactPageView, getContactConfig } from "@/features/contact";
import { isContactProviderConfigured } from "@/features/contact/adapters/contact-mailer";

const description =
  "Liên hệ với Shan để trao đổi về Frontend, sản phẩm, cơ hội hợp tác và các chủ đề công nghệ.";

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

const canonical = new URL("/contact", siteUrl()).toString();
const image = new URL("/logo/logo_shanverse.png", siteUrl()).toString();

export const metadata: Metadata = {
  title: "Contact | Shanverse",
  description,
  alternates: { canonical },
  openGraph: {
    type: "website",
    url: canonical,
    title: "Contact | Shanverse",
    description,
    images: [{ url: image, alt: "Shanverse" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Shanverse",
    description,
    images: [image],
  },
};

export default function ContactPage() {
  return (
    <ContactPageView
      config={getContactConfig()}
      providerConfigured={isContactProviderConfigured()}
    />
  );
}
