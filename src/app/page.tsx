import * as React from "react";
import type { Metadata } from "next";
import { HomePageView } from "@/features/home";

export const metadata: Metadata = {
  title: "Shanverse",
  description:
    "Blog công nghệ và portfolio của Shan, tập trung vào Frontend, React, Next.js, TypeScript và phát triển phần mềm.",
};

export default function Home() {
  return <HomePageView />;
}
