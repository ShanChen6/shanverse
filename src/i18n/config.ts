export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
/**
 * Locales visitors can use right now. Vietnamese is paused while the site focuses on English:
 * its messages stay in the repo, /vi URLs redirect to /en and the switcher shows VI as unavailable.
 * Add "vi" back here to turn it on again.
 */
export const enabledLocales: readonly Locale[] = ["en"];
export const defaultLocale: Locale = "en";
export const localeCookie = "shanverse-locale";
export const localeHeader = "x-shanverse-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function isEnabledLocale(value: string | null | undefined): value is Locale {
  return enabledLocales.includes(value as Locale);
}

export function getPathnameLocale(pathname: string): Locale | null {
  const firstSegment = pathname.split("/")[1];
  return isLocale(firstSegment) ? firstSegment : null;
}

export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const [pathWithQuery, hash = ""] = href.split("#", 2);
  const matched = pathWithQuery.match(/^\/(vi|en)(?=\/|\?|$)/u);
  const path = matched
    ? pathWithQuery.replace(/^\/(vi|en)(?=\/|\?|$)/u, "") || "/"
    : pathWithQuery;
  return `/${locale}${path === "/" ? "" : path}${hash ? `#${hash}` : ""}`;
}

export function stripLocale(pathname: string): string {
  const stripped = pathname.replace(/^\/(vi|en)(?=\/|$)/u, "");
  return stripped || "/";
}
