import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { getSocialLinks } from "@/config/social.config";
import type { Metadata } from "next";

const DEVELOPMENT_ORIGIN = "http://localhost:3000";

function resolveSiteUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : DEVELOPMENT_ORIGIN);
  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol)) return DEVELOPMENT_ORIGIN;
    if (process.env.NODE_ENV === "production" && url.hostname === "localhost" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    return url.origin;
  } catch {
    return DEVELOPMENT_ORIGIN;
  }
}

export const SEO_CONFIG = {
  siteName: "Shanverse",
  siteUrl: resolveSiteUrl(),
  defaultTitle: "Shanverse",
  titleTemplate: "%s | Shanverse",
  defaultDescription: "A space to learn, build and share practical knowledge about software development.",
  defaultLocale,
  supportedLocales: locales,
  author: "Shan Kinh Can",
  twitterUsername: undefined,
  logoPath: "/logo/logo_shanverse.png",
  defaultOpenGraphImage: "/logo/logo_shanverse.png",
  socialLinks: getSocialLinks().filter((link) => link.href.startsWith("http")).map((link) => link.href),
} as const;

export function buildAbsoluteUrl(path = "/") {
  return new URL(path.startsWith("/") ? path : `/${path}`, `${SEO_CONFIG.siteUrl}/`).toString();
}

export function localePath(locale: Locale, path = "") {
  return `/${locale}${path && path !== "/" ? (path.startsWith("/") ? path : `/${path}`) : ""}`;
}

export function localizedAlternates(locale: Locale, path = "") {
  return {
    canonical: buildAbsoluteUrl(localePath(locale, path)),
    languages: {
      vi: buildAbsoluteUrl(localePath("vi", path)),
      en: buildAbsoluteUrl(localePath("en", path)),
      "x-default": buildAbsoluteUrl(localePath(defaultLocale, path)),
    },
  };
}

export function safeMetadataImage(value?: string | null) {
  if (!value) return buildAbsoluteUrl(SEO_CONFIG.defaultOpenGraphImage);
  try {
    const url = new URL(value, SEO_CONFIG.siteUrl);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Unsupported image protocol");
    const signedNotionUrl = url.searchParams.has("X-Amz-Credential") || url.searchParams.has("X-Amz-Signature");
    return signedNotionUrl ? buildAbsoluteUrl(SEO_CONFIG.defaultOpenGraphImage) : url.toString();
  } catch {
    return buildAbsoluteUrl(SEO_CONFIG.defaultOpenGraphImage);
  }
}

export function buildPageMetadata({ locale, path, title, description, keywords, blogOnly = false }: { locale: Locale; path: string; title: string; description: string; keywords?: string[]; blogOnly?: boolean }): Metadata {
  const canonicalPath = blogOnly ? localePath("vi", path) : localePath(locale, path);
  const canonical = buildAbsoluteUrl(canonicalPath);
  const image = safeMetadataImage();
  const resolvedTitle = title.includes(SEO_CONFIG.siteName) ? title : `${title} | ${SEO_CONFIG.siteName}`;
  return {
    title: { absolute: resolvedTitle }, description, keywords,
    alternates: blogOnly ? { canonical, languages: { vi: canonical, "x-default": canonical } } : localizedAlternates(locale, path),
    robots: { index: true, follow: true },
    openGraph: { title: resolvedTitle, description, url: canonical, siteName: SEO_CONFIG.siteName, locale: locale === "vi" ? "vi_VN" : "en_US", type: "website", images: [{ url: image, width: 1200, height: 630, alt: resolvedTitle }] },
    twitter: { card: "summary_large_image", title: resolvedTitle, description, images: [image], creator: SEO_CONFIG.twitterUsername },
  };
}
