import * as React from "react";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type LandingLayoutProps = {
  children: ReactNode;
};

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
