import * as React from "react";
import { Suspense } from "react";
import { HomeContentSkeleton } from "@/components/common/PageSkeletons";
import { HeroSection } from "./components/HeroSection";
import { WritingSection } from "./components/WritingSection";
import { FeaturedProjectsSection } from "./components/FeaturedProjectsSection";
import { HomeGamesSection } from "./components/HomeGamesSection";
import type { Post } from "@/types/post";
import { compareProjects } from "@/features/projects/project-sort";
import { getSocialLinks } from "@/config/social.config";
import { getHomeData } from "./home-data";
import { HeroSpaceBackdrop } from "./components/HeroSpaceBackdrop";
import { getTranslator } from "@/i18n/server";

function postTimestamp(post: Post) {
  const value = Date.parse(post.publishedAt ?? post.createdAt);
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
    .sort(compareProjects);
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
      <div className="hero-space-content relative mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <HeroSection socialLinks={socialLinks} />
      </div>
    </section>
    <div className="mx-auto max-w-page space-y-12 px-4 py-10 sm:px-6 lg:space-y-14 lg:px-8 lg:py-12">
      <Suspense fallback={<HomeContentSkeleton label={t("common.loadingContent")} />}><HomeDataSections /></Suspense>
      <HomeGamesSection />
    </div>
  </>;
}
