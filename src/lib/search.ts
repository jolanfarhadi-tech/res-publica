import type { Locale } from "@/i18n/config";
import { collections, getEntries } from "@/lib/collections";

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
  return collections.flatMap((collection) =>
    getEntries(locale, collection).map((entry) => ({
      url: `/${locale}/${collection}/${entry.slug}`,
      title: entry.title,
      description: entry.description,
      collection,
      date: entry.date,
      tags: entry.tags,
      text: normalizeForSearch(
        [entry.title, entry.description, entry.tags.join(" "), entry.body].join(
          " "
        )
      ),
    }))
  );
}
