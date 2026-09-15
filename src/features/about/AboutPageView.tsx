import * as React from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { LandingLayout } from "@/components/layout/LandingLayout";
import { ROUTES } from "@/constants/routes";
import type { AboutStats } from "./about-data";
import { AboutCTASection } from "./components/AboutCTASection";
import { AboutHeroSection } from "./components/AboutHeroSection";
import { AboutStatsSection } from "./components/AboutStatsSection";
import { AboutStorySection } from "./components/AboutStorySection";
import { ApproachSection } from "./components/ApproachSection";
import { JourneySection } from "./components/JourneySection";
import { SkillsSection } from "./components/SkillsSection";
import { ValuesSection } from "./components/ValuesSection";

export function AboutPageView({ stats }: { stats: AboutStats | null }) {
  return (
    <LandingLayout>
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-8 sm:px-6 sm:py-12 lg:space-y-24">
        <Breadcrumb items={[{ label: "Home", href: ROUTES.HOME }, { label: "About" }]} />
        <AboutHeroSection />
        <AboutStorySection />
        <AboutStatsSection stats={stats} />
        <SkillsSection />
        <ApproachSection />
        <JourneySection />
        <ValuesSection />
        <AboutCTASection />
      </div>
    </LandingLayout>
  );
}
