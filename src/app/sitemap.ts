import type { MetadataRoute } from "next";

import { getBlogData } from "@/features/blog/blog-data";
import { getProjectData } from "@/features/projects/project-data";

function origin() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").origin;
  } catch {
    return "http://localhost:3000";
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = origin();
  const staticPaths = ["", "/blog", "/projects", "/about", "/contact"];
  const entries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    (["vi", "en"] as const).map((locale) => ({
      url: `${base}/${locale}${path}`,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.8,
    })),
  );

  const [blog, projects] = await Promise.all([
    getBlogData().catch(() => null),
    getProjectData().catch(() => null),
  ]);

  for (const post of blog?.posts ?? []) {
    entries.push({
      url: `${base}/vi/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }
  for (const project of projects?.projects ?? []) {
    for (const locale of ["vi", "en"] as const) {
      entries.push({
        url: `${base}/${locale}/projects/${encodeURIComponent(project.slug)}`,
        lastModified: project.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }
  return entries;
}
