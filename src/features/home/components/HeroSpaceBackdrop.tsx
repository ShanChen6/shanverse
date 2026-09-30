"use client";

import dynamic from "next/dynamic";

const HeroSpaceScene = dynamic(
  () => import("./HeroSpaceScene").then((module) => module.HeroSpaceScene),
  { ssr: false },
);

export function HeroSpaceBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="hero-space-backdrop pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="hero-space-fallback absolute inset-0" />
      <HeroSpaceScene />
    </div>
  );
}
