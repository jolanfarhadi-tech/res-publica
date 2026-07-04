import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, locales } from "@/i18n/config";

/**
 * Locale middleware.
 *
 * 1. Paths without a locale prefix are redirected to the visitor's
 *    preferred language (German as fallback).
 * 2. For locale-prefixed paths we attach an `x-locale` request
 *    header so special pages that receive no route params — like
 *    not-found.tsx — can still render in the right language.
 */

function detectLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .map((tag) => tag.split("-")[0]);

  for (const tag of preferred) {
    if (isLocale(tag)) return tag;
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const currentLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (currentLocale) {
    const headers = new Headers(request.headers);
    headers.set("x-locale", currentLocale);
    return NextResponse.next({ request: { headers } });
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
