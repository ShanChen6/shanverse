export const ROUTES = {
  HOME: "/",
  TEST: "/test",
  ABOUT: "/about",
  PROJECTS: "/projects",
  PROJECT_DETAIL: (slug: string) => `/projects/${slug}`,
  BLOG: "/blog",
  BLOG_DETAIL: (slug: string) => `/blog/${slug}`,
  CONTACT: "/contact",
} as const;

export const SOCIAL_LINKS_URLS = {
  GITHUB: "https://github.com",
  LINKEDIN: "https://linkedin.com",
  FACEBOOK: "https://facebook.com",
  INSTAGRAM: "https://instagram.com",
};