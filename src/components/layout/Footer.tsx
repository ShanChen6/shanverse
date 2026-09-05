import * as React from "react";
import Link from "next/link";
import { NAVIGATION_ITEMS } from "@/constants/navigation";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/70">
      <div className="container mx-auto flex flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:py-10">
        <div className="space-y-2">
          <p className="text-label-medium text-primary-600 uppercase tracking-[0.22em]">
            Shan Kinh Can
          </p>
          <p className="text-body-small-regular max-w-xl text-foreground-secondary md:text-body-medium-regular">
            Full-stack engineering notes on web architecture, AI workflows, and
            practical product building.
          </p>
        </div>

        <nav aria-label="Footer quick links" className="flex flex-wrap gap-3">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-small-medium inline-flex items-center rounded-full border border-border bg-background px-3 py-2 text-foreground-secondary transition-colors hover:border-primary/50 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border/80">
        <div className="text-small-regular container mx-auto flex flex-col gap-2 px-4 py-4 text-foreground-secondary md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Shan Kinh Can. All rights reserved.
          </p>
          <p>Built with Next.js 16, TypeScript, and a token-first theme.</p>
        </div>
      </div>
    </footer>
  );
}
