import * as React from "react";
import { BrandLogo } from "./BrandLogo";
import { DesktopNavigation } from "./DesktopNavigation";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <>
      <header className="border-b border-border bg-background md:hidden">
        <div className="mx-auto flex h-14 items-center justify-between gap-3 px-4">
          <BrandLogo priority />
          <ThemeToggle />
        </div>
      </header>

      <header className="sticky top-0 z-40 hidden border-b border-border bg-background/90 backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <BrandLogo priority />
          <DesktopNavigation />
          <ThemeToggle />
        </div>
      </header>
    </>
  );
}
