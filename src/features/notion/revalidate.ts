import { createHash, timingSafeEqual } from "node:crypto";

export type RevalidateScope = "projects" | "posts" | "words" | "all";

const SCOPE_TAGS: Record<Exclude<RevalidateScope, "all">, string[]> = {
  projects: ["notion-projects"],
  posts: ["notion-posts", "notion-categories", "notion-tags"],
  words: ["notion-words"],
};

export const REVALIDATE_SCOPES = ["projects", "posts", "words", "all"] as const;

export function parseScope(value: string | null | undefined): RevalidateScope | null {
  if (!value) return "all";
  const scope = value.trim().toLowerCase();
  return (REVALIDATE_SCOPES as readonly string[]).includes(scope) ? (scope as RevalidateScope) : null;
}

export function tagsForScope(scope: RevalidateScope): string[] {
  return scope === "all" ? Object.values(SCOPE_TAGS).flat() : [...SCOPE_TAGS[scope]];
}

/** Compares secrets in constant time (hashing first, so the lengths always match). */
export function secretMatches(provided: string | null | undefined, secret: string | undefined): boolean {
  if (!secret || !provided) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(provided), digest(secret));
}

/** Reads the secret from `Authorization: Bearer ...` or `x-revalidate-secret`; a `?secret=` link is accepted as a last resort. */
export function readSecret(headers: Headers, url: URL): string | null {
  const auth = headers.get("authorization");
  if (auth && /^bearer\s+/iu.test(auth)) return auth.replace(/^bearer\s+/iu, "").trim() || null;
  return headers.get("x-revalidate-secret") ?? url.searchParams.get("secret");
}

type Dependencies = {
  secret: string | undefined;
  revalidate(tag: string): void;
};

/** Request handler for refreshing cached Notion content, kept free of Next imports so it can be tested. */
export function createRevalidateHandler({ secret, revalidate }: Dependencies) {
  const json = (body: Record<string, unknown>, status: number) =>
    Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

  return async function handle(request: Request): Promise<Response> {
    if (!secret) return json({ revalidated: false, error: "not_configured" }, 503);
    const url = new URL(request.url);
    if (!secretMatches(readSecret(request.headers, url), secret)) return json({ revalidated: false, error: "unauthorized" }, 401);

    let requested = url.searchParams.get("scope");
    if (!requested && request.method === "POST") {
      try {
        const body: unknown = await request.json();
        if (body && typeof body === "object" && "scope" in body && typeof (body as { scope: unknown }).scope === "string") {
          requested = (body as { scope: string }).scope;
        }
      } catch {
        // No JSON body: the default scope applies.
      }
    }
    const scope = parseScope(requested);
    if (!scope) return json({ revalidated: false, error: "unknown_scope", scopes: [...REVALIDATE_SCOPES] }, 400);

    const tags = tagsForScope(scope);
    for (const tag of tags) revalidate(tag);
    return json({ revalidated: true, scope, tags }, 200);
  };
}
