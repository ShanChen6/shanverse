import type { Locale } from "./config";

const dateLocales: Record<Locale, string> = { vi: "vi-VN", en: "en-GB" };

export function formatDate(value: string | Date, locale: Locale): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(dateLocales[locale], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// Month and year only, e.g. "thg 9 2026" (vi) or "Sept 2026" (en).
export function formatMonthYear(value: string | Date, locale: Locale): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(dateLocales[locale], {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
