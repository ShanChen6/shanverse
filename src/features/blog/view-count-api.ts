import "server-only";

import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import type { ViewCountResult } from "./view-count";

export const VIEW_VISITOR_COOKIE = "shanverse-blog-visitor";
export const VIEW_CDN_CACHE_SECONDS = 30;
export const VIEW_RETRY_AFTER_SECONDS = 60;

type Context = { params: Promise<{ slug: string }> };
type Dependencies = {
  /** Returns false once the client has used up its request budget. */
  allowRequest(clientKey: string): Promise<boolean>;
  isPublishedPostSlug(slug: string): Promise<boolean>;
  getViews(slug: string): Promise<number>;
  incrView(slug: string, visitorId: string): Promise<ViewCountResult>;
};

type Body = { views: number | null; counted: boolean; error?: string };
type ResponseOptions = {
  status?: number;
  visitorId?: string;
  /** Only a successful GET is the same for every visitor and safe to share. */
  shared?: boolean;
  headers?: Record<string, string>;
};

const visitorIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

const noStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

const sharedCacheHeaders = {
  // Browsers always revalidate; the CDN absorbs repeated reads for a short time.
  "Cache-Control": "public, max-age=0, must-revalidate",
  "CDN-Cache-Control": `public, max-age=${VIEW_CDN_CACHE_SECONDS}, stale-while-revalidate=${VIEW_CDN_CACHE_SECONDS * 2}`,
  "Vercel-CDN-Cache-Control": `public, max-age=${VIEW_CDN_CACHE_SECONDS}, stale-while-revalidate=${VIEW_CDN_CACHE_SECONDS * 2}`,
};

function response(body: Body, { status = 200, visitorId, shared = false, headers }: ResponseOptions = {}) {
  const result = NextResponse.json(body, {
    status,
    headers: { ...(shared ? sharedCacheHeaders : noStoreHeaders), ...headers },
  });
  if (visitorId) {
    result.cookies.set(VIEW_VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return result;
}

const notFound = () => response({ views: null, counted: false, error: "Article not found." }, { status: 404 });
const tooManyRequests = () =>
  response(
    { views: null, counted: false, error: "Too many requests." },
    { status: 429, headers: { "Retry-After": String(VIEW_RETRY_AFTER_SECONDS) } },
  );
const unavailable = (visitorId?: string) =>
  response({ views: null, counted: false, error: "Views are temporarily unavailable." }, { status: 503, visitorId });

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!origin || (fetchSite && fetchSite !== "same-origin")) return false;
  try {
    const url = new URL(origin);
    return origin === url.origin && url.origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

// On Vercel the platform sets x-forwarded-for to the real client IP, so the
// first entry cannot be spoofed by the client.
export function clientAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function createViewCountHandlers(dependencies: Dependencies) {
  async function GET(request: NextRequest, { params }: Context) {
    try {
      // Rate limit before the slug check so abuse never reaches Notion.
      if (!(await dependencies.allowRequest(clientAddress(request)))) return tooManyRequests();
      const { slug } = await params;
      if (!(await dependencies.isPublishedPostSlug(slug))) return notFound();
      return response({ views: await dependencies.getViews(slug), counted: false }, { shared: true });
    } catch {
      return unavailable();
    }
  }

  async function POST(request: NextRequest, { params }: Context) {
    if (!sameOrigin(request)) {
      return response({ views: null, counted: false, error: "Same-origin request required." }, { status: 403 });
    }

    let newVisitorId: string | undefined;
    try {
      if (!(await dependencies.allowRequest(clientAddress(request)))) return tooManyRequests();
      const { slug } = await params;
      if (!(await dependencies.isPublishedPostSlug(slug))) return notFound();

      const cookie = request.cookies.get(VIEW_VISITOR_COOKIE)?.value;
      const visitorId = cookie && visitorIdPattern.test(cookie) ? cookie : (newVisitorId = randomUUID());
      // No client count or request body is used; Redis determines the result.
      return response(await dependencies.incrView(slug, visitorId), { visitorId: newVisitorId });
    } catch {
      return unavailable(newVisitorId);
    }
  }

  return { GET, POST };
}
