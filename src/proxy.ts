import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeCookie,
  localeHeader,
  stripLocale,
} from "@/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1];
  const pathnameLocale = isLocale(firstSegment) ? firstSegment : null;

  if (!pathnameLocale) {
    const savedLocale = request.cookies.get(localeCookie)?.value;
    const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeHeader, pathnameLocale);
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = stripLocale(pathname);
  const response = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
  response.cookies.set(localeCookie, pathnameLocale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
