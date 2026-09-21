import {
  normalizeSearchText,
} from "@/features/search/search-text";

export type BlogFilterOption = {
  name: string;
  slug: string;
  count: number;
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
