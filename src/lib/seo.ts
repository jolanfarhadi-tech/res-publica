import { defaultLocale, locales, type Locale } from "@/i18n/config";

/** The public site URL — set NEXT_PUBLIC_SITE_URL in Vercel. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path}`;
}

/**
 * Canonical + hreflang alternates for one page.
 * `path` is the locale-less path: "" (home), "/about",
 * "/projects/some-slug", … Combined with `metadataBase` from the
 * layout, Next renders absolute <link rel="canonical"> and
 * <link rel="alternate" hreflang="…"> tags for de/en/fa plus
 * x-default (German, the primary language).
 */
export function pageAlternates(locale: Locale, path: string) {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, `/${l}${path}`])
  );
  languages["x-default"] = `/${defaultLocale}${path}`;

  return {
    canonical: `/${locale}${path}`,
    languages,
    types: { "application/rss+xml": `/${locale}/rss.xml` },
  };
}
