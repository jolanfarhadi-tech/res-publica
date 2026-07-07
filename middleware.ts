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
    .map((part) => {
      const [tag, qValue] = part.trim().split(";q=");
      return {
        tag: tag.split("-")[0].toLowerCase(),
        q: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
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
  // NOTE: dot-exclusion uses a character class `[.]` rather than `\.`.
  // A backslash-escaped dot is silently unescaped by this project's
  // path-to-regexp-based matcher compiler, turning `\.` into a bare `.`
  // wildcard and making the exclusion match nearly every path. `[.]`
  // reaches the compiled regex as a literal dot without going through
  // that backslash-consuming step. Verified directly against this
  // build's own `tryToParsePath` compiler, not assumed.
  matcher: ["/((?!api|_next/static|_next/image|.*[.].*).*)"],
};
