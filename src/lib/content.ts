import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { Locale } from "@/i18n/config";

/**
 * Content library — Milestone 2.
 *
 * All editorial content lives as MDX files in Git:
 *
 *   content/<locale>/pages/<slug>.mdx      e.g. content/de/pages/about.mdx
 *
 * Each file starts with YAML "frontmatter" (metadata between ---
 * lines), which we validate with Zod so a typo in a content file
 * fails the build with a clear message instead of breaking a page
 * silently.
 */

/**
 * Content lives in `src/content` (canonical). A root-level
 * `content/` folder is supported as a fallback for older setups.
 */
const CONTENT_DIR =
  [
    path.join(process.cwd(), "src", "content"),
    path.join(process.cwd(), "content"),
  ].find((dir) => fs.existsSync(dir)) ?? path.join(process.cwd(), "src", "content");

/** Frontmatter every static page must provide. */
const pageFrontmatter = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  /** Optional "last updated" date, shown under the title. */
  updated: z.string().optional(),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatter>;

export type PageContent = {
  frontmatter: PageFrontmatter;
  /** Raw MDX body, rendered by <MDXRemote /> in the page. */
  body: string;
};

/**
 * Load one static page (e.g. "about") in one language.
 * Falls back to German — the primary language — if the
 * translation does not exist yet, so a missing file never
 * produces a broken page.
 */
/** Every real slug matches this shape; anything else can't be a genuine page. */
const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function getPage(locale: Locale, slug: string): PageContent {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`Invalid page slug: ${JSON.stringify(slug)}`);
  }

  const localized = path.join(CONTENT_DIR, locale, "pages", `${slug}.mdx`);
  const fallback = path.join(CONTENT_DIR, "de", "pages", `${slug}.mdx`);
  const file = fs.existsSync(localized) ? localized : fallback;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);

  const parsed = pageFrontmatter.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in ${file}: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")} — ${issue.message}`)
        .join("; ")}`
    );
  }

  return { frontmatter: parsed.data, body: content };
}
