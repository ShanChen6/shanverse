import { FolderKanban, Gamepad2, Home, Newspaper, UserRound } from "lucide-react";

import { ROUTES } from "./routes";

export const NAVIGATION_ITEMS = [
  { href: ROUTES.HOME, labelKey: "common.home", icon: Home },
  { href: ROUTES.BLOG, labelKey: "common.blog", icon: Newspaper },
  { href: ROUTES.PROJECTS, labelKey: "common.projects", icon: FolderKanban },
  { href: ROUTES.GAMES, labelKey: "common.games", icon: Gamepad2 },
  { href: ROUTES.ABOUT, labelKey: "common.about", icon: UserRound },
] as const;


/** A single game page (/games/<slug>), where the site chrome gives way to the game's own top bar on mobile. */
export function isGamePlayRoute(pathname: string): boolean {
  const route = pathname.replace(/^\/(vi|en)(?=\/|$)/u, "") || "/";
  return /^\/games\/[^/]+\/?$/u.test(route);
}

/** Blog list and articles, which use the reading surface in dark mode. */
export function isBlogRoute(pathname: string): boolean {
  const route = pathname.replace(/^\/(vi|en)(?=\/|$)/u, "") || "/";
  return route === "/blog" || route.startsWith("/blog/");
}

export type NavigationItem = (typeof NAVIGATION_ITEMS)[number];

export function isActiveRoute(pathname: string, href: string): boolean {
  const route = pathname.replace(/^\/(vi|en)(?=\/|$)/u, "") || "/";
  if (href === ROUTES.HOME) return route === ROUTES.HOME;
  return route === href || route.startsWith(`${href}/`);
}
