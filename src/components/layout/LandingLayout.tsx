import * as React from "react";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";

type LandingLayoutProps = {
  children: ReactNode;
};

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-clip bg-background pb-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom))] text-foreground md:pb-0">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNavigation />
    </div>
  );
}
