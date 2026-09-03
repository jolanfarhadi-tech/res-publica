# Module: Frontend & Localization (i18n)

## Incremental visual homepage and three-dimensional forum — 2026-09-03

The localized homepage is now a visual institutional landing page rather than
a long sequence of text panels. A generated, optimized 3D civic-environment
asset expresses the official mark through upright nested U channels instead of
generic semicircular parliamentary seating. Its v5 visual treatment turns the
surround into a restrained glass civic laboratory with credible-scale,
synthetic adults engaged in listening, document review and collaborative
research. A narrow wooden civic lectern sits on the longitudinal centre axis;
the image does not claim a real facility, event or participant. A separate transparent amber
polyhedron with more than twenty unequal facets provides material depth and
restrained motion, becoming static for reduced-motion users. Localized copy, the
owner-confirmed static metrics, team names and route labels remain semantic
HTML. The glass-lab visualization also continues as a subdued fixed field
behind every locale route; translucent page headers and the homepage copy plane
make the experience spatially continuous, while high-contrast and
reduced-transparency modes reduce or remove that decorative field. Six route
cards expose Lab, Projects, Programmes, Events, Knowledge and
Communities. The paired human and institutional journeys and the separate
Civic/HARM/Governance platform map preserve the approved narrative and
architecture in compact form. The map now uses a localized cybernetic visual
grammar: two closed directional feedback loops, sensing junctions, bounded
signal channels and the six verified principles. Shared Platform Services
remain explicitly internal and every animation becomes static under reduced
motion.

The team uses coloured graphical portraits derived from the owner-supplied
Donya/Atie/Jolan identity references and the verified roles in
`src/data/team.ts`; the private source images, screenshot-only names and
biographies were not imported. Homepage publication and news panels use `getEntries`, so records
without `public`, `reviewed` and `source` remain invisible. DE/EN/FA copy is
complete. Focused tests pass (33/33); lint, typecheck, structure and the
173-route Production build pass. Built-app browser QA confirms Persian RTL,
loaded imagery and no horizontal overflow at 573px.

The visual refinement adds genuine perspective and depth planes to the forum,
snapshot, gateway and ecosystem compositions while preserving semantic HTML
and reduced-motion behavior. Versioned `*-v3.webp` team portraits provide
recognisable colour editorial treatments on one shared warm-grey field. The
ecosystem visualization uses the complete official lockup and four semantic
platform cards over custom route, orbit and junction graphics. Built-app QA
must confirm the new assets, Persian RTL, zero mobile overflow and an empty
browser error and warning log before release.

## Superseded baseline — official identity and ecosystem homepage, 2026-09-03

The public header/footer now use optimized web derivatives of the owner-supplied
official RGB logo. The Homepage retains the approved human/institutional story
and adds a visual civic-forum hero plus a localized ecosystem map that names
Civic Platform, HARM Platform, Governance Platform and internal Shared Platform
Services separately. No mockup metrics, partner counts, fictional products or
fictional people were copied. DE/EN/FA browser QA confirmed loaded logo assets,
correct Persian RTL, no 375px horizontal overflow and no console errors.
Focused public/i18n tests pass (37/37), along with lint, typecheck and the
Production build. Team cards use the three owner-supplied illustrative
portraits in the stated Donya/Atie/Jolan mapping; the images remain decorative
and are not described as documentary photographs or identity evidence.

## Incremental HARM Platform clarification — 2026-09-03

The localized Method page now presents the HARM Platform explicitly and
consistently in DE/EN/FA. It distinguishes the platform from both the HARM
Operating System methodology and the HARM Research Project, while keeping HARM
outside the product/service catalogue. The section uses semantic `section`,
`dl`, `dt` and `dd` structure, logical inline border/padding properties for RTL,
and no new interaction or protected API call. Focused public-boundary and i18n
tests pass (36/36).

## Incremental public-copy correction — 2026-09-03

The unused `platformFoundation` dictionary branch was removed together from
DE/EN/FA after a repository-wide consumer search confirmed no component reads
it. The branch retained an obsolete internal platform-inventory presentation,
including claims that are not part of the current source/provenance-controlled
public narrative. `src/i18n/dictionaries.test.ts` prevents reintroduction in
any locale. No route, rendered feature, locale direction, metadata, API, or
authorization boundary changed.

## Incremental bounded access management — 2026-09-02

The DE/EN/FA Operations Control Panel now renders access-management controls
only when the server projection reports an exact Institution Admin or Publisher
scope. It accepts an approved internal Person ID, an operational role, the
server-provided exact scope and optional expiry; 403 write failures offer a
fresh-MFA step-up. Active operational grants can be revoked from the same
bounded view. Institution Admin and Publisher are explicitly excluded from the
selectable roles and described as externally appointed authorities. Persian
copy and inherited RTL behavior are preserved.

## Incremental implementation — bounded Admin Control Panel, 2026-08-25

The localized Operations route now provides one responsive Control Panel for
all 25 implemented top-level website, legal and self-account routes. It groups
public review links separately from the six existing protected operational
areas and displays only aggregate counts from the established Operations
projection. Copy is complete in DE/EN/FA and Persian continues to inherit the
root RTL direction.

The panel grants no authority and creates no new API, persistence path or
content mutation. Membership, Publishing, Academy, Fellowship, Knowledge Graph
and Security workspaces remain server-selected through exact-target MFA grants
and independently reauthorize every protected action. Public links are review
links only; the no-auto-publish and activation-gate boundaries remain explicit.

## Incremental implementation — About, team and public Satzung, 2026-08-25

Primary navigation now uses the existing localized About route in place of
Mission & Vision. About composes the institutional narrative with a reusable
Team section. Three owner-approved identities are public; Jolan Farhadi Babadi
is shown as both Vorstand/Board and Geschäftsführer, while no unverified
person-to-office mapping for Vorsitz, Stellvertretung or Schatzmeister is
published. The collective responsibility description is source-bounded to the
Satzung.

The signed, name-bearing PDF has been removed from `public/documents`. Public
About and Membership links now resolve to the generated Word reading copy
`satzung-res-publica-ev.docx`, which contains no signature image or personal
name. Academy/Civic School is one available Programme backed by the implemented
Academy surface; Fellowship remains a separate Programme without weakening its
server-side activation gate.

## Incremental implementation — narrative and responsive coherence, 2026-08-24

The current unstaged slice restores the approved seven-item WHY / HOW / WHAT /
JOIN navigation and makes the homepage the complete public narrative rather
than a flat collection inventory. Human dignity and agency remain visible
beside institutional evidence, responsibility and repair; trust and civic
fellowship are explicit outcomes. Academy is presented as a Programme, and
Products/Services remain valid routes without becoming primary story pillars.

Desktop navigation, account controls and language selection now share one
90rem breakpoint; the native mobile dialog remains available below it and
contains the account and language controls. Heading levels on Academy,
Fellowship and collection indexes are ordered. Auth callback failures from a
browser use a localized noindex recovery page; JSON API behavior is preserved
for non-browser clients. Event pages restore the authenticated actor's active
registration after reload through an exactly scoped, non-mutating read.

Verification passes 4 focused files / 35 tests and the complete serial suite at
115 files / 486 tests. Structure, lint, typecheck, the 173-page Production
build and `git diff --check` pass. Rendered DE/EN/FA checks at 390, 1280 and
1440px confirm the responsive boundary, Persian RTL, zero horizontal overflow
and ordered landmarks/headings. Production smoke found that shared Button
links to `/api/auth/login` were incorrectly prefetched as RSC requests; API
destinations now use native document navigation while normal application links
continue to use `next/link`, preventing the Auth0 redirect console error.

## Incremental implementation — Knowledge Graph and search surfaces, 2026-08-10

The existing DE/EN/FA search index now includes explicit entity IDs and labels
from reviewed, source-grounded public MDX declarations. Search remains static,
fast and usable without a database or external provider; no semantic/AI claim
is introduced.

`/[locale]/operations/knowledge-graph` provides a private MFA-authorized build
ledger and human candidate-review interface. Copy is complete in DE/EN/FA,
Persian uses the existing RTL document boundary, and empty/denied/unavailable
states remain truthful. Rebuild and approval are presented as separate actions;
the UI never implies automatic graph publication.

## Incremental implementation — Fellowship surfaces, 2026-08-10

The localized App Router includes a source-grounded Fellowship information
page, a self-only status dashboard and an MFA-authorized Operations overview.
All copy exists in DE/EN/FA, uses the established Persian RTL boundary and
states that application is not approval, promotion or a trust score.

The existing Programmes matrix links to the information page while retaining
`documented` / non-operational status. Self-application controls and the API
remain server-gated by `FELLOWSHIP_APPLICATIONS_ENABLED`; no public candidate,
member or Fellow directory is introduced.

## Incremental implementation — Academy surfaces, 2026-08-10

The existing localized App Router now includes public Academy catalogue,
course, and programme routes plus private learner-dashboard and Operations
routes. All Academy interface copy is complete in DE/EN/FA and reuses the
existing locale validation and Persian RTL boundary. No offering, cohort,
instructor, accreditation, or completion claim is seeded: empty states remain
truthful until governed published records exist.

Learner mutation controls are server-gated by
`ACADEMY_ENROLLMENT_ENABLED`; hiding a control is not treated as authority.
Public completion verification discloses the course and completion state but
no learner identifier or contact data, and its copy explicitly disclaims
external or state accreditation.

## Incremental implementation — 2026-07-30

OPEN-019 and Phase 0 P3 milestone 20 now use an explicit owner-approved
fallback. DE and EN prebuild localized Open Graph cards. FA prebuilds a
language-neutral Res Publica identity card, so Persian text is never sent
through the current ImageResponse/Satori renderer. The localized Persian title
and description remain in HTML metadata, and the route keeps its locale URL.
Focused tests cover all locale presentations and image URLs; the verified
Production build emits 105 pages and statically generates all three OG routes.

Phase 0 P3 milestone 19 now loads dictionaries through locale-specific dynamic
imports. The German JSON is imported only as a TypeScript type reference, so
dictionary shape enforcement remains while runtime loading is deferred.
Metadata, pages, RSS, search-index generation, not-found, membership, and Open
Graph callers all await the same boundary. The verified Production bundle
emits separate DE, EN, and FA server chunks; rendered DE/EN/FA checks retain
localized headings and controls, Persian RTL, and zero console warnings/errors.

Phase 0 P3 milestone 18 now keeps `Header.tsx` server-rendered and confines
pathname-dependent active links and mobile-dialog behavior to
`HeaderNavLink.tsx` and `HeaderMobileMenu.tsx`. The modal retains route-change,
Escape, focus-return, body-scroll, and desktop-breakpoint closing behavior.
Production-mode browser verification at 390×844 covered the interaction
boundary in DE and FA, including focus return, scroll restoration, localized
labels, RTL, zero horizontal overflow, and zero console warnings/errors.

The earlier milestone 20 attempt established that Persian text cannot be
prebuilt safely with the bundled renderer. That evidence remains the reason
for the neutral FA card; no Persian metadata support was removed.

## Purpose

The single App Router tree (`src/app/[locale]/`) and the trilingual (German/English/Persian) localization system serving it, including locale-detection middleware. Evidence: `README.md` (read in full, prior session); `middleware.ts` (read in full, this session and prior).

## Incremental implementation — 2026-07-29

The Membership/profile-creation form now presents two separate localized
confirmations in DE/EN/FA, both default-off, with individual accessible errors
and a disabled final action until both are selected. The data-protection link
is outside the checkbox label and was verified to navigate correctly.

The current unstaged frontend worktree replaces the visual system with Civic
Observatory while preserving the single App Router and DE/EN/FA dictionaries.
It adds localized `lab` and `privacy` routes, a source-reviewed HARM project in
all locales, a local consent/preferences layer, localized privacy links in all
data-entry surfaces, and the same design language across collections, search,
public categories, forms, team/partner empty states, and private Member
Profile status views.

The homepage is a server-rendered institutional narrative with 106kB first-load
JavaScript. Framer Motion is scoped to the Lab route and observes both system
and local reduced-motion preferences. The mobile menu is a native modal dialog
with focus containment; the desktop menu trigger is hidden correctly. German
and Persian headings remain within a 375px viewport and Persian retains
`lang=fa`, `dir=rtl`, and zero horizontal overflow.

SEO metadata is forced into `<head>` for all clients through the documented
Next.js 15 `htmlLimitedBots` configuration. Organization, CollectionPage,
Article/Event, breadcrumb, canonical, hreflang, x-default, OpenGraph, and
Twitter metadata remain bounded to verified claims. The Lab is not declared as
a separate ResearchOrganization and no unsupported geographic service area is
declared.

Verification after the profile-consent addition: focused consent/frontend
tests 36/36; full suite 37 files / 191 tests. The final structure, lint,
typecheck, database checks, and 99-page production build passed.

Earlier redesign verification: focused frontend boundaries 20/20; full suite 36 files / 182
tests with a 60-second PGlite budget; structure, lint, typecheck, migration
checks, 99-page production build, 71 route smoke checks, and `git diff --check`
passed. Lighthouse desktop scored 100/100/100/100 and mobile
95/100/100/100; rendered production-mode browser checks had no console errors.

## Canonical authority

No dedicated ADR found specifically for frontend/i18n architecture this session (ADR-001's Tier 1 "Static Core" covers the general MDX-in-Git rendering approach this frontend implements, but no i18n-specific ADR was located). `README.md` is the closest canonical source for stack/feature claims; `docs/source/standards/{BRAND_GUIDE,WRITING_STYLE,TERMINOLOGY}.md` for content standards (not read in full this session).

## Current implementation

**Incremental frontend transformation, verified 2026-07-24:** the route tree now
also contains localized `method` and `offerings` segments. The homepage carries
the complete two-layer public narrative; `src/i18n/public-site.ts` provides
DE/EN/FA parity; `src/data/public-navigation.ts` provides a seven-item
WHY/HOW/WHAT/JOIN primary navigation; and
`docs/website/STORYTELLING_EXPERIENCE_ARCHITECTURE.md` records the non-ADR
experience architecture. Persian rendering was manually verified with
`lang=fa`, `dir=rtl`, and no horizontal overflow at a 390 px viewport.

Collection publication is now provenance-aware in `src/lib/collections.ts`.
Legacy/demo MDX is not public unless it explicitly records public visibility,
review, and source provenance. Search indexes published static pages plus only
collection entries that pass that gate. Team/partner placeholders are hidden,
contact cannot simulate success, and newsletter UI appears only with a
configured provider.

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

**Verified 2026-07-24:** focused frontend suite 12/12; full suite 168/168;
structure, lint, typecheck, migration checks, production build with the real
production URL, and `git diff --check` passed. The production-mode build
returned 200 for 53 core route checks and all 42 sitemap URLs. Lighthouse
accessibility scored the DE/EN/FA homepages at 96 and Method, Offerings, and
Membership at 100. Manual review covered desktop, mobile, RTL, heading
hierarchy, figcaption text equivalence, keyboard menu Escape/focus return,
empty states, metadata, and sitemap. The implementation is committed and
pushed at `afa2207`.

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
