// Cờ Lau lives in its own app (github.com/ShanChen6/Reed-Banner) and is shown
// here in an iframe. Its /demo page takes ?theme=light|dark and posts
// { type: "colau:height", height } to the parent whenever its height changes.

export const HEIGHT_MESSAGE = "colau:height";

/** The deployed app's origin, from NEXT_PUBLIC_CO_LAU_URL; null when unset or not an http(s) URL. */
export function parseBaseUrl(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** The iframe src: the app's /demo page in the site's theme. */
export function buildEmbedSrc(base: URL, theme: "light" | "dark"): string {
  const url = new URL("/demo", base);
  url.searchParams.set("theme", theme);
  return url.toString();
}

/** The height a message from the game asks for, or null if it is not a height message. */
export function readHeightMessage(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const { type, height } = data as { type?: unknown; height?: unknown };
  if (type !== HEIGHT_MESSAGE || typeof height !== "number" || !Number.isFinite(height) || height <= 0) return null;
  return Math.ceil(height);
}
