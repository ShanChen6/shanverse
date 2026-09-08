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

// Notion may be unreachable/unconfigured locally, fall back to empty data instead of failing the page.
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export async function HomePageView() {
  const [posts, projects, categories] = await Promise.all([
    safe(notionService.getPosts(), [] as Post[]),
    safe(notionService.getProjects(), [] as Project[]),
    safe(notionService.getCategories(), [] as NotionCategory[]),
  ]);

  const publishedPosts = posts.filter((post) => post.published);
  const featuredPosts = publishedPosts
    .filter((post) => post.featured)
    .slice(0, 3);
  const latestPosts = [...publishedPosts]
    .sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.updatedAt).getTime() -
        new Date(a.publishedAt ?? a.updatedAt).getTime(),
    )
    .slice(0, 6);

  const publishedProjects = projects.filter((project) => project.published);
  const featuredProjects = publishedProjects
    .filter((project) => project.featured)
    .slice(0, 4);

  return (
    <LandingLayout>
      {/* HERO SECTION */}
      <section className="container mx-auto grid gap-12 px-4 py-12 lg:grid-cols-12 lg:items-center">
        <HeroSection />
        <HeroProfileCard />
      </section>

      {/* TECH STACK TICKER (mock data) */}
      <TechTicker />

      <div className="container mx-auto px-4 py-12 space-y-20">
        {/* SEARCH: powered by Notion categories */}
        <HomeSearchSection categories={categories} />

        {/* FEATURED POSTS: powered by Notion posts db */}
        <FeaturedPostsSection
          posts={
            featuredPosts.length > 0
              ? featuredPosts
              : publishedPosts.slice(0, 3)
          }
        />

        {/* LATEST POSTS: powered by Notion posts db */}
        <LatestPostsSection posts={latestPosts} />

        {/* FEATURED PROJECTS: powered by Notion projects db */}
        <FeaturedProjectsSection
          projects={
            featuredProjects.length > 0
              ? featuredProjects
              : publishedProjects.slice(0, 4)
          }
        />

        {/* CONTACT */}
        <ContactSection />
      </div>
    </LandingLayout>
  );
}
