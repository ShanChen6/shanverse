import * as React from "react";
import { Suspense } from "react";
import { BrandLogo } from "./BrandLogo";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileTopBar } from "./MobileTopBar";
import { ThemeToggle } from "./theme-toggle";
import { SearchDialog } from "@/features/search/components/SearchDialog";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function Header() {
  return (
    <>
      <MobileTopBar>
        <div className="mx-auto flex h-14 items-center justify-between gap-3 px-4">
          <BrandLogo priority />
          {/* The language switch sits in the footer on phones. */}
          <div className="flex items-center gap-1"><SearchDialog /><ThemeToggle /></div>
        </div>
      </MobileTopBar>

      <header className="sticky top-0 z-40 hidden border-b border-border bg-background/90 backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-6 lg:px-8">
          <BrandLogo priority />
          <DesktopNavigation />
          <div className="flex items-center gap-1"><SearchDialog /><Suspense fallback={null}><LanguageSwitcher /></Suspense><ThemeToggle /></div>
        </div>
      </header>
    </>
  );
}
