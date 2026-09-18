export type HomeSearchSuggestion = {
  id: string;
  type: "post" | "project" | "category";
  title: string;
  description?: string;
  href: string;
  keywords: string[];
  featured?: boolean;
  timestamp?: number;
};

export type HomeSearchCategory = {
  id: string;
  name: string;
  slug: string;
};

export { normalizeSearchText } from "@/features/search/search-text";

type IndexedSuggestion = HomeSearchSuggestion & {
  normalizedTitle: string;
  normalizedDescription: string;
  normalizedKeywords: string[];
};

export function indexSearchSuggestions(
  suggestions: HomeSearchSuggestion[],
): IndexedSuggestion[] {
  return suggestions.map((suggestion) => ({
    ...suggestion,
    normalizedTitle: normalizeSearchText(suggestion.title),
    normalizedDescription: normalizeSearchText(suggestion.description ?? ""),
    normalizedKeywords: suggestion.keywords.map(normalizeSearchText),
  }));
}

export function rankSearchSuggestions(
  suggestions: IndexedSuggestion[],
  query: string,
  limit = 8,
): HomeSearchSuggestion[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [];

  return suggestions
    .map((suggestion) => {
      const score = scoreSearchMatch(suggestion, normalizedQuery);
      return { suggestion, score };
    })
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
import {
  normalizeSearchText,
  scoreSearchMatch,
} from "@/features/search/search-text";
