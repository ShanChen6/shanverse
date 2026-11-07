import * as React from "react";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LayoutFrame } from "@/components/layout/LayoutFrame";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";

type LandingLayoutProps = {
  children: ReactNode;
};

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <LayoutFrame>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNavigation />
    </LayoutFrame>
  );
}
