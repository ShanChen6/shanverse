import * as React from "react";

import { LandingLayout } from "@/components/layout/LandingLayout";

export default function ComponentTestLayout({ children }: { children: React.ReactNode }) {
  return <LandingLayout>{children}</LandingLayout>;
}
