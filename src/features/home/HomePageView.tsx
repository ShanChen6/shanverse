import * as React from "react";
import { LandingLayout } from "@/components/layout/LandingLayout";
import { HeroSection } from "./components/HeroSection";
import { HeroProfileCard } from "./components/HeroProfileCard";
import { ComponentBanner } from "./components/ComponentBanner";
import { CorePillars } from "./components/CorePillars";
import { ExploreGalleryCard } from "./components/ExploreGalleryCard";

export function HomePageView() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-12 space-y-20">
        {/* HERO SECTION */}
        <section className="grid gap-12 lg:grid-cols-12 lg:items-center py-6">
          <HeroSection />
          <HeroProfileCard />
        </section>

        {/* COMPONENT SYSTEM TEST BANNER */}
        <ComponentBanner />

        {/* KEY FEATURES & PILLARS */}
        <CorePillars />

        {/* QUICK LINK TO TEST PAGE FOOTER CARD */}
        <ExploreGalleryCard />
      </div>
    </LandingLayout>
  );
}
