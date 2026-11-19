import * as React from "react";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { getTranslator } from "@/i18n/server";
import { getAboutStats } from "./about-data";
import { AboutStatsSection } from "./components/AboutStatsSection";
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
      <div aria-hidden="true" className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, index) => <div key={index} className="space-y-2"><Skeleton className="h-7 w-12" /><Skeleton className="h-3 w-20 max-w-full" /></div>)}
      </div>
    </div>
  );
}

export async function AboutPageView() {
  const { t } = await getTranslator();
  return (
    <PageContainer rhythm="loose">
      <Breadcrumb items={[{ label: t("common.home"), href: ROUTES.HOME }, { label: t("about.breadcrumb") }]} />
      {/* Intro and story on the left; numbers and tools in a sidebar on the right. */}
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="space-y-6">
          <PageHeader titleId="about-title" title={t("about.heroTitle")} description={t("about.heroDescription")} />
          <section aria-labelledby="story-heading" className="max-w-3xl space-y-4">
            <h2 id="story-heading" className="text-xl font-bold tracking-tight sm:text-2xl">{t("about.storyTitle")}</h2>
            <div className="space-y-4 leading-8 text-foreground-secondary">
              <p>{t("about.story.first")}</p>
              <p>{t("about.story.second")}</p>
              <p>{t("about.story.third")}</p>
            </div>
          </section>
        </div>
        <aside className="space-y-8 rounded-card border border-border bg-surface shadow-card p-5 lg:sticky lg:top-24">
          <Suspense fallback={<AboutStatsSkeleton label={t("about.statsLoading")} />}><AboutStatsData /></Suspense>
          <SkillsSection />
        </aside>
      </div>
      <JourneySection />
      <ValuesSection />
      <TianwuStorySection />
    </PageContainer>
  );
}
