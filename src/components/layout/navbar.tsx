"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

export interface NavItem {
  href: string;
  label: string;
}

export interface NavbarProps {
  items: NavItem[];
  brand?: React.ReactNode;
  className?: string;
  rightSlot?: React.ReactNode;
}

export function Navbar({ items, brand, className, rightSlot }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur",
        className,
      )}
    >
      <div className="container mx-auto grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
        <div className="flex items-center">
          <div className="font-heading text-lg font-bold tracking-tight text-foreground leading-none">
            {brand ?? <Link href="/">Shanverse</Link>}
          </div>
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden items-center justify-center gap-1 md:flex"
        >
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-surface text-foreground"
                    : "text-foreground-secondary hover:bg-surface hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {rightSlot ? (
          <div className="flex items-center justify-end gap-2">{rightSlot}</div>
        ) : null}
      </div>
    </header>
  );
}
export default Navbar;
