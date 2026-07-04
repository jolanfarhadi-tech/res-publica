import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getEntries } from "@/lib/collections";
import { absoluteUrl } from "@/lib/seo";

/**
 * RSS 2.0 feed per language: /de/rss.xml, /en/rss.xml, /fa/rss.xml.
 * Contains news, research, and publications (newest first). Generated at
 * build time.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "de";
  const dict = getDictionary(locale);

  const items = [
    ...getEntries(locale, "news"),
    ...getEntries(locale, "research"),
    ...getEntries(locale, "publications"),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20)
    .map((entry) => {
      const url = absoluteUrl(`/${locale}/${entry.collection}/${entry.slug}`);
      return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(`${entry.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(entry.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(dict.meta.title)}</title>
    <link>${absoluteUrl(`/${locale}`)}</link>
    <description>${escapeXml(dict.meta.description)}</description>
    <language>${locale}</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
