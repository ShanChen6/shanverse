import "server-only";

import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import type { ViewCountResult } from "./view-count";

export const VIEW_VISITOR_COOKIE = "shanverse-blog-visitor";

type Context = { params: Promise<{ slug: string }> };
type Dependencies = {
  isPublishedPostSlug(slug: string): Promise<boolean>;
  getViews(slug: string): Promise<number>;
  incrView(slug: string, visitorId: string): Promise<ViewCountResult>;
};

const visitorIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function response(
  body: { views: number | null; counted: boolean; error?: string },
  status = 200,
  visitorId?: string,
) {
  const result = NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
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

export function createViewCountHandlers(dependencies: Dependencies) {
  async function GET(_request: NextRequest, { params }: Context) {
    try {
      const { slug } = await params;
      if (!(await dependencies.isPublishedPostSlug(slug))) {
        return response({ views: null, counted: false, error: "Article not found." }, 404);
      }
      return response({ views: await dependencies.getViews(slug), counted: false });
    } catch {
      return response({ views: null, counted: false, error: "Views are temporarily unavailable." }, 503);
    }
  }

  async function POST(request: NextRequest, { params }: Context) {
    if (!sameOrigin(request)) {
      return response({ views: null, counted: false, error: "Same-origin request required." }, 403);
    }

    let newVisitorId: string | undefined;
    try {
      const { slug } = await params;
      if (!(await dependencies.isPublishedPostSlug(slug))) {
        return response({ views: null, counted: false, error: "Article not found." }, 404);
      }

      const cookie = request.cookies.get(VIEW_VISITOR_COOKIE)?.value;
      const visitorId = cookie && visitorIdPattern.test(cookie) ? cookie : (newVisitorId = randomUUID());
      // No client count or request body is used; Redis determines the result.
      return response(await dependencies.incrView(slug, visitorId), 200, newVisitorId);
    } catch {
      return response(
        { views: null, counted: false, error: "Views are temporarily unavailable." },
        503,
        newVisitorId,
      );
    }
  }

  return { GET, POST };
}
