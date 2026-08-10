import type { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionaries";
import { getPublicSiteCopy } from "../i18n/public-site";
import { offeringsForCategory } from "../data/public-offerings";
import { buildRepositoryKnowledgeGraph } from "../modules/knowledge-graph/repository-build";
import { collections, getEntries } from "./collections";
import { getPage } from "./content";

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
  /** Human-review candidates are separate; these IDs come only from deterministic public MDX declarations. */
  knowledgeGraphEntityIds: string[];
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

export async function buildSearchIndex(
  locale: Locale
): Promise<SearchDocument[]> {
  const dictionary = await getDictionary(locale);
  const publicCopy = getPublicSiteCopy(locale);
  const graphEntitiesByUrl = publicGraphEntitiesByUrl();
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
    knowledgeGraphEntityIds: graphEntitiesByUrl.get(page.url)?.ids ?? [],
    text: normalizeForSearch(
      [page.title, page.description, page.body, ...(graphEntitiesByUrl.get(page.url)?.terms ?? [])].join(" ")
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
      knowledgeGraphEntityIds:
        graphEntitiesByUrl.get(`/${locale}/${collection}/${entry.slug}`)?.ids ?? [],
      text: normalizeForSearch(
        [
          entry.title,
          entry.description,
          entry.tags.join(" "),
          entry.body,
          ...(graphEntitiesByUrl.get(`/${locale}/${collection}/${entry.slug}`)?.terms ?? []),
        ].join(
          " "
        )
      ),
    }))
  );
  return [...pages, ...entries];
}

function publicGraphEntitiesByUrl() {
  const graph = buildRepositoryKnowledgeGraph();
  const byUrl = new Map<string, { ids: string[]; terms: string[] }>();
  for (const entity of graph.entities.values()) {
    for (const source of entity.sources) {
      if (!source.publicEligible) continue;
      const normalized = source.file.replaceAll("\\", "/");
      const match = normalized.match(/(?:^|\/)content\/(de|en|fa)\/(news|projects|research|publications|events|pages)\/([a-z0-9-]+)\.mdx$/);
      if (!match) continue;
      const [, sourceLocale, section, slug] = match;
      const url = section === "pages" ? `/${sourceLocale}/${slug}` : `/${sourceLocale}/${section}/${slug}`;
      const current = byUrl.get(url) ?? { ids: [], terms: [] };
      if (!current.ids.includes(entity.id)) current.ids.push(entity.id);
      for (const term of [entity.canonicalName, ...entity.aliases.map((alias) => alias.name)]) {
        if (!current.terms.includes(term)) current.terms.push(term);
      }
      current.ids.sort((left, right) => left.localeCompare(right, "en"));
      current.terms.sort((left, right) => left.localeCompare(right, "en"));
      byUrl.set(url, current);
    }
  }
  return byUrl;
}

function pageForSearch(locale: Locale, slug: "mission" | "about") {
  const page = getPage(locale, slug);
  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    body: page.body,
  };
}
