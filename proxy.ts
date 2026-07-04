import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales, type Locale } from "./app/[lang]/dictionaries";

function pickLocaleFromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;

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
    if (hasLocale(tag)) return tag;
  }
  return undefined;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return;

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale =
    (cookieLocale && hasLocale(cookieLocale) ? cookieLocale : undefined) ??
    pickLocaleFromAcceptLanguage(request.headers.get("accept-language")) ??
    defaultLocale;

  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
