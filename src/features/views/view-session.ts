export const VIEW_SESSION_PREFIX = "shanverse:viewed:";

export type SessionStorageLike = Pick<Storage, "getItem" | "setItem">;

const inFlightViews = new Set<string>();

export function claimSessionView(
  storage: SessionStorageLike | null,
  slug: string,
): boolean {
  const key = `${VIEW_SESSION_PREFIX}${slug}`;
  if (storage?.getItem(key) === "counted" || inFlightViews.has(key)) return false;
  inFlightViews.add(key);
  return true;
}

export function confirmSessionView(
  storage: SessionStorageLike | null,
  slug: string,
): void {
  const key = `${VIEW_SESSION_PREFIX}${slug}`;
  storage?.setItem(key, "counted");
  inFlightViews.delete(key);
}

export function releaseSessionView(slug: string): void {
  inFlightViews.delete(`${VIEW_SESSION_PREFIX}${slug}`);
}
