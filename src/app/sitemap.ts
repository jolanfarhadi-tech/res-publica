import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { collections, getEntries } from "@/lib/collections";
import { siteUrl } from "@/lib/seo";

/**
 * sitemap.xml — generated at build time.
 * Each URL lists its language alternates so search engines can
 * connect the de/en/fa versions of the same page.
 */

const STATIC_PATHS = [
  "",
  "/about",
  "/mission-vision",
  "/team",
  "/partners",
  "/contact",
  "/search",
  ...collections.map((collection) => `/${collection}`),
];

function urlSet(path: string, lastModified?: string) {
  const base = siteUrl();
  return locales.map((locale) => ({
    url: `${base}/${locale}${path}`,
    ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${base}/${l}${path}`])
      ),
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticUrls = STATIC_PATHS.flatMap((path) => urlSet(path));

  const entryUrls = collections.flatMap((collection) =>
    getEntries("de", collection).flatMap((entry) =>
      urlSet(`/${collection}/${entry.slug}`, entry.date)
    )
  );

  return [...staticUrls, ...entryUrls];
}
