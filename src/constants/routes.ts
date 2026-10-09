export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  PROJECTS: "/projects",
  PROJECT_DETAIL: (slug: string) => `/projects/${slug}`,
  BLOG: "/blog",
  BLOG_DETAIL: (slug: string) => `/blog/${slug}`,
  CONTACT: "/contact",
} as const;
