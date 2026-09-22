import { NextResponse, type NextRequest } from "next/server";

import { getCachedBlogPosts } from "@/features/blog/blog-data";
import {
  getViewStore,
  isViewStoreConfigured,
} from "@/features/views/adapters/view-store";
import {
  isPublishedPostSlug,
  normalizeViewSlug,
} from "@/features/views/view-key";
import { isAllowedViewOrigin } from "@/features/views/view-origin";
import { ViewRateLimitError } from "@/features/views/view.types";

type Context = { params: Promise<{ slug: string }> };

type ErrorCode =
  | "origin_not_allowed"
  | "invalid_slug"
  | "post_not_found"
  | "rate_limited"
  | "store_unavailable";

const noStoreHeaders = { "cache-control": "private, no-store, max-age=0" };

function success(count: number, incremented: boolean) {
  return NextResponse.json(
    { ok: true, count, incremented, available: true },
    { headers: noStoreHeaders },
  );
}

function failure(error: ErrorCode, status: number) {
  return NextResponse.json(
    {
      ok: false,
      count: null,
      incremented: false,
      available: error !== "store_unavailable",
      error,
    },
    { status, headers: noStoreHeaders },
  );
}

async function isPublished(slug: string): Promise<boolean> {
  const posts = await getCachedBlogPosts();
  return isPublishedPostSlug(posts, slug);
}

function hasValidOrigin(request: NextRequest): boolean {
  return isAllowedViewOrigin({
    origin: request.headers.get("origin"),
    requestUrl: request.url,
    host: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    environment: process.env.NODE_ENV,
  });
}

async function validatedSlug(
  params: Context["params"],
): Promise<{ slug: string } | { response: NextResponse }> {
  const { slug: rawSlug } = await params;
  const slug = normalizeViewSlug(rawSlug);
  if (!slug) return { response: failure("invalid_slug", 400) };
  if (!(await isPublished(slug))) {
    return { response: failure("post_not_found", 404) };
  }
  return { slug };
}

export async function GET(_request: NextRequest, { params }: Context) {
  if (!isViewStoreConfigured()) {
    return failure("store_unavailable", 503);
  }
  try {
    const validation = await validatedSlug(params);
    if ("response" in validation) return validation.response;
    const count = await getViewStore().get(validation.slug);
    return success(count, false);
  } catch {
    return failure("store_unavailable", 503);
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  if (!hasValidOrigin(request)) return failure("origin_not_allowed", 403);
  if (!isViewStoreConfigured()) {
    return failure("store_unavailable", 503);
  }
  try {
    const validation = await validatedSlug(params);
    if ("response" in validation) return validation.response;
    const count = await getViewStore().increment(validation.slug);
    return success(count, true);
  } catch (error) {
    if (error instanceof ViewRateLimitError) {
      const response = failure("rate_limited", 429);
      response.headers.set("retry-after", "10");
      return response;
    }
    return failure("store_unavailable", 503);
  }
}
