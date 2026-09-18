import * as React from "react";
import { Suspense } from "react";
import { BrandLogo } from "./BrandLogo";
import { DesktopNavigation } from "./DesktopNavigation";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function Header() {
  return (
    <>
      <header className="border-b border-border bg-background md:hidden">
        <div className="mx-auto flex h-14 items-center justify-between gap-3 px-4">
          <BrandLogo priority />
          <div className="flex items-center gap-2"><Suspense fallback={null}><LanguageSwitcher compact /></Suspense><ThemeToggle /></div>
        </div>
      </header>

      <header className="sticky top-0 z-40 hidden border-b border-border bg-background/90 backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <BrandLogo priority />
          <DesktopNavigation />
          <div className="flex items-center gap-2"><Suspense fallback={null}><LanguageSwitcher /></Suspense><ThemeToggle /></div>
        </div>
      </header>
    </>
  );
}
