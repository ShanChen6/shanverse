import type { MetadataRoute } from "next";

import { getBlogData } from "@/features/blog/blog-data";
import { getProjectData } from "@/features/projects/project-data";
import { buildAbsoluteUrl } from "@/config/seo.config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/projects", "/about", "/contact"];
  const entries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    (["vi", "en"] as const).map((locale) => ({
      url: buildAbsoluteUrl(`/${locale}${path}`),
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.8,
    })),
  );
  entries.push({ url: buildAbsoluteUrl("/vi/blog"), changeFrequency: "weekly", priority: 0.8 });

  const [blog, projects] = await Promise.all([
    getBlogData().catch(() => null),
    getProjectData().catch(() => null),
  ]);

  for (const post of blog?.posts ?? []) {
    entries.push({
      url: buildAbsoluteUrl(`/vi/blog/${encodeURIComponent(post.slug)}`),
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }
  for (const project of projects?.projects ?? []) {
    for (const locale of ["vi", "en"] as const) {
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
