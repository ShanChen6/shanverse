import { FolderKanban, Home, Mail, Newspaper, UserRound } from "lucide-react";

import { ROUTES } from "./routes";

export const NAVIGATION_ITEMS = [
  { href: ROUTES.HOME, labelKey: "common.home", icon: Home },
  { href: ROUTES.BLOG, labelKey: "common.blog", icon: Newspaper },
  { href: ROUTES.PROJECTS, labelKey: "common.projects", icon: FolderKanban },
  { href: ROUTES.ABOUT, labelKey: "common.about", icon: UserRound },
  { href: ROUTES.CONTACT, labelKey: "common.contact", icon: Mail },
] as const;

export const FOOTER_EXPLORE_ITEMS = [
  { href: ROUTES.BLOG, labelKey: "home.latestPosts" },
  { href: ROUTES.PROJECTS, labelKey: "home.featuredProjects" },
] as const;

export type NavigationItem = (typeof NAVIGATION_ITEMS)[number];

export function isActiveRoute(pathname: string, href: string): boolean {
  const route = pathname.replace(/^\/(vi|en)(?=\/|$)/u, "") || "/";
  if (href === ROUTES.HOME) return route === ROUTES.HOME;
  return route === href || route.startsWith(`${href}/`);
}
