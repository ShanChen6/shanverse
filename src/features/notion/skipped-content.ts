export type ContentItem = { id: string; title: string; slug: string; published: boolean };

/** Published items that cannot be shown because the title or slug is empty. Unpublished items are left out on purpose. */
export function skippedItems(items: ContentItem[]) {
  return items.flatMap((item) => {
    if (!item.published) return [];
    const missing = [!item.title.trim() ? "title" : null, !item.slug.trim() ? "slug" : null].filter(Boolean);
    return missing.length ? [{ id: item.id, title: item.title.trim() || "(no title)", missing }] : [];
  });
}

/** Published items that share a slug: only one of them can be reached at that address. */
export function duplicateSlugs(items: ContentItem[]) {
  const bySlug = new Map<string, ContentItem[]>();
  for (const item of items) {
    const slug = item.slug.trim().toLowerCase();
    if (!item.published || !slug || !item.title.trim()) continue;
    bySlug.set(slug, [...(bySlug.get(slug) ?? []), item]);
  }
  return [...bySlug.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([slug, group]) => ({ slug, items: group.map((item) => ({ id: item.id, title: item.title.trim() })) }));
}

type Logger = { warn(message: string, details?: Record<string, unknown>): void };

/** Writes one warning per problem kind. Meant to run when the cache refreshes, not on every visit. */
export function reportContentProblems(kind: "posts" | "projects", items: ContentItem[], logger: Logger) {
  const skipped = skippedItems(items);
  if (skipped.length) logger.warn(`Published ${kind} hidden because a required property is empty`, { [kind]: skipped });
  const duplicates = duplicateSlugs(items);
  if (duplicates.length) logger.warn(`Published ${kind} share a slug, so only one can be opened`, { duplicates });
}
