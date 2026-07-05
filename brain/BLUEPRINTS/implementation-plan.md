<!-- markdownlint-disable -->
# res-publica — Implementation Plan

Derived from the 5-specialist review (Architecture, Security, Performance, Next.js Specialist, Code Review). No files have been changed — this is planning only.

**Total items:** 21, grouped P0–P3.

## Quick index

| Tier | # | Item |
|---|---|---|
| P0 | 1 | Delete broken/dead `proxy.ts` |
| P0 | 2 | Validate `slug` before filesystem access (path-traversal hardening) |
| P0 | 3 | Add rate limiting to `/api/newsletter` |
| P0 | 4 | Escape JSON-LD `dangerouslySetInnerHTML` output |
| P1 | 5 | Add `React.cache()` around content I/O |
| P1 | 6 | Add CSP + HSTS headers |
| P1 | 7 | Fix `getTags`/`CollectionIndex` redundant re-fetch |
| P1 | 8 | Add minimal test suite for core logic |
| P2 | 9 | Make collection index pages static/ISR (move filtering client-side) |
| P2 | 10 | Consolidate `CONTENT_DIR` resolution |
| P2 | 11 | Consolidate search-normalization duplicate |
| P2 | 12 | Remove redundant `locale as Locale` casts |
| P2 | 13 | Fix Footer/Header nav-list duplication |
| P2 | 14 | Delete dead `mission` route |
| P2 | 15 | Resolve orphaned `lib/cn.ts` |
| P3 | 16 | Remove unused `dict` prop in `EntryGrid` |
| P3 | 17 | Add `ignores` block to `eslint.config.mjs` |
| P3 | 18 | Split `Header.tsx` to reduce client hydration cost |
| P3 | 19 | Lazy-load locale dictionaries |
| P3 | 20 | Add `generateStaticParams` to `opengraph-image.tsx` |
| P3 | 21 | Track/upgrade transitive `postcss` advisory |

---

## P0 — Critical, fix immediately

### 1. Delete broken/dead `proxy.ts`

**Why it matters:** All 5 reviewers independently flagged this. `proxy.ts` is not a recognized Next.js 15.5.20 file convention (only `middleware.ts` runs) and is imported nowhere in the repo — it is dead code. It is also broken: a missing `??` between lines 35–36 means, if it were ever executed, `locale` would resolve to `undefined` for any visitor without a `NEXT_LOCALE` cookie, producing malformed `/undefined/...` redirect paths. It currently holds *better* locale-detection logic (q-value Accept-Language parsing, cookie support) than the live `middleware.ts`, stranded and unused.

**Estimated effort:** 30–60 minutes.

**Risk if not fixed:** A future contributor or an agent (steered by AGENTS.md's "this is not the Next.js you know" framing) may "fix" and re-enable this file believing it's the real routing gate, silently reintroducing a broken locale redirect in production. It also currently duplicates security-relevant logic in two places that can drift.

**Exact files to modify:**
- `proxy.ts` (delete)
- `middleware.ts` (port improved logic)
- `scripts/check-structure.mjs` (extend guard)

**Step-by-step plan:**
1. Diff `proxy.ts`'s `pickLocaleFromAcceptLanguage` (q-value-aware) against `middleware.ts`'s `detectLocale` to confirm the q-value parsing and `NEXT_LOCALE` cookie read are genuine improvements worth keeping.
2. Port the q-value-aware Accept-Language parsing into `middleware.ts`. Decide whether to also support a `NEXT_LOCALE` cookie — if so, confirm something will actually set that cookie (currently nothing does — verified via repo-wide search), e.g. add it in `LanguageSwitcher.tsx` when a user manually switches locale.
3. Delete `proxy.ts`.
4. In `scripts/check-structure.mjs`, add a check alongside the existing duplicate-`middleware.ts` guard (~line 53-60) that fails the build if `proxy.ts` exists at the repo root.
5. Run `npx tsc --noEmit`, `npm run lint`, and `npm run build` to confirm nothing referenced the deleted file.
6. Manually test locale redirect behavior in dev (`npm run dev`) with different `Accept-Language` headers (use curl or browser devtools override) to confirm the ported logic works as intended.

---

### 2. Validate `slug` before filesystem access (path-traversal hardening)

**Why it matters:** `readEntry` (`src/lib/collections.ts:69-89`) and `getPage` (`src/lib/content.ts:53-55`) build filesystem paths via `path.join(CONTENT_DIR, locale, collection, \`${slug}.mdx\`)` directly from the dynamic route param, with no allowlist check against `getSlugs()`. Since `dynamicParams` defaults to `true` and is never overridden, requests for slugs outside the build-time static list still reach these functions with a raw, unvalidated string.

**Estimated effort:** 2–3 hours (including testing all 5 collections).

**Risk if not fixed:** Defense-in-depth gap that could allow filesystem path traversal or unexpected file reads if any encoding/normalization edge case in Next's router permits it. Even absent a working exploit, it's an unvalidated-input hole a pentest will flag immediately.

**Exact files to modify:**
- `src/lib/collections.ts` (`readEntry`, ~lines 69-89)
- `src/lib/content.ts` (`getPage`, ~lines 53-55)
- `src/app/[locale]/news/[slug]/page.tsx`, `projects/[slug]/page.tsx`, `research/[slug]/page.tsx`, `publications/[slug]/page.tsx`, `events/[slug]/page.tsx` (add `dynamicParams = false`)

**Step-by-step plan:**
1. In `src/lib/collections.ts`, add a strict slug pattern check (e.g. `/^[a-z0-9-]+$/`) or an allowlist check against `getSlugs(collection)` at the top of `readEntry`, returning `null` immediately on mismatch (matching the existing not-found handling pattern).
2. Apply the same guard in `getPage` in `src/lib/content.ts`.
3. In each of the five `[slug]/page.tsx` files, add `export const dynamicParams = false;` so Next.js returns a 404 for any slug not covered by `generateStaticParams`, instead of attempting on-demand rendering with an unvalidated slug.
4. Rebuild (`npm run build`) and verify all currently-valid slugs still statically generate and render correctly.
5. Manually test an invalid/malicious slug (e.g. `../../../etc/passwd`-shaped segment, URL-encoded variants) against a local dev server and confirm a clean 404 rather than any filesystem error or unexpected content.
6. Add a regression test (see item 8) covering both a valid and an invalid slug for at least one collection.

---

### 3. Add rate limiting to `/api/newsletter`

**Why it matters:** The only anti-abuse control is a honeypot field; there is no IP-based or other throttling, and `middleware.ts`'s matcher explicitly excludes `/api`, so nothing upstream limits requests either. An attacker can script repeated POSTs with arbitrary victim email addresses, turning the site's newsletter provider (Buttondown/Mailchimp) into a spam-email relay against third parties at no cost to the attacker.

**Estimated effort:** Half a day (including provider/infra decision and testing).

**Risk if not fixed:** Newsletter provider account could be used to spam arbitrary third-party inboxes, risking the provider account's sending reputation/suspension and potential abuse complaints against the project.

**Exact files to modify:**
- `src/app/api/newsletter/route.ts`
- `middleware.ts` (matcher adjustment, or a dedicated check inside the route)
- `package.json` (new dependency, e.g. `@upstash/ratelimit` + `@upstash/redis`, or an in-memory/edge-KV alternative if Upstash isn't available in this deployment)

**Step-by-step plan:**
1. Decide on a rate-limiting backend appropriate for the deployment target (Vercel + Upstash Redis is the standard low-effort option; confirm what's available in this project's infra before committing).
2. Add the chosen package to `package.json` and wire up required environment variables (document in `.env.example`).
3. In `src/app/api/newsletter/route.ts`, add a rate-limit check keyed by request IP (and optionally by submitted email) before the honeypot/provider logic — e.g. 5 requests/hour per IP.
4. Return HTTP 429 with a clear (but not information-leaking) message when the limit is exceeded.
5. Since `middleware.ts`'s matcher currently excludes `/api`, confirm the rate limit is enforced inside the route handler itself (not dependent on middleware), or add a second matcher entry if handling it at the middleware layer is preferred.
6. Test locally by scripting rapid repeated POSTs and confirming the 429 kicks in at the configured threshold.
7. Document the new environment variables in `.env.example` and `README.md`.

---

### 4. Escape JSON-LD `dangerouslySetInnerHTML` output

**Why it matters:** `JsonLd.tsx` pipes `JSON.stringify(data)` directly into `dangerouslySetInnerHTML` without escaping `</script>` sequences. Not exploitable today since `data` is always built from repo-controlled MDX frontmatter, but any future field (author name, event location, etc.) sourced from less-trusted input would allow injected markup to break out of the `<script type="application/ld+json">` tag and execute.

**Estimated effort:** 30 minutes.

**Risk if not fixed:** Low today, but a silent XSS trap for whoever adds the next content source without realizing this component isn't safe-by-default.

**Exact files to modify:**
- `src/components/seo/JsonLd.tsx` (line 9)

**Step-by-step plan:**
1. Replace `JSON.stringify(data)` with a version that also escapes `<` as `<` (the standard safe pattern for embedding JSON inside a `<script>` tag): `JSON.stringify(data).replace(/</g, "\\u003c")`.
2. Confirm structured data still validates correctly (e.g. via Google's Rich Results Test or a local JSON-LD parser) after the escaping change.
3. Add a one-line comment explaining why the escape exists, since it's not obviously necessary from reading the code alone.

---

## P1 — High priority

### 5. Add `React.cache()` around content I/O

**Why it matters:** `getSlugs`, `getEntries`, `readEntry`, and `getPage` do synchronous `fs.readFileSync` + `gray-matter` parsing + Zod validation with zero memoization anywhere in the repo. `CollectionIndex.tsx` calls `getEntries` then `getTags` (which internally calls `getEntries` again) — a 2× redundant full-collection read on every render of 5 dynamic index pages, on every request, forever. This is the single biggest concrete performance cost in the app.

**Estimated effort:** 1 day (implementation + verifying all call sites still behave correctly).

**Risk if not fixed:** Linear cost growth with content volume and traffic; no ISR/CDN caching is possible for these routes since they're already forced dynamic (see item 9), so this cost is paid synchronously on every single request with no cushion.

**Exact files to modify:**
- `src/lib/collections.ts` (`getSlugs`, `getEntries`, `readEntry`, `getTags`, `getRelated`)
- `src/lib/content.ts` (`getPage`)

**Step-by-step plan:**
1. Import `cache` from `react` in `src/lib/collections.ts` and `src/lib/content.ts`.
2. Wrap `getSlugs`, `readEntry`, and `getEntries` with `cache(...)` so repeated calls with the same arguments within a single request/render tree are deduped automatically.
3. Wrap `getPage` in `src/lib/content.ts` the same way.
4. Re-verify `getTags` and `getRelated` now benefit from the cached `getEntries` underneath them without further changes (or combine with item 7's refactor for a cleaner fix).
5. Run the full build (`npm run build`) and spot-check that static generation output is unchanged (same pages, same content) — `cache()` changes performance characteristics, not behavior, so output must be byte-identical.
6. If feasible, add a simple instrumentation check (temporary `console.time`/count wrapper in dev) to confirm the number of `fs.readFileSync` calls per request/build drops as expected, then remove the instrumentation.

---

### 6. Add CSP + HSTS headers

**Why it matters:** `next.config.ts` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`, but no `Content-Security-Policy` or `Strict-Transport-Security`. Combined with the `dangerouslySetInnerHTML` usages (items 4 and the theme-init script), a CSP provides meaningful defense-in-depth against script injection, and HSTS prevents SSL-stripping on a user's first plain-HTTP visit.

**Estimated effort:** 1–2 hours implementation, plus testing time to avoid breaking any inline scripts/styles (theme-init script, any third-party embeds).

**Risk if not fixed:** No browser-level containment if any future code path or compromised dependency injects attacker-controlled markup; first-visit-over-HTTP is not automatically upgraded to HTTPS.

**Exact files to modify:**
- `next.config.ts` (`headers()`, ~lines 13-29)

**Step-by-step plan:**
1. Inventory every inline script/style currently rendered (theme-init script in `src/app/[locale]/layout.tsx:103`, any others) to determine what the CSP needs to allow.
2. Draft an initial CSP, e.g. `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';` — tightening `'unsafe-inline'` later via nonces if time allows.
3. Add `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` alongside the existing headers.
4. Add both headers to the `headers()` array in `next.config.ts`.
5. Run `npm run build && npm run start` locally and browse every route (home, all 5 collections + detail pages, search, contact, newsletter signup) checking devtools console for CSP violations.
6. Fix any violations found (usually by moving an inline script to an external file or adding a specific source to the policy) rather than loosening the policy broadly.
7. Deploy to a preview environment (if available) and re-check headers via `curl -I` before promoting to production.

---

### 7. Fix `getTags`/`CollectionIndex` redundant re-fetch

**Why it matters:** `getTags` (`src/lib/collections.ts:118-124`) always internally re-fetches entries rather than accepting already-loaded data. `CollectionIndex.tsx:76,85` calls `getEntries` then `getTags`, meaning the collection is read from disk twice per index-page render even before considering item 5's caching layer. This is a small, targeted fix independent of the broader caching work.

**Estimated effort:** 1–2 hours.

**Risk if not fixed:** Redundant disk reads persist as a code-level inefficiency even after adding `cache()` (item 5) unless combined; fixing this directly removes the redundancy at the source regardless of caching.

**Exact files to modify:**
- `src/lib/collections.ts` (`getTags`, ~lines 118-124)
- `src/components/site/CollectionIndex.tsx` (~lines 76, 85)

**Step-by-step plan:**
1. Change `getTags`'s signature from `getTags(locale, collection)` to `getTags(entries: Entry[])`, deriving the tag list from the passed-in array instead of calling `getEntries` internally.
2. Update `CollectionIndex.tsx` to call `getEntries` once (line 76), then pass that result into `getTags(all)` instead of a fresh call.
3. Search the repo for any other callers of `getTags` and update them to the new signature.
4. Run `npm run build` and manually verify tag filters on each collection index page still list the correct tags.
5. Combine with item 5 if both are being done in the same work session — this fix reduces call count, item 5's `cache()` wrapper protects any remaining duplicate calls.

---

### 8. Add a minimal test suite for core logic

**Why it matters:** There is no test framework, no test files, and no test step in CI. The riskiest untested logic is search ranking/normalization (`src/lib/search.ts`, `SearchClient.tsx`), frontmatter validation and locale fallback (`src/lib/collections.ts`, `src/lib/content.ts`), and pagination math (`CollectionIndex.tsx`) — all currently verified only by manual observation.

**Estimated effort:** 2–3 days for meaningful coverage of the areas above (not full coverage of the whole app).

**Risk if not fixed:** Regressions in search, content loading, or pagination will only surface in production, potentially silently (e.g. a broken search result set that still "looks like" it's working).

**Exact files to modify:**
- New: `vitest.config.ts` (or `jest.config.ts`), `package.json` (add test dependency + script)
- New test files: `src/lib/search.test.ts`, `src/lib/collections.test.ts`, `src/lib/content.test.ts`, `src/components/site/CollectionIndex.test.tsx` (or similar)
- `.github/workflows/ci.yml` (add a test step)

**Step-by-step plan:**
1. Choose a test framework — Vitest is the lower-friction choice for a Next.js/TypeScript project (faster startup, native ESM support) unless the team has an existing Jest preference.
2. Add the framework, its config, and a `test` script to `package.json`.
3. Write unit tests for `normalizeForSearch` (`src/lib/search.ts`) covering the exact cases the "must stay IDENTICAL" comment implies matter (diacritics, casing, punctuation) — this also gives you a safety net for item 11's consolidation.
4. Write unit tests for `readEntry`/`getEntries`/`getPage` covering: valid frontmatter, invalid frontmatter (should throw per current design), missing locale fallback behavior, and (after item 2 is done) invalid/malicious slugs returning `null`/404 rather than throwing an unhandled error.
5. Write a focused test for pagination math in `CollectionIndex.tsx` (page boundaries, empty result sets, single-page case).
6. Add a `test` step to `.github/workflows/ci.yml`, positioned after typecheck and before (or alongside) build.
7. Confirm CI passes end-to-end with the new step.

---

## P2 — Medium priority

### 9. Make collection index pages static/ISR (move filtering client-side)

**Why it matters:** All 5 collection index pages (`news`, `projects`, `research`, `publications`, `events`) destructure `searchParams`, which forces them out of static rendering even though the underlying MDX content is effectively static per deploy. Tag/page filtering is a pure function of data the server already has.

**Estimated effort:** 1 day (touches all 5 index pages + the shared `CollectionIndex` component).

**Risk if not fixed:** These routes remain SSR-on-every-request indefinitely, compounding with item 5's caching fix rather than eliminating the underlying architectural cost — caching reduces the cost per request, but static/ISR would eliminate most of it entirely.

**Exact files to modify:**
- `src/app/[locale]/news/page.tsx`, `projects/page.tsx`, `research/page.tsx`, `publications/page.tsx`, `events/page.tsx`
- `src/components/site/CollectionIndex.tsx`

**Step-by-step plan:**
1. Change each index `page.tsx` to fetch the full entry list at build time (no `searchParams` dependency), matching the `SearchClient.tsx` pattern of "fetch once statically, filter in the browser."
2. Move tag/page filtering logic from the server into a client component (or extend `CollectionIndex.tsx` with client-side state for the filtered/paginated view), keeping the initial full list server-rendered for fast first paint and SEO.
3. Update the URL-param-driven filter UI to update client-side state (and optionally still reflect state in the URL via `history.pushState` or `useSearchParams` client-side) without triggering a server round-trip.
4. Verify SEO-relevant behavior is preserved: confirm crawlers still see the full unfiltered entry list in the initial HTML.
5. Run `npm run build` and confirm these 5 routes now appear as static/ISR in the build output rather than dynamic.
6. Manually test tag filtering and pagination in the browser to confirm behavior is unchanged from the user's perspective.

---

### 10. Consolidate `CONTENT_DIR` resolution

**Why it matters:** The exact same `CONTENT_DIR` fallback-resolution block is duplicated in `src/lib/content.ts:24-28` and `src/lib/collections.ts:35-39`. `scripts/check-structure.mjs:45-51` already forbids the fallback condition from ever being true, so this is duplicated dead defensive code that will silently drift if either copy is edited without the other.

**Estimated effort:** 1 hour.

**Risk if not fixed:** Low immediate risk, but a maintenance trap — a future edit to one copy without the other reintroduces the exact inconsistency this consolidation prevents.

**Exact files to modify:**
- New: `src/lib/content-dir.ts`
- `src/lib/content.ts`
- `src/lib/collections.ts`

**Step-by-step plan:**
1. Create `src/lib/content-dir.ts` exporting a single `CONTENT_DIR` constant with the resolution logic currently duplicated in both files.
2. Update `src/lib/content.ts` and `src/lib/collections.ts` to import `CONTENT_DIR` from the new module instead of computing it locally.
3. Run `npm run build` to confirm content still resolves correctly in both consumers.

---

### 11. Consolidate search-normalization duplicate

**Why it matters:** `normalizeForSearch` in `src/lib/search.ts:30-40` and `normalize` in `SearchClient.tsx:19-25` are two independently maintained copies, with comments in both files stating they "must stay IDENTICAL." This is a coupling bug waiting to happen — any edit to one without the other silently breaks search relevance.

**Estimated effort:** 1–2 hours.

**Risk if not fixed:** Silent search-quality regression the next time either copy is edited in isolation — no test currently catches this (see item 8).

**Exact files to modify:**
- New: `src/lib/normalize.ts` (or similar shared module)
- `src/lib/search.ts`
- `src/components/site/SearchClient.tsx`

**Step-by-step plan:**
1. Extract the normalization function into a new shared, framework-agnostic module (must work identically in both a Node build-time context and a browser client-component context — no Node-only APIs).
2. Update `src/lib/search.ts` to import and use the shared function, removing its local copy.
3. Update `SearchClient.tsx` to import and use the same shared function, removing its local copy.
4. Run the unit test added in item 8 (or add one now if not already done) to lock in the expected normalization behavior.
5. Manually verify search results are unchanged for a handful of representative queries across locales.

---

### 12. Remove redundant `locale as Locale` casts

**Why it matters:** ~40 occurrences across ~20 files cast `locale as Locale` immediately after an `isLocale()` type-guard check has already narrowed the type — proven unnecessary by the sibling `generateMetadata` functions in the same files, which call `getDictionary(locale)` with no cast at all after the same guard. The casts silently override the compiler's own narrowing.

**Estimated effort:** 2–3 hours (mostly mechanical, but needs a careful pass per file to confirm the guard genuinely precedes each cast).

**Risk if not fixed:** If the guard logic (`isLocale`) is ever refactored to something less precise, these casts would hide the resulting type errors instead of surfacing them — a latent type-safety trap.

**Exact files to modify:** (partial list, apply pattern repo-wide)
- `src/app/[locale]/layout.tsx`, `page.tsx`
- `src/app/[locale]/news/[slug]/page.tsx`, `events/[slug]/page.tsx`, `research/[slug]/page.tsx`, `projects/[slug]/page.tsx`, `publications/[slug]/page.tsx`
- `src/app/[locale]/team/page.tsx`, `partners/page.tsx`, `contact/page.tsx`, `search/page.tsx`, `about/page.tsx`, `mission-vision/page.tsx`
- `src/app/[locale]/news/page.tsx` and sibling collection index pages
- (Note: `opengraph-image.tsx:21` genuinely needs its cast, since there the guard is an inline ternary, not a preceding early-return — leave that one as-is.)

**Step-by-step plan:**
1. Grep the repo for `as Locale` to get the full, exact list of occurrences.
2. For each occurrence, confirm a preceding `if (!isLocale(locale)) notFound();` (or equivalent) guard exists in the same function scope.
3. Remove the cast where confirmed; leave it in place (with a short comment noting why) for the one confirmed exception (`opengraph-image.tsx`).
4. Run `npx tsc --noEmit` after each file or in a batch to confirm no type errors are introduced.
5. Run `npm run build` to confirm no runtime regressions.

---

### 13. Fix Footer/Header nav-list duplication

**Why it matters:** `Header.tsx`'s `navItems()` has a doc comment stating it's "the one place the main navigation is defined (header + footer)," but `navItems()` is only used inside `Header.tsx` — `Footer.tsx` independently hardcodes its own link arrays. The two lists happen to agree today only by coincidence; the comment actively misleads.

**Estimated effort:** 1–2 hours.

**Risk if not fixed:** Adding/renaming a nav route requires remembering to edit both files with no enforcement; the misleading comment makes this more likely to be missed, not less.

**Exact files to modify:**
- `src/components/site/Header.tsx` (~lines 12-27)
- `src/components/site/Footer.tsx` (~lines 16-29)
- Optionally new: `src/lib/nav.ts`

**Step-by-step plan:**
1. Extract `navItems()` (or the underlying data it's built from) into a shared module, e.g. `src/lib/nav.ts`, if `Header.tsx` isn't a natural import target for `Footer.tsx`.
2. Update `Footer.tsx` to import and derive its `organization`/`work` link groups from the shared source instead of hardcoding them.
3. Update or remove the now-accurate doc comment in whichever file remains the source of truth.
4. Manually verify both header and footer render identical, correct links across all locales.

---

### 14. Delete dead `mission` route

**Why it matters:** `src/app/[locale]/mission/page.tsx` can never render — `next.config.ts:30-39` permanently redirects `/mission → /mission-vision`. It's also inconsistent with its sibling `mission-vision/page.tsx`, lacking the `alternates` metadata every other page sets.

**Estimated effort:** 15–30 minutes.

**Risk if not fixed:** Low, but it's confusing dead code that could mislead a future contributor into editing a page that never serves traffic.

**Exact files to modify:**
- `src/app/[locale]/mission/page.tsx` (delete)

**Step-by-step plan:**
1. Confirm the redirect in `next.config.ts:30-39` indeed covers all locales and paths that would otherwise hit this page.
2. Delete `src/app/[locale]/mission/page.tsx`.
3. Run `npm run build` and manually verify `/en/mission`, `/de/mission`, `/fa/mission` (etc.) still redirect correctly to `/mission-vision`.

---

### 15. Resolve orphaned `lib/cn.ts`

**Why it matters:** `lib/cn.ts` (root-level, outside `src/`) is unused anywhere in `src/` and isn't even reachable via the `@/*` path alias (which maps only to `src/*`). It's a decoy competing with `src/lib/` for anyone searching for a class-merging utility. Components currently hand-roll conditional class strings (`Header.tsx`, `LanguageSwitcher.tsx`, `TagFilter.tsx`).

**Estimated effort:** 30 minutes (delete) to 2 hours (adopt across components).

**Risk if not fixed:** Low — mostly a "which lib?" confusion risk for new contributors.

**Exact files to modify:**
- `lib/cn.ts` (delete, or move to `src/lib/cn.ts`)
- If adopting: `src/components/site/Header.tsx`, `LanguageSwitcher.tsx`, `TagFilter.tsx`

**Step-by-step plan:**
1. Decide whether the class-merging helper is worth adopting (recommended if conditional classNames appear in more than a couple of components) or should simply be removed.
2. If removing: delete the root `lib/` directory entirely.
3. If adopting: move `cn.ts` to `src/lib/cn.ts`, then replace hand-rolled conditional class-string logic in `Header.tsx`, `LanguageSwitcher.tsx`, and `TagFilter.tsx` with calls to the shared helper.
4. Run `npm run build` and visually spot-check affected components for unchanged styling.

---

## P3 — Low priority

### 16. Remove unused `dict` prop in `EntryGrid`

**Why it matters:** `EntryGrid` in `src/app/[locale]/page.tsx:47-55` destructures `dict` but never reads it — confirmed by `next lint`'s only current warning (`'dict' is defined but never used`).

**Estimated effort:** 10–15 minutes.

**Risk if not fixed:** Negligible — cosmetic lint noise only.

**Exact files to modify:**
- `src/app/[locale]/page.tsx` (`EntryGrid` definition ~lines 47-55, call sites ~lines 176, 192, 208, 224)

**Step-by-step plan:**
1. Remove `dict` from `EntryGrid`'s prop destructuring and its type definition.
2. Remove the `dict={...}` prop from each of the 4 call sites.
3. Run `npm run lint` to confirm the warning is gone and no other usage was missed.

---

### 17. Add `ignores` block to `eslint.config.mjs`

**Why it matters:** Running `eslint .` directly (rather than the deprecated `next lint` wrapper) currently lints `.next/**` build output and produces 7,000+ problems, because `eslint.config.mjs` has no explicit `ignores` entry — it only works today because `next lint` applies its own implicit ignores, and `next lint` itself is deprecated and slated for removal in Next.js 16.

**Estimated effort:** 15–30 minutes.

**Risk if not fixed:** When the eventual migration off `next lint` happens (via `npx @next/codemod@canary next-lint-to-eslint-cli .` or manually), CI/local linting will break or flood with noise from generated files unless this is fixed first.

**Exact files to modify:**
- `eslint.config.mjs`

**Step-by-step plan:**
1. Add an `ignores: [".next/**", "node_modules/**"]` (adjust as needed) entry to the flat-config array in `eslint.config.mjs`.
2. Run `npx eslint .` directly (not via `next lint`) and confirm the problem count drops to just the real source-tree issues.
3. Optionally, proactively run the `next-lint-to-eslint-cli` codemod now while the deprecation is still non-urgent, updating `package.json`'s `lint` script accordingly.

---

### 18. Split `Header.tsx` to reduce client hydration cost

**Why it matters:** The entire header (nav links, wordmark, language switcher, theme toggle) is one `"use client"` component rendered on every page via `layout.tsx:111`, even though ~90% of its markup (static nav links, wordmark) needs no interactivity — only the mobile-menu toggle and active-link state do.

**Estimated effort:** 3–4 hours.

**Risk if not fixed:** Low-to-medium ongoing cost — extra hydration JS shipped on every single page load site-wide, compounding as the site grows.

**Exact files to modify:**
- `src/components/site/Header.tsx`
- New: a small client-only wrapper component for the mobile-menu/toggle logic

**Step-by-step plan:**
1. Identify exactly which parts of `Header.tsx` need client-side interactivity (mobile-menu open/close state, `Escape`-key handling, active-link highlighting if it depends on `usePathname`).
2. Extract those into a small, focused `"use client"` component (e.g. `HeaderMobileMenu.tsx`).
3. Convert the remainder of `Header.tsx` (nav list, wordmark, layout markup) to a Server Component that renders the static parts and composes in the client sub-component where needed.
4. Verify the language switcher and theme toggle (if they also need client-side state) are similarly isolated rather than forcing the whole header client-side.
5. Run `npm run build`, inspect the client bundle size for a representative page before/after (e.g. via `next build`'s output stats) to confirm a measurable reduction.
6. Manually test mobile menu open/close, keyboard `Escape` handling, and active-link highlighting across all locales.

---

### 19. Lazy-load locale dictionaries

**Why it matters:** All 3 locale dictionaries (`de.json`, `en.json`, `fa.json`, ~8 KB each) are statically imported in `src/i18n/dictionaries.ts:2-4,12` and held in memory, even though `getDictionary(locale)` only ever needs one per request. Not urgent at current size, but worth fixing before dictionaries grow substantially.

**Estimated effort:** 1–2 hours.

**Risk if not fixed:** Negligible today; becomes a real (if still modest) memory/bundle concern only if dictionaries grow significantly.

**Exact files to modify:**
- `src/i18n/dictionaries.ts`

**Step-by-step plan:**
1. Replace the static `import` statements for each locale's JSON with dynamic `await import(...)` calls inside `getDictionary(locale)`, keyed by the requested locale.
2. Confirm this works correctly with Next.js's bundling (dynamic JSON imports are supported, but verify the build output actually code-splits per locale rather than still bundling all three).
3. Run `npm run build` and check the build output/bundle analysis to confirm the expected reduction.
4. Manually verify all three locales still render correctly.

---

### 20. Add `generateStaticParams` to `opengraph-image.tsx`

**Why it matters:** Every other locale-scoped route (`layout.tsx`, `page.tsx`, `rss.xml/route.ts`, `search-index.json/route.ts`) explicitly enumerates `locales` via `generateStaticParams()` for prebuilding. `opengraph-image.tsx` is the one exception, meaning it's treated as on-demand dynamic for the `[locale]` segment rather than prebuilt like everything else — not a bug, but an inconsistency with the codebase's own established convention.

**Estimated effort:** 15–30 minutes.

**Risk if not fixed:** Negligible functionally; purely a consistency/maintainability gap.

**Exact files to modify:**
- `src/app/[locale]/opengraph-image.tsx`

**Step-by-step plan:**
1. Add `export function generateStaticParams() { return locales.map(locale => ({ locale })); }` matching the pattern used in sibling files.
2. Run `npm run build` and confirm the OG image route now appears as statically generated per locale in the build output.
3. Spot-check the generated OG image for each locale.

---

### 21. Track/upgrade transitive `postcss` advisory

**Why it matters:** `npm audit` flags a moderate-severity advisory (GHSA-qx2v-qp2m-jg93, CVSS 6.1 — XSS via unescaped `</style>` in CSS stringify output) in `postcss`, bundled as a transitive dependency inside `next`. No fix is currently available without a major Next.js version bump.

**Estimated effort:** Ongoing tracking, ~30 minutes now to document + set up monitoring; actual fix effort depends on the eventual Next.js major-version upgrade this is bundled with.

**Risk if not fixed:** Low near-term (moderate severity, no direct exploit path identified in this codebase's usage), but should not be forgotten indefinitely.

**Exact files to modify:**
- None immediately; documentation/process only (e.g. a tracked issue, or a note in `README.md`/`SECURITY.md`).
- `.github/workflows/ci.yml` (optional: add `npm audit --audit-level=high` as a CI gate so this doesn't silently worsen)

**Step-by-step plan:**
1. Open a tracked issue (GitHub issue or internal tracker) noting the advisory ID, affected package, and that the fix requires a future Next.js major-version upgrade.
2. Add `npm audit --audit-level=high` as a CI step in `.github/workflows/ci.yml` so any *new* high/critical advisory fails the build, while this known moderate one doesn't block work today.
3. Revisit when planning the next Next.js major-version upgrade.

---

## Suggested execution order

1. **Week 1:** P0 items 1–4 (all quick, high-risk-reduction fixes).
2. **Week 2:** P1 items 5–7 (performance + header hardening), start item 8 (tests) in parallel.
3. **Week 3:** Finish item 8; begin P2 items 9–15 as capacity allows — item 9 (static/ISR conversion) is the largest and can be scheduled independently of the others.
4. **Ongoing/backlog:** P3 items 16–21 — low risk, pick up opportunistically or during unrelated touches to the same files.
