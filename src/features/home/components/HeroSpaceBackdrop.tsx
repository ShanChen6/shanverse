"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const HeroSpaceScene = dynamic(
  () => import("./HeroSpaceScene").then((module) => module.HeroSpaceScene),
  { ssr: false },
);

const WIDE = "(min-width: 768px)";

function subscribe(callback: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function HeroSpaceBackdrop() {
  // The animated scene is only loaded on wider screens; phones keep the light static starfield.
  const animated = React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(WIDE).matches,
    () => false,
  );

  return (
    <div
      aria-hidden="true"
      className="hero-space-backdrop pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="hero-space-fallback absolute inset-0" />
      {animated ? <HeroSpaceScene /> : null}
    </div>
  );
}
