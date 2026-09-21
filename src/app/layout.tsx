import React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { I18nProvider } from "@/i18n/client";
import { getLocale, getTranslator } from "@/i18n/server";
import { getMessages } from "@/i18n/messages";
import { getSocialLinks } from "@/config/social.config";
import { RuntimeConfigProvider } from "@/providers/RuntimeConfigProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildAbsoluteUrl, SEO_CONFIG } from "@/config/seo.config";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    metadataBase: new URL(SEO_CONFIG.siteUrl),
    title: { default: t("metadata.homeTitle"), template: SEO_CONFIG.titleTemplate },
    description: t("metadata.homeDescription"),
    applicationName: SEO_CONFIG.siteName,
    authors: [{ name: SEO_CONFIG.author }], creator: SEO_CONFIG.author, publisher: SEO_CONFIG.siteName,
    alternates: { types: { "application/rss+xml": buildAbsoluteUrl("/rss.xml") } },
    openGraph: { siteName: SEO_CONFIG.siteName, type: "website", images: [{ url: buildAbsoluteUrl(SEO_CONFIG.defaultOpenGraphImage), width: 1200, height: 630, alt: SEO_CONFIG.siteName }] },
    twitter: { card: "summary_large_image", images: [buildAbsoluteUrl(SEO_CONFIG.defaultOpenGraphImage)] },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const socialLinks = getSocialLinks();
  const currentYear = new Date().getUTCFullYear();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="alternate" type="application/rss+xml" title="Shanverse Blog RSS" href={buildAbsoluteUrl("/rss.xml")} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
          disableTransitionOnChange
        >
          <RuntimeConfigProvider value={{ socialLinks, currentYear }}>
            <I18nProvider locale={locale} messages={getMessages(locale)}>
              <JsonLd data={[{ "@context": "https://schema.org", "@type": "WebSite", name: SEO_CONFIG.siteName, url: SEO_CONFIG.siteUrl, description: SEO_CONFIG.defaultDescription, inLanguage: ["vi-VN", "en"] }, { "@context": "https://schema.org", "@type": "Person", name: SEO_CONFIG.author, url: SEO_CONFIG.siteUrl, sameAs: SEO_CONFIG.socialLinks }]} />
              {children}
            </I18nProvider>
          </RuntimeConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
