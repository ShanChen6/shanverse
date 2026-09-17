import React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { I18nProvider } from "@/i18n/client";
import { getLocale, getTranslator } from "@/i18n/server";
import { getMessages } from "@/i18n/messages";
import { getSocialLinks } from "@/config/social.config";
import { RuntimeConfigProvider } from "@/providers/RuntimeConfigProvider";
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
  return { title: t("metadata.homeTitle"), description: t("metadata.homeDescription") };
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RuntimeConfigProvider value={{ socialLinks, currentYear }}>
            <I18nProvider locale={locale} messages={getMessages(locale)}>
              {children}
            </I18nProvider>
          </RuntimeConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
