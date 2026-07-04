import { isLocale, locales, type Locale } from "@/i18n/config";
import { buildSearchIndex } from "@/lib/search";

/** /de/search-index.json etc. — generated at build time. */

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "de";
  return Response.json(buildSearchIndex(locale));
}
