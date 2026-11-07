import * as React from "react";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { getTranslator } from "@/i18n/server";
import { getAboutStats } from "./about-data";
import { AboutCTASection } from "./components/AboutCTASection";
import { AboutHeroSection } from "./components/AboutHeroSection";
import { AboutStatsSection } from "./components/AboutStatsSection";
import { AboutStorySection } from "./components/AboutStorySection";
import { JourneySection } from "./components/JourneySection";
import { SkillsSection } from "./components/SkillsSection";
import { TianwuStorySection } from "./components/TianwuStorySection";
import { ValuesSection } from "./components/ValuesSection";

async function AboutStatsData() {
  const stats = await getAboutStats();
  return <AboutStatsSection stats={stats} />;
}

function AboutStatsSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <div key={index} className="space-y-3 rounded-2xl border border-border bg-surface p-5"><Skeleton className="h-9 w-16" /><Skeleton className="h-4 w-32 max-w-full" /></div>)}
      </div>
    </div>
  );
}

export async function AboutPageView() {
  const { t } = await getTranslator();
  return (
    <PageContainer rhythm="loose">
      <Breadcrumb items={[{ label: t("common.home"), href: ROUTES.HOME }, { label: t("about.breadcrumb") }]} />
      {/* 1. Intro: who I am, my story and a few numbers, kept together as one block. */}
      <div className="space-y-6">
        <AboutHeroSection />
        <AboutStorySection />
        <Suspense fallback={<AboutStatsSkeleton label={t("about.statsLoading")} />}><AboutStatsData /></Suspense>
      </div>
      {/* 2. Skills  3. Journey  4. Values and approach  then Tianwu, and the call to action. */}
      <SkillsSection />
      <JourneySection />
      <ValuesSection />
      <TianwuStorySection />
      <AboutCTASection />
    </PageContainer>
  );
}
