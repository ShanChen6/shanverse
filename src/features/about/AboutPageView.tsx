import * as React from "react";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { getAboutStats } from "./about-data";
import { AboutCTASection } from "./components/AboutCTASection";
import { AboutHeroSection } from "./components/AboutHeroSection";
import { AboutStatsSection } from "./components/AboutStatsSection";
import { AboutStorySection } from "./components/AboutStorySection";
import { ApproachSection } from "./components/ApproachSection";
import { JourneySection } from "./components/JourneySection";
import { SkillsSection } from "./components/SkillsSection";
import { ValuesSection } from "./components/ValuesSection";

async function AboutStatsData() {
  const stats = await getAboutStats();
  return <AboutStatsSection stats={stats} />;
}

function AboutStatsSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading statistics</span>
      <div aria-hidden="true" className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <div key={index} className="space-y-3 rounded-2xl border border-border bg-surface p-5"><Skeleton className="h-9 w-16" /><Skeleton className="h-4 w-32 max-w-full" /></div>)}
      </div>
    </div>
  );
}

export function AboutPageView() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-8 sm:px-6 sm:py-12 lg:space-y-24">
        <Breadcrumb items={[{ label: "Home", href: ROUTES.HOME }, { label: "About" }]} />
        <AboutHeroSection />
        <AboutStorySection />
        <Suspense fallback={<AboutStatsSkeleton />}><AboutStatsData /></Suspense>
        <SkillsSection />
        <ApproachSection />
        <JourneySection />
        <ValuesSection />
        <AboutCTASection />
    </div>
  );
}
