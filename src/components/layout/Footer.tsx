"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Rss } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/constants/navigation";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/70">
      <div className="container mx-auto grid gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-14">
        <div className="space-y-4">
          <Link href={"/"} className="inline-flex items-center gap-2">
            <Image
              src="/logo/logo_shanverse.png"
              alt="ShanDev logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="text-lg font-bold tracking-tight text-foreground">
              ShanDev<span className="text-primary">.</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-foreground-secondary">
            Engineering notes, AI workflows, and practical ideas for building
            useful products on the modern web.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Shan Kinh Can. All rights reserved.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Navigation
          </h2>
          <nav
            aria-label="Footer navigation"
            className="flex flex-col items-start gap-3"
          >
            {NAVIGATION_ITEMS.filter((item) => item.label !== "Components").map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-foreground-secondary transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Explore
          </h2>
          <nav
            aria-label="Popular categories"
            className="flex flex-col items-start gap-3"
          >
            {[
              { label: "Frontend", href: "/blog?category=frontend" },
              { label: "Backend", href: "/blog?category=backend" },
              { label: "System Design", href: "/blog?category=system-design" },
              { label: "AI & Workflow", href: "/blog?category=ai-workflow" },
              { label: "Career", href: "/blog?category=career" },
            ].map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="text-sm text-foreground-secondary transition-colors hover:text-primary"
              >
                {category.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Elsewhere
          </h2>
          <div className="flex flex-col items-start gap-3">
            <Link
              href="/rss.xml"
              className="inline-flex items-center gap-2 text-sm text-foreground-secondary transition-colors hover:text-primary"
            >
              <Rss className="h-4 w-4" /> RSS Feed
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-2 text-sm text-foreground-secondary transition-colors hover:text-primary"
            >
              <ArrowUp className="h-4 w-4" /> Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
