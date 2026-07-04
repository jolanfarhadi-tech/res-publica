"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SearchDocument } from "@/lib/search";

/**
 * SearchClient — downloads the per-locale index once, then searches
 * locally as the visitor types (debounced). Ranking: title matches
 * weigh most, then tags, then description; body matches count via
 * the combined text field. All query terms must match (AND).
 *
 * IMPORTANT: normalize() must stay IDENTICAL to normalizeForSearch()
 * in src/lib/search.ts — index and query must agree on normalization.
 */

function normalize(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .replaceAll("\u064A", "\u06CC") // Arabic yeh → Persian yeh
    .replaceAll("\u0643", "\u06A9") // Arabic kaf → Persian kaf
    .replaceAll("\u200C", "") // zero-width non-joiner
    .replace(/[#*_`>\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function score(doc: SearchDocument, terms: string[]): number {
  const title = normalize(doc.title);
  const tags = normalize(doc.tags.join(" "));
  const description = normalize(doc.description);
  let total = 0;
  for (const term of terms) {
    if (!doc.text.includes(term)) return 0; // AND semantics
    if (title.includes(term)) total += 5;
    if (tags.includes(term)) total += 3;
    if (description.includes(term)) total += 2;
    total += 1; // matched somewhere in the combined text
  }
  return total;
}

export function SearchClient({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.search;
  const [index, setIndex] = useState<SearchDocument[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the index once; focus the field for immediate typing.
  useEffect(() => {
    inputRef.current?.focus();
    fetch(`/${locale}/search-index.json`)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then(setIndex)
      .catch(() => setFailed(true));
  }, [locale]);

  // Debounce typing by 150 ms.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!index) return [];
    const trimmed = debounced.trim();
    if (trimmed.length < 2) return [];
    const terms = normalize(trimmed).split(" ").filter(Boolean);
    if (terms.length === 0) return [];
    return index
      .map((doc) => ({ doc, points: score(doc, terms) }))
      .filter((hit) => hit.points > 0)
      .sort(
        (a, b) => b.points - a.points || b.doc.date.localeCompare(a.doc.date)
      )
      .map((hit) => hit.doc);
  }, [index, debounced]);

  const trimmed = debounced.trim();
  const tooShort = trimmed.length === 1;
  const showNoResults =
    index !== null && trimmed.length >= 2 && results.length === 0;

  function sectionTitle(collection: string): string {
    const sections = dict.collections as Record<
      string,
      { title: string } | unknown
    >;
    const section = sections[collection];
    return section && typeof section === "object" && "title" in section
      ? (section as { title: string }).title
      : collection;
  }

  return (
    <div className="max-w-2xl">
      <label htmlFor="site-search" className="sr-only">
        {t.label}
      </label>
      <input
        ref={inputRef}
        id="site-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t.placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-lg text-ink placeholder:text-muted focus:border-accent"
      />

      {/* Status line — polite live region for screen readers. */}
      <p role="status" aria-live="polite" className="mt-3 text-sm text-muted">
        {failed && t.errorLoading}
        {!failed && index === null && t.loading}
        {tooShort && t.minChars}
        {showNoResults && t.noResults.replace("{query}", trimmed)}
        {results.length === 1 && t.oneResult}
        {results.length > 1 &&
          t.results.replace("{count}", String(results.length))}
      </p>

      <ul className="mt-6 space-y-4">
        {results.map((doc) => (
          <li key={doc.url}>
            <Link
              href={doc.url}
              className="block rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent"
            >
              <p className="text-xs uppercase tracking-[0.15em] text-gold">
                {sectionTitle(doc.collection)}
              </p>
              <h2 className="mt-2 text-xl">{doc.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {doc.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
