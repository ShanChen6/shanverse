"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { BrandLogo } from "./BrandLogo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isActiveRoute, NAVIGATION_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/cn";

export function MobileNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[min(88vw,22rem)] flex-col overflow-y-auto p-0">
        <SheetHeader className="flex-row items-center justify-between border-b border-border p-4 text-left">
          <SheetTitle asChild><BrandLogo /></SheetTitle>
          <SheetClose asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="Close navigation menu">
              <X aria-hidden="true" className="size-5" />
            </Button>
          </SheetClose>
          <SheetDescription className="sr-only">Primary navigation links</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="flex flex-1 flex-col gap-2 p-4">
          {NAVIGATION_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center rounded-xl border border-transparent px-4 py-3 text-base font-medium text-foreground-secondary hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary",
                    active && "border-primary/20 bg-primary/10 text-primary",
                  )}
                >
                  {item.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
