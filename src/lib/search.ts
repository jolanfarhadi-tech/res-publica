import type { Locale } from "@/i18n/config";
import { collections, getEntries } from "@/lib/collections";
import { getPage } from "@/lib/content";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { offeringsForCategory } from "@/data/public-offerings";

/**
 * Full-text search — Milestone 6.
 *
 * At build time we produce one JSON index per language containing
 * every entry of every collection. The client downloads the index
 * once (a few KB) and searches it locally — instant results, no
 * server, works for German, English, and Persian alike.
 */

export type SearchDocument = {
  url: string;
  title: string;
  description: string;
  collection: string;
  section: string;
  date: string;
  tags: string[];
  /** Lower-cased, normalized text used for matching. */
  text: string;
};

/**
 * Normalization shared by index build and query (client copy in
 * SearchClient.tsx must stay identical): lower-case, unicode NFC,
 * unify Arabic-vs-Persian letter forms, drop the zero-width
 * non-joiner used in Persian words, strip Markdown syntax.
 */
export function normalizeForSearch(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .replaceAll("\u064A", "\u06CC") // Arabic yeh → Persian yeh
    .replaceAll("\u0643", "\u06A9") // Arabic kaf → Persian kaf
    .replaceAll("\u200C", "") // zero-width non-joiner
    .replace(/[#*_`>\[\]()]/g, " ") // Markdown punctuation
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSearchIndex(locale: Locale): SearchDocument[] {
  const dictionary = getDictionary(locale);
  const publicCopy = getPublicSiteCopy(locale);
  const pages = [
    {
      url: `/${locale}`,
      title: publicCopy.home.hero.title,
      description: publicCopy.home.hero.lede,
      body: JSON.stringify(publicCopy.home),
    },
    {
      url: `/${locale}/mission-vision`,
      ...pageForSearch(locale, "mission"),
    },
    {
      url: `/${locale}/about`,
      ...pageForSearch(locale, "about"),
    },
    {
      url: `/${locale}/method`,
      title: publicCopy.method.title,
      description: publicCopy.method.lede,
      body: JSON.stringify(publicCopy.method),
    },
    ...(["programs", "products", "services"] as const).map((category) => ({
      url: `/${locale}/${category}`,
      title: publicCopy.categories[category].title,
      description: publicCopy.categories[category].lede,
      body: JSON.stringify(offeringsForCategory(locale, category)),
    })),
    {
      url: `/${locale}/membership`,
      title: dictionary.platform.membership.title,
      description: dictionary.platform.membership.lede,
      body: publicCopy.membershipIntro,
    },
  ].map((page) => ({
    ...page,
    collection: "pages",
    section: dictionary.meta.title,
    date: "2026-07-24",
    tags: [],
    text: normalizeForSearch(
      [page.title, page.description, page.body].join(" ")
    ),
  }));

  const entries = collections.flatMap((collection) =>
    getEntries(locale, collection).map((entry) => ({
      url: `/${locale}/${collection}/${entry.slug}`,
      title: entry.title,
      description: entry.description,
      collection,
      section: dictionary.collections[collection].title,
      date: entry.date,
      tags: entry.tags,
      text: normalizeForSearch(
        [entry.title, entry.description, entry.tags.join(" "), entry.body].join(
          " "
        )
      ),
    }))
  );
  return [...pages, ...entries];
}

function pageForSearch(locale: Locale, slug: "mission" | "about") {
  const page = getPage(locale, slug);
  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    body: page.body,
  };
}
