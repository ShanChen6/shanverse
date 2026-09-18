import {
  normalizeSearchText,
  scoreSearchMatch,
} from "@/features/search/search-text";

export type BlogFilterOption = {
  name: string;
  slug: string;
  count: number;
};

export type BlogSearchSuggestion = {
  id: string;
  type: "article" | "category" | "tag";
  title: string;
  description?: string;
  href: string;
  keywords: string[];
  slug?: string;
  category?: string | null;
  publishedAt?: string | null;
  readingTimeMinutes?: number | null;
  featured?: boolean;
  timestamp?: number;
};

function fallbackSlug(value: string) {
  return normalizeSearchText(value).replace(/\s+/gu, "-");
}

export function buildBlogFilterOptions(
  records: Array<{ name: string; slug: string }>,
  fallbackNames: string[],
  countForName: (name: string) => number,
): BlogFilterOption[] {
  const options = new Map<string, BlogFilterOption>();

  for (const record of records) {
    const name = record.name.trim();
    const slug = record.slug.trim() || fallbackSlug(name);
    if (!name || !slug) continue;
    options.set(normalizeSearchText(name), {
      name,
      slug,
      count: countForName(name),
    });
  }
  for (const value of fallbackNames) {
    const name = value.trim();
    const key = normalizeSearchText(name);
    if (!name || options.has(key)) continue;
    options.set(key, {
      name,
      slug: fallbackSlug(name),
      count: countForName(name),
    });
  }

  return [...options.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"),
  );
}

export function resolveBlogFilterName(
  options: BlogFilterOption[],
  value: string,
): string {
  const normalized = normalizeSearchText(value);
  return (
    options.find(
      (option) =>
        normalizeSearchText(option.slug) === normalized ||
        normalizeSearchText(option.name) === normalized,
    )?.name ?? value
  );
}

export function rankBlogSuggestions(
  suggestions: BlogSearchSuggestion[],
  query: string,
  limit = 8,
): BlogSearchSuggestion[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [];

  return suggestions
    .map((suggestion) => ({
      suggestion,
      score: scoreSearchMatch(suggestion, normalizedQuery),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.suggestion.timestamp ?? 0) - (a.suggestion.timestamp ?? 0) ||
        a.suggestion.title.localeCompare(b.suggestion.title, "en"),
    )
    .slice(0, limit)
    .map(({ suggestion }) => suggestion);
}
