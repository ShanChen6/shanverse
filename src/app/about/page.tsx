import * as React from "react";
import type { Metadata } from "next";

import { AboutPageView, getAboutStats } from "@/features/about";

const description =
  "Tìm hiểu về Shan, hành trình phát triển Frontend, những công nghệ đang học hỏi và câu chuyện phía sau Shanverse.";

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

const canonical = new URL("/about", siteUrl()).toString();
const image = new URL("/logo/logo_shanverse.png", siteUrl()).toString();

export const metadata: Metadata = {
  title: "About | Shanverse",
  description,
  alternates: { canonical },
  openGraph: {
    type: "website",
    url: canonical,
    title: "About | Shanverse",
    description,
    images: [{ url: image, alt: "Shanverse" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Shanverse",
    description,
    images: [image],
  },
};

export default async function AboutPage() {
  const stats = await getAboutStats();
  return <AboutPageView stats={stats} />;
}
