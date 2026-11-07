// Remembers which games were opened last, so /games can offer them again.
// Stored in the browser only; every access is guarded because storage can be missing or throw.
const KEY = "shanverse:games:last-played";
const MAX_ENTRIES = 24;

export type LastPlayed = Record<string, number>;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function defaultStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readLastPlayed(storage: StorageLike | null = defaultStorage()): LastPlayed {
  if (!storage) return {};
  try {
    const value: unknown = JSON.parse(storage.getItem(KEY) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const result: LastPlayed = {};
    for (const [slug, time] of Object.entries(value)) {
      if (typeof time === "number" && Number.isFinite(time)) result[slug] = time;
    }
    return result;
  } catch {
    return {};
  }
}

export function markPlayed(slug: string, now = Date.now(), storage: StorageLike | null = defaultStorage()) {
  if (!storage || !slug) return;
  const entries = Object.entries({ ...readLastPlayed(storage), [slug]: now })
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_ENTRIES);
  try {
    storage.setItem(KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Not remembered; nothing else depends on it.
  }
}

/** Slugs of the most recently opened games that still exist, newest first. */
export function recentSlugs(known: readonly string[], limit = 3, storage: StorageLike | null = defaultStorage()): string[] {
  const played = readLastPlayed(storage);
  return known
    .filter((slug) => slug in played)
    .sort((a, b) => played[b] - played[a])
    .slice(0, limit);
}
