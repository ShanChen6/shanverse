import * as React from "react";
import type { Metadata } from "next";

import { LandingLayout } from "@/components/layout/LandingLayout";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ComponentTestLayout({ children }: { children: React.ReactNode }) {
  return <LandingLayout>{children}</LandingLayout>;
}
