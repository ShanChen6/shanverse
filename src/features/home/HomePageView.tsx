import * as React from "react";
import { Suspense } from "react";
import { HomeContentSkeleton } from "@/components/common/PageSkeletons";
import { HeroSection } from "./components/HeroSection";
import { HeroProfileCard } from "./components/HeroProfileCard";
import { TechTicker } from "./components/TechTicker";
import { WritingSection } from "./components/WritingSection";
import { FeaturedProjectsSection } from "./components/FeaturedProjectsSection";
import { ContactSection } from "./components/ContactSection";
import { HomeGamesSection } from "./components/HomeGamesSection";
import type { Post } from "@/types/post";
import type { Project } from "@/types/project";
import { getSocialLinks } from "@/config/social.config";
import { getHomeData } from "./home-data";
import { HeroSpaceBackdrop } from "./components/HeroSpaceBackdrop";
import { getTranslator } from "@/i18n/server";

function postTimestamp(post: Post) {
  const value = Date.parse(post.publishedAt ?? post.createdAt);
  return Number.isNaN(value) ? 0 : value;
}

function projectTimestamp(project: Project) {
  const value = Date.parse(project.updatedAt || project.createdAt);
  return Number.isNaN(value) ? 0 : value;
}

async function HomeDataSections() {
  const { posts, projects } = await getHomeData();

  const publishedPosts = posts
    .filter(
      (post) =>
        post.published &&
        post.title.trim().length > 0 &&
        post.slug.trim().length > 0,
    )
    .sort((a, b) => postTimestamp(b) - postTimestamp(a));
  const leadPost = publishedPosts.find((post) => post.featured) ?? publishedPosts[0] ?? null;
  const latestPosts = publishedPosts.filter((post) => post.id !== leadPost?.id).slice(0, 3);

  const publishedProjects = projects
    .filter(
      (project) =>
        project.published &&
        project.title.trim().length > 0 &&
        project.slug.trim().length > 0,
    )
    .sort((a, b) => projectTimestamp(b) - projectTimestamp(a));
  const featuredProjects = publishedProjects
    .filter((project) => project.featured)
    .slice(0, 3);

  return <>
    <WritingSection lead={leadPost} posts={latestPosts} />
    <FeaturedProjectsSection projects={featuredProjects.length > 0 ? featuredProjects : publishedProjects.slice(0, 1)} />
  </>;
}

export async function HomePageView() {
  const { t } = await getTranslator();
  const socialLinks = getSocialLinks();
  return <>
    <section
      data-home-hero
      className="relative overflow-hidden border-b border-border bg-surface/30"
    >
      <HeroSpaceBackdrop />
      <div aria-hidden="true" className="brand-gradient-soft pointer-events-none absolute -right-32 -top-40 hidden size-96 rounded-full blur-3xl sm:block" />
      <div className="hero-space-content relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-20">
        <HeroSection socialLinks={socialLinks} />
        <HeroProfileCard codeLabel={t("home.codeProfileLabel")} />
      </div>
    </section>
    <TechTicker label={t("home.techStackLabel")} />
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6 lg:space-y-24 lg:py-24">
      <Suspense fallback={<HomeContentSkeleton label={t("common.loadingContent")} />}><HomeDataSections /></Suspense>
      <HomeGamesSection />
      <ContactSection socialLinks={socialLinks} />
    </div>
  </>;
}
