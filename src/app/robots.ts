import type { MetadataRoute } from "next";
import { buildAbsoluteUrl } from "@/config/seo.config";

export default function robots(): MetadataRoute.Robots {
  const production = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";
  return {
    rules: production ? { userAgent: "*", allow: "/", disallow: ["/api/", "/test", "/components-preview", "/notion-preview"] } : { userAgent: "*", disallow: "/" },
    sitemap: buildAbsoluteUrl("/sitemap.xml"),
    host: buildAbsoluteUrl("/"),
  };
}
