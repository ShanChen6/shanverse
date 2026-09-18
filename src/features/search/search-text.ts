export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gu, "d")
    .replace(/Đ/gu, "D")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

export type SearchScoreInput = {
  title: string;
  description?: string;
  keywords?: string[];
  slug?: string;
  featured?: boolean;
};

export function scoreSearchMatch(
  item: SearchScoreInput,
  normalizedQuery: string,
): number {
  if (!normalizedQuery) return 0;

  const title = normalizeSearchText(item.title);
  const description = normalizeSearchText(item.description ?? "");
  const slug = normalizeSearchText(item.slug ?? "");
  const keywords = (item.keywords ?? []).map(normalizeSearchText);
  let score = 0;

  if (title.startsWith(normalizedQuery)) score += 100;
  else if (title.includes(normalizedQuery)) score += 70;
  if (keywords.some((keyword) => keyword.includes(normalizedQuery))) score += 45;
  if (description.includes(normalizedQuery)) score += 20;
  if (slug.includes(normalizedQuery)) score += 10;
  if (score > 0 && item.featured) score += 5;

  return score;
}
