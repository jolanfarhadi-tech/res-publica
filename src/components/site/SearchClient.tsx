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

  return (
    <div className="max-w-4xl">
      <label htmlFor="site-search" className="sr-only">
        {t.label}
      </label>
      <div className="glass-panel relative rounded-2xl">
        <svg
          aria-hidden="true"
          className="absolute start-5 top-1/2 -translate-y-1/2 text-muted"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          id="site-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.placeholder}
          autoComplete="off"
          className="min-h-16 w-full rounded-2xl border border-transparent bg-transparent ps-14 pe-5 text-lg text-ink placeholder:text-muted focus:border-accent"
        />
      </div>

      {/* Status line — polite live region for screen readers. */}
      <p role="status" aria-live="polite" className="mt-4 min-h-6 text-sm text-muted">
        {failed && t.errorLoading}
        {!failed && index === null && t.loading}
        {tooShort && t.minChars}
        {showNoResults && t.noResults.replace("{query}", trimmed)}
        {results.length === 1 && t.oneResult}
        {results.length > 1 &&
          t.results.replace("{count}", String(results.length))}
      </p>

      <ol className="mt-8 divide-y divide-border border-y border-border">
        {results.map((doc, index) => (
          <li key={doc.url}>
            <Link
              href={doc.url}
              className="group grid gap-3 py-6 transition-colors hover:text-accent sm:grid-cols-[3rem_1fr_auto] sm:items-start"
            >
              <span className="editorial-index text-xs text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="civic-label">{doc.section}</span>
                <span className="mt-2 block font-serif text-2xl font-semibold">
                  {doc.title}
                </span>
                <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-muted">
                  {doc.description}
                </span>
              </span>
              <span aria-hidden="true" className="text-muted group-hover:text-accent">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
