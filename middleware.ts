import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, locales } from "@/i18n/config";

/**
 * Locale middleware.
 *
 * Every page lives under a locale prefix: /de/... /en/... /fa/...
 * If a visitor opens a path without a prefix (e.g. "/" or "/team"),
 * we redirect them to their preferred language — or German, the
 * organization's primary language, as the fallback.
 */

function detectLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  // "de-DE,de;q=0.9,en;q=0.8" -> ["de-DE", "de", "en"]
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

  // Already has a locale prefix? Nothing to do.
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return NextResponse.next();

  // Otherwise redirect, keeping the rest of the path.
  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Run on all paths except Next.js internals and static files.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
