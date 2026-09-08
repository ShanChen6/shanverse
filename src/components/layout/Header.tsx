"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { Navigation } from "@/components/layout/navigation";
import { NAVIGATION_ITEMS } from "@/constants/navigation";

export function Header() {
  return (
    <Navigation
      items={NAVIGATION_ITEMS}
      className="glass-navbar"
      brand={
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-3 text-foreground transition-colors hover:text-primary"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <Image
              src="/logo/logo_shanverse.png"
              alt="ShanDev logo"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span className="inline-flex items-center truncate leading-none text-h5-semibold text-primary-500">
            ShanDev
          </span>
        </Link>
      }
    />
  );
}
