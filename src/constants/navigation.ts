import { ROUTES } from "./routes";

export const NAVIGATION_ITEMS = [
  { href: ROUTES.HOME, label: "Home" },
  { href: ROUTES.BLOG, label: "Blog" },
  { href: ROUTES.PROJECTS, label: "Projects" },
  { href: ROUTES.ABOUT, label: "About" },
  { href: ROUTES.CONTACT, label: "Contact" },
] as const;

export const FOOTER_EXPLORE_ITEMS = [
  { href: ROUTES.BLOG, label: "Latest Posts" },
  { href: ROUTES.PROJECTS, label: "Featured Projects" },
] as const;

export type NavigationItem = (typeof NAVIGATION_ITEMS)[number];

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === ROUTES.HOME) return pathname === ROUTES.HOME;
  return pathname === href || pathname.startsWith(`${href}/`);
}
