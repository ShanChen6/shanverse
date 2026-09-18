import * as React from "react";

import { LandingLayout } from "@/components/layout/LandingLayout";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <LandingLayout>{children}</LandingLayout>;
}
