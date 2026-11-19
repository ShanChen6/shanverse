import type { MetadataRoute } from "next";

import { getBlogData } from "@/features/blog/blog-data";
import { getProjectData } from "@/features/projects/project-data";
import { buildAbsoluteUrl, buildBlogPostCanonicalUrl, localePath } from "@/config/seo.config";
import { defaultLocale, enabledLocales } from "@/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/projects", "/games", "/games/2048", "/games/minesweeper", "/games/typing", "/games/memory", "/games/snake", "/games/sokoban", "/games/go", "/games/word-guess", "/games/red-cliffs", "/games/nonogram", "/games/bach-linh-ky", "/games/co-lau", "/games/hanoi", "/about", "/contact"];
  const entries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    enabledLocales.map((locale) => ({
      url: buildAbsoluteUrl(`/${locale}${path}`),
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.8,
    })),
  );
  entries.push({ url: buildAbsoluteUrl(localePath(defaultLocale, "/blog")), changeFrequency: "weekly", priority: 0.8 });

  const [blog, projects] = await Promise.all([
    getBlogData().catch(() => null),
    getProjectData().catch(() => null),
  ]);

  for (const post of blog?.posts ?? []) {
    entries.push({
      url: buildBlogPostCanonicalUrl(post.slug),
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }
  for (const project of projects?.projects ?? []) {
    for (const locale of enabledLocales) {
      entries.push({
        url: buildAbsoluteUrl(`/${locale}/projects/${encodeURIComponent(project.slug)}`),
        lastModified: project.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }
  return entries;
}
