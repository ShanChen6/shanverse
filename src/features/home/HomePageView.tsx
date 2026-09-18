import * as React from "react";
import { Suspense } from "react";
import { HomeContentSkeleton } from "@/components/common/PageSkeletons";
import { HeroSection } from "./components/HeroSection";
import { HeroProfileCard } from "./components/HeroProfileCard";
import { TechTicker } from "./components/TechTicker";
import { HomeSearchSection } from "./components/HomeSearchSection";
import { FeaturedPostsSection } from "./components/FeaturedPostsSection";
import { LatestPostsSection } from "./components/LatestPostsSection";
import { FeaturedProjectsSection } from "./components/FeaturedProjectsSection";
import { ContactSection } from "./components/ContactSection";
import type { Post } from "@/types/post";
import type { Project } from "@/types/project";
import { getSocialLinks } from "@/config/social.config";
import { ROUTES } from "@/constants/routes";
import type {
  HomeSearchCategory,
  HomeSearchSuggestion,
} from "./home-search";
import { getHomeData } from "./home-data";

function postTimestamp(post: Post) {
  const value = Date.parse(post.publishedAt ?? post.createdAt);
  return Number.isNaN(value) ? 0 : value;
}

function projectTimestamp(project: Project) {
  const value = Date.parse(project.updatedAt || project.createdAt);
  return Number.isNaN(value) ? 0 : value;
}

function concise(value: string, maxLength = 140) {
  const normalized = value.replace(/\s+/gu, " ").trim();
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1).trimEnd()}…`
    : normalized;
}

async function HomeDataSections() {
  const { posts, projects, categories } = await getHomeData();

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

  const searchCategories: HomeSearchCategory[] = Array.from(
    new Map(
      categories
        .filter(
          (category) => category.name.trim() && category.slug.trim(),
        )
        .map((category) => [
          category.slug.trim().toLowerCase(),
          {
            id: `category-${category.slug.trim()}`,
            name: category.name.trim(),
            slug: category.slug.trim(),
          },
        ]),
    ).values(),
  );

  const categorySuggestions: HomeSearchSuggestion[] = searchCategories.map(
    (category) => {
      const source = categories.find(
        (item) => item.slug.trim().toLowerCase() === category.slug.toLowerCase(),
      );
      return {
        id: category.id,
        type: "category",
        title: category.name,
        description: source?.description
          ? concise(source.description)
          : "Browse articles in this topic.",
        href: `${ROUTES.BLOG}?category=${encodeURIComponent(category.slug)}`,
        keywords: [category.slug],
      };
    },
  );
  const postSuggestions: HomeSearchSuggestion[] = publishedPosts
    .slice(0, 60)
    .map((post) => ({
      id: `post-${post.slug}`,
      type: "post",
      title: post.title.trim(),
      description: concise(post.excerpt),
      href: ROUTES.BLOG_DETAIL(post.slug),
      keywords: [post.category ?? "", ...post.tags].filter(Boolean),
      featured: post.featured,
      timestamp: postTimestamp(post),
    }));
  const projectSuggestions: HomeSearchSuggestion[] = publishedProjects
    .slice(0, 30)
    .map((project) => ({
      id: `project-${project.slug}`,
      type: "project",
      title: project.title.trim(),
      description: concise(project.description),
      href: ROUTES.PROJECT_DETAIL(project.slug),
      keywords: [...project.techStack, ...project.tags].filter(Boolean),
      featured: project.featured,
      timestamp: projectTimestamp(project),
    }));
  const searchSuggestions = [
    ...categorySuggestions,
    ...postSuggestions,
    ...projectSuggestions,
  ].slice(0, 120);

  return <>
    <HomeSearchSection categories={searchCategories.slice(0, 8)} suggestions={searchSuggestions} />
    <FeaturedPostsSection posts={featuredPosts} />
    <LatestPostsSection posts={latestPosts} />
    <FeaturedProjectsSection projects={featuredProjects.length > 0 ? featuredProjects : publishedProjects.slice(0, 1)} />
  </>;
}

export function HomePageView() {
  const socialLinks = getSocialLinks();
  return <>
    <section className="relative overflow-hidden border-b border-border bg-surface/30">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 size-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-20">
        <HeroSection socialLinks={socialLinks} />
        <HeroProfileCard />
      </div>
    </section>
    <TechTicker />
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6 lg:space-y-24 lg:py-24">
      <Suspense fallback={<HomeContentSkeleton />}><HomeDataSections /></Suspense>
      <ContactSection socialLinks={socialLinks} />
    </div>
  </>;
}
