"use client";
import * as React from "react";

import { MobileMenu } from "./mobile-menu";
import { Navbar, type NavItem } from "./navbar";
import { ThemeToggle } from "./theme-toggle";

export interface NavigationProps {
  items: NavItem[];
  brand?: React.ReactNode;
  className?: string;
}

export function Navigation({ items, brand, className }: NavigationProps) {
  return (
    <Navbar
      items={items}
      brand={brand}
      className={className}
      rightSlot={
        <>
          <MobileMenu items={items} />
          <ThemeToggle />
        </>
      }
    />
  );
}
