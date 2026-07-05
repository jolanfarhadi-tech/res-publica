import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { Locale } from "@/i18n/config";

/**
 * Collections library — Milestone 3.
 *
 * The four dynamic sections share one mechanism. Content lives at:
 *
 *   content/<locale>/<collection>/<slug>.mdx
 *   e.g. content/de/projects/buergerdialog-2026.mdx
 *
 * The GERMAN folder defines which entries exist (it is the primary
 * language). For each slug we load the localized file if it exists,
 * otherwise fall back to the German one — a missing translation
 * never breaks a page.
 */

export const collections = [
  "news",
  "projects",
  "research",
  "publications",
  "events",
] as const;

export type Collection = (typeof collections)[number];

/**
 * Content lives in `src/content` (canonical). A root-level
 * `content/` folder is supported as a fallback for older setups.
 */
const CONTENT_DIR =
  [
    path.join(process.cwd(), "src", "content"),
    path.join(process.cwd(), "content"),
  ].find((dir) => fs.existsSync(dir)) ?? path.join(process.cwd(), "src", "content");

/**
 * One frontmatter schema for all collections. The optional fields
 * are used where they make sense (location for events, authors for
 * publications, status for projects).
 */
const entryFrontmatter = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  /** ISO date: publication date, or start date for events. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"),
  tags: z.array(z.string()).default([]),
  /** Events */
  location: z.string().optional(),
  endDate: z.string().optional(),
  /** Publications / research */
  authors: z.array(z.string()).optional(),
  /** Projects */
  status: z.enum(["ongoing", "completed"]).optional(),
});

export type EntryFrontmatter = z.infer<typeof entryFrontmatter>;

export type Entry = EntryFrontmatter & {
  slug: string;
  collection: Collection;
  body: string;
};

/** Every real slug matches this shape; anything else can't be a genuine entry. */
const SLUG_PATTERN = /^[a-z0-9-]+$/;

function readEntry(
  locale: Locale,
  collection: Collection,
  slug: string
): Entry | null {
  if (!SLUG_PATTERN.test(slug)) return null;

  const localized = path.join(CONTENT_DIR, locale, collection, `${slug}.mdx`);
  const fallback = path.join(CONTENT_DIR, "de", collection, `${slug}.mdx`);
  const file = fs.existsSync(localized) ? localized : fallback;
  if (!fs.existsSync(file)) return null;

  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const parsed = entryFrontmatter.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in ${file}: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")} — ${issue.message}`)
        .join("; ")}`
    );
  }
  return { ...parsed.data, slug, collection, body: content };
}

/** Slugs are defined by the German (primary) content folder. */
export function getSlugs(collection: Collection): string[] {
  const dir = path.join(CONTENT_DIR, "de", collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => name.replace(/\.mdx$/, ""));
}

/** All entries of one collection, newest first. */
export function getEntries(locale: Locale, collection: Collection): Entry[] {
  return getSlugs(collection)
    .map((slug) => readEntry(locale, collection, slug))
    .filter((entry): entry is Entry => entry !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getEntry(
  locale: Locale,
  collection: Collection,
  slug: string
): Entry | null {
  return readEntry(locale, collection, slug);
}

/** Every tag used in a collection (for the filter row). */
export function getTags(locale: Locale, collection: Collection): string[] {
  const tags = new Set<string>();
  for (const entry of getEntries(locale, collection)) {
    entry.tags.forEach((tag) => tags.add(tag));
  }
  return [...tags].sort();
}

/** Up to `limit` other entries sharing at least one tag. */
export function getRelated(
  locale: Locale,
  entry: Entry,
  limit = 3
): Entry[] {
  return getEntries(locale, entry.collection)
    .filter(
      (other) =>
        other.slug !== entry.slug &&
        other.tags.some((tag) => entry.tags.includes(tag))
    )
    .slice(0, limit);
}
