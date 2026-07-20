# Module: Frontend & Localization (i18n)

## Purpose

The single App Router tree (`src/app/[locale]/`) and the trilingual (German/English/Persian) localization system serving it, including locale-detection middleware. Evidence: `README.md` (read in full, prior session); `middleware.ts` (read in full, this session and prior).

## Canonical authority

No dedicated ADR found specifically for frontend/i18n architecture this session (ADR-001's Tier 1 "Static Core" covers the general MDX-in-Git rendering approach this frontend implements, but no i18n-specific ADR was located). `README.md` is the closest canonical source for stack/feature claims; `docs/source/standards/{BRAND_GUIDE,WRITING_STYLE,TERMINOLOGY}.md` for content standards (not read in full this session).

## Current implementation

**Routing:** single tree `src/app/[locale]/`, enforced by `scripts/check-structure.mjs` (runs as `predev`/`prebuild`; README: fails the build on a duplicate root `app/`/`content/` folder — "causes silent 404s/empty pages"). Route segments confirmed present (directory listing, prior session): `about`, `contact`, `datenschutz`, `events`(+`[slug]`), `impressum`, `membership`, `mission`, `mission-vision`, `news`(+`[slug]`), `partners`, `profile`, `projects`(+`[slug]`), `publications`(+`[slug]`), `research`(+`[slug]`), `rss.xml`, `search`, `search-index.json`, `team`, `[...rest]` catch-all.

**Middleware** (`middleware.ts`, read in full this session): redirects locale-less paths to the `Accept-Language`-preferred locale (German fallback via `detectLocale()`); sets `x-locale` header on locale-prefixed paths for pages without route params (e.g., `not-found.tsx`). **Documented, non-obvious bug-fix, inline comment (read in full, verbatim):** *"NOTE: dot-exclusion uses a character class `[.]` rather than `\.`. A backslash-escaped dot is silently unescaped by this project's path-to-regexp-based matcher compiler, turning `\.` into a bare `.` wildcard and making the exclusion match nearly every path. `[.]` reaches the compiled regex as a literal dot without going through that backslash-consuming step. Verified directly against this build's own `tryToParsePath` compiler, not assumed."* Matcher: `["/((?!api|_next/static|_next/image|.*[.].*).*)"]`.

**i18n:** `src/i18n/{config.ts, dictionaries.ts, dictionaries/{de,en,fa}.json, member-profile.ts}` (directory listing confirmed prior session). README: "all three [locale dictionaries] must keep the same key structure (TypeScript enforces it)."

## Data and persistence

None directly — content is Git-committed MDX (`src/content/<locale>/{pages,news,projects,research,publications,events}/<slug>.mdx`), not database-backed. Frontmatter validated with `zod` at build time (README).

## Authorization and trust boundaries

Not applicable to routing/i18n itself — the middleware performs locale detection/redirection only, no auth check. (Auth is handled separately, see `MODULES/identity-auth.md`; the `profile` route it serves is protected at the API layer, not by this middleware.)

## Public interfaces

All public site routes under `src/app/[locale]/`; the middleware itself is not a route but intercepts all matching requests per its `config.matcher`.

## Verification

No dedicated middleware test file was directly found this session under a `middleware.test.ts` name search at repo root — **not confirmed either way**; this session's full-repo test listing (`find src -name "*.test.ts"`) covered `src/`, not the repo root where `middleware.ts` itself lives. **Correction/clarification needed:** a repo-root `middleware.test.ts` file was noted in the initial repository listing (prior session) — its content was not read this session, but its existence is likely; treat as UNVERIFIED pass/fail status regardless.

## Decisions and rejected approaches

The `[.]` vs `\.` matcher fix (above) is a directly-evidenced, non-obvious rejected-then-corrected implementation detail — corresponds to commit `972942b` ("Fix middleware matcher dot-escaping bug"). German-as-default-locale redirect corresponds to commit `cdd57e7` ("fix: redirect production root to German locale"). **Any future edit to the middleware matcher regex must preserve the `[.]` character-class form or silently reintroduce the original bug** — this is the single most load-bearing warning in this module file.

## Current status

**REMOTE_VERIFIED**, **IMPLEMENTED_NOT_REVERIFIED**. Persian RTL and Solar Hijri calendar claims are from `README.md`, **not independently re-verified in code this session**.

## Open work

None specifically evidenced as unfinished for this module this session, beyond the general "tests not run" caveat.

## Do not redo

Do not change the middleware matcher's dot-exclusion back to `\.` — this is a previously-fixed, explicitly-documented bug (see Decisions above). Do not re-implement locale-fallback logic (German defines existing entries; missing en/fa fall back to German automatically) — already implemented per `README.md`'s content-model description.

## Evidence index

- `README.md` §"Quick start", §"Features", §"Content model", §"Project structure rules" (full read, prior session)
- `middleware.ts` (full read, this session)
- `src/i18n/{config.ts, dictionaries.ts, dictionaries/{de,en,fa}.json, member-profile.ts}`
- `scripts/check-structure.mjs` (existence confirmed; purpose per README, not read in full)
- commits `972942b`, `cdd57e7`
