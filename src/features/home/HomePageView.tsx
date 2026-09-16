import * as React from "react";
import { LandingLayout } from "@/components/layout/LandingLayout";
import { HeroSection } from "./components/HeroSection";
import { HeroProfileCard } from "./components/HeroProfileCard";
import { TechTicker } from "./components/TechTicker";
import { HomeSearchSection } from "./components/HomeSearchSection";
import { FeaturedPostsSection } from "./components/FeaturedPostsSection";
import { LatestPostsSection } from "./components/LatestPostsSection";
import { FeaturedProjectsSection } from "./components/FeaturedProjectsSection";
import { ContactSection } from "./components/ContactSection";
import { notionService } from "@/services/notion.service";
import type { Post } from "@/types/post";
import type { Project } from "@/types/project";
import type { NotionCategory } from "@/types/notion";
import { getSocialLinks } from "@/config/social.config";

// Notion may be unreachable/unconfigured locally, fall back to empty data instead of failing the page.
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

function postTimestamp(post: Post) {
  const value = Date.parse(post.publishedAt ?? post.createdAt);
  return Number.isNaN(value) ? 0 : value;
}

function projectTimestamp(project: Project) {
  const value = Date.parse(project.updatedAt || project.createdAt);
  return Number.isNaN(value) ? 0 : value;
}

export async function HomePageView() {
  const socialLinks = getSocialLinks();
  const [posts, projects, categories] = await Promise.all([
    safe(notionService.getPosts(), [] as Post[]),
    safe(notionService.getProjects(), [] as Project[]),
    safe(notionService.getCategories(), [] as NotionCategory[]),
  ]);

  const publishedPosts = posts
    .filter(
      (post) =>
        post.published &&
        post.title.trim().length > 0 &&
        post.slug.trim().length > 0,
    )
    .sort((a, b) => postTimestamp(b) - postTimestamp(a));
  const highlightedPosts = publishedPosts
    .filter((post) => post.featured)
    .slice(0, 3);

  const featuredPosts = [
    ...highlightedPosts,
    ...publishedPosts.filter(
      (post) =>
        !highlightedPosts.some((highlighted) => highlighted.id === post.id),
    ),
  ].slice(0, 3);
  const featuredPostIds = new Set(featuredPosts.map((post) => post.id));
  const latestPosts = publishedPosts
    .filter((post) => !featuredPostIds.has(post.id))
    .slice(0, 6);

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

  return (
    <LandingLayout>
      <section className="relative overflow-hidden border-b border-border bg-surface/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full bg-primary/5 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-20">
          <HeroSection socialLinks={socialLinks} />
          <HeroProfileCard />
        </div>
      </section>

      <TechTicker />

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6 lg:space-y-24 lg:py-24">
        <HomeSearchSection categories={categories} />

        <FeaturedPostsSection posts={featuredPosts} />

        <LatestPostsSection posts={latestPosts} />

        <FeaturedProjectsSection
          projects={
            featuredProjects.length > 0
              ? featuredProjects
              : publishedProjects.slice(0, 1)
          }
        />

        <ContactSection socialLinks={socialLinks} />
      </div>
    </LandingLayout>
  );
}
