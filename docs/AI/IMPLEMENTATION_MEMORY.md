# Implementation Memory — Cross-Cutting Summary

## Incremental implementation — browser security policy

`next.config.ts` applies defense-in-depth headers to every route. The CSP is a
compatible structural policy, not a claim of nonce-based strict CSP: it blocks
plugins/objects, hostile base URLs, cross-origin framing, and cross-origin form
submission without disabling Next.js bootstrap scripts. HSTS is host-scoped
for one year; `preload` and `includeSubDomains` remain intentionally absent
until their operational consequences are explicitly approved.

## Incremental implementation — shared request context

`src/platform/request-context.ts` owns server-generated correlation IDs and the
minimal uncaught-route failure boundary. Auth login, callback, session, and
logout compose through it without moving OIDC, session, actor, or authorization
logic out of their existing owners. Callers cannot choose the logged request
ID, and logging intentionally excludes URL query strings and exception detail.

## Incremental implementation — public module-registry restriction

On branch `codex/platform-phase-1`, the internal ADR-003 manifest registry is
still bootstrapped through `src/modules/bootstrap.ts`. The anonymous
`GET /api/platform/modules` route no longer serializes that internal metadata.
It fails closed with `404`, `{error:"not_found"}`, and
`Cache-Control: private, no-store, max-age=0`. This preserves internal module
composition while avoiding publication of declarative, unavailable routes and
database ownership details.

*How the code is currently shaped. Complements `ARCHITECTURE_MEMORY.md` (why); see `MODULES/*.md` for per-module detail. Source paths only — no large code blocks reproduced here.*

---

## Runtime stack

Next.js 15.5.22 (App Router), React 19, TypeScript 5.6, Tailwind CSS v4, Framer Motion, `next-mdx-remote` v6 + `gray-matter` (MDX content), Drizzle ORM 0.45 + `pg` (Postgres, production) + `@electric-sql/pglite` (offline-first local dev), `openid-client` v6 (OIDC), `zod` (validation), `vitest` (test runner).
Evidence: `package.json` (read in full this session).

## Next.js structure

Single App Router tree at `src/app/[locale]/` — enforced by `scripts/check-structure.mjs`, which runs as `predev`/`prebuild` and fails the build on a duplicate root `app/`/`content/` folder ("causes silent 404s/empty pages" per `README.md`).
Route segments confirmed present: `about`, `contact`, `datenschutz`, `events`(+`[slug]`), `impressum`, `membership`, `mission`, `mission-vision`, `news`(+`[slug]`), `partners`, `profile`, `projects`(+`[slug]`), `publications`(+`[slug]`), `research`(+`[slug]`), `rss.xml`, `search`, `search-index.json`, `team`, `[...rest]` catch-all.
Evidence: directory listing of `src/app/[locale]/`, this session and the prior compilation.

## TypeScript conventions (observed, not exhaustively audited)

- `zod` discriminated unions for API action payloads — e.g. `src/app/api/publishing/workflow/route.ts` (read in full).
- Domain/application error classes with a `code` string property, mapped to HTTP status by suffix convention (`_not_found` → 404, else 409/403) — observed in `src/application/publishing.ts` (`PublishingError`), `src/modules/publishing/authority.ts` (`EditorialAuthorityError`), `src/application/publishing-authority.ts` (`EditorialGrantError`).
- Transactional writes: every mutating application-layer function wraps its DB writes + audit-log insert in a single `db.transaction()` — observed directly in `src/application/publishing.ts` and `src/application/publishing-authority.ts`.
- This is an **observed pattern from the modules read in full this session** (publishing, auth), not confirmed as a repository-wide lint-enforced rule — no ESLint custom rule for it was found in `eslint.config.mjs` (not read in full this session).

## API route organization

`src/app/api/`, one directory per capability area: `auth/{callback,login,logout,session}`, `events/{capacity,registration}`, `governance/{cases,documentation-quality,evidence,evidence-quality,grants,hearing-quality,hearings,repair-plans,scientific-reviews,validation}`, `health/{live,ready}`, `membership/{create,profile}`, `newsletter`, `platform/modules`, `publishing/{grants,workflow}`. Publishing is committed at `09c160b`.
Evidence: directory listing this session (`find src/app/api -type f`, prior turn).

## Application layer

`src/application/` — one file per cross-module workflow: `events.ts`, `governance-authority.ts`, `harm-governance.ts` + `harm-governance-review.ts`, `member-profile.ts`, `membership.ts`, `publishing.ts` + `publishing-authority.ts` (committed at `09c160b`). Shared cross-module test: `flows.integration.test.ts`. Each has an adjacent `*.integration.test.ts` except where noted.
Evidence: `find src/application -type f`, this session.

## Domain modules

`src/modules/{ai-layer,analytics,community,crm,dashboard,events,harm-governance,knowledge-graph,membership,publishing}/`, each with its own `manifest.ts` (Plugin Architecture, ADR-003), most with a `README.md` and a `*.test.ts`. Full file-by-file inventory captured this session via `find src/modules -type f` — see `MODULES/*.md` for the 11 modules this restructuring pass covers in detail. **Not covered by a `MODULES/*.md` file in this pass, despite having real implementation + tests:** `community`, `crm`, `dashboard`, `analytics` (see `INDEX.md` §"Module coverage").
Shared registration: `src/modules/manifest.ts` (the `ModuleManifest` type), `src/modules/registry.ts` (+`registry.test.ts`), `src/modules/bootstrap.ts` (+`bootstrap.test.ts`).

## Persistence and Drizzle

Two schema files: `src/persistence/schema.ts` (core domain entities — `people`, `consentRecords`, `payments`, `organizations`, `notifications`, `auditLog`, `authIdentities`, `authSessions`, `authFlows`, `authorizationGrants` — 10 tables, directly grepped) and `src/persistence/module-schema.ts` (per-module tables — ~40 tables spanning membership, events, publishing, community, knowledge-graph, ai-layer, harm-governance, dashboard, crm, analytics, directly grepped this session). Supporting files: `database.ts`, `index.ts`, `repositories.ts`, `runtime.ts`, and tests `persistence.integration.test.ts`, `schema.test.ts`.
Migrations: `drizzle/0000_m1-canonical-domain.sql` through
`drizzle/0018_holder-controlled-wallet-recovery.sql` (19 total, all committed
and applied in Production, creating 66 public tables). The separate
`drizzle-research/0000_anonymous-research-verifier.sql` remains inactive while
the real-data gate is closed.
Scripts: `db:generate`/`db:migrate`/`db:check`/`db:check:fresh` (`package.json`), `scripts/check-fresh-migrations.mjs`.

## Authentication / session implementation

`src/auth/` — `oidc.ts` (OpenID Connect via `openid-client`), `actor-resolver.ts` + `runtime.ts` + `store.ts` (session/actor resolution producing `AuthenticatedActor`), `authorize.ts` (capability-based authorization core, see `ARCHITECTURE_MEMORY.md`), `request-security.ts` (CSRF/untrusted-write request rejection — used by every publishing API route, directly read this session), `crypto.ts`, `types.ts`. Tests: `authorize.test.ts`, `config.test.ts`; API-level test `src/app/api/auth/routes.test.ts`.

## Authorization enforcement

Capability-tuple model `{domain, capability, target, minimumAssurance}`, enforced via `requireAuthorization`/`requireEditorialRole`-style wrapper functions at the top of every application-layer mutating function — directly verified in `src/application/publishing.ts` (every exported function calls `requireEditorialRole(actor, <role>, <scope>)` before touching the database). Same pattern in `src/modules/harm-governance/authority.ts`. See `ARCHITECTURE_MEMORY.md` §"Identity, authentication, and authorization".

## Audit logging

Every mutating publishing-workflow function writes an `auditLog` row inside the same transaction as its state change, via a small local `audit()` helper in `src/application/publishing.ts` (read in full). Confirmed for publishing; asserted (not independently re-verified line-by-line this session) for membership (`src/modules/membership/lifecycle.ts`, per that module's own README) and events (`src/modules/events/registration.ts`, `outcomes.ts`, per that module's own README).

## Localization

`src/i18n/config.ts` (locale list/default), `dictionaries.ts` + `dictionaries/{de,en,fa}.json` (README: "all three must keep the same key structure (TypeScript enforces it)"), `member-profile.ts` (profile-specific dictionary helper). Locale middleware at repo-root `middleware.ts` (read in full) — redirects to `Accept-Language`-preferred locale (German fallback), sets `x-locale` header, and contains a documented non-obvious matcher-regex bug-fix (`[.]` character class, not `\.` — see `MODULES/frontend-i18n.md`). Persian is fully RTL, uses the Solar Hijri calendar (`README.md`, not independently re-verified in code this session).

## Frontend component organization

`src/components/{motion,platform,seo,site,ui}/` — top-level folder names confirmed; not individually enumerated file-by-file this session, except `src/components/platform/{ActionStatus.test.ts, MemberProfileDashboard.test.ts}` (confirmed to exist via the repository-wide test-file listing run this session).

### Public narrative implementation (2026-07-24 incremental update)

The public site now implements a non-ADR WHY / HOW / WHAT / JOIN experience.
`src/i18n/public-site.ts` owns the trilingual editorial synthesis;
`src/data/public-offerings.ts` owns the public-only maturity inventory; and
`src/data/public-navigation.ts` owns the seven-item primary navigation.
Localized `/method` and `/offerings` routes are static server components.
The homepage carries the full human and institutional paths plus trust,
fellowship, audience, and participation sections.

`src/lib/collections.ts` now makes public collection content opt-in:
`visibility: public`, `reviewed: true`, and a non-empty `source` are all
required. The same loader feeds indexes, details, search, RSS, static params,
and sitemap generation, so legacy/demo MDX is hidden consistently.
`src/lib/search.ts` indexes the published static pages plus any entries passing
that gate. Contact renders an explicit unavailable state instead of simulated
delivery; newsletter signup renders only when a supported provider is
operationally configured.

The stable Membership, Member Profile, auth, persistence, and Publishing
Authority API contracts were not changed.

## CI and repository checks

`.github/workflows/ci.yml` (read in full): on push/PR to `main` — checkout → Node 20 setup → `npm ci` → `node scripts/check-structure.mjs` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run db:check` → `npm run db:check:fresh` → `npm run build`. The 2026-07-24 frontend release independently ran and passed the equivalent local checks, using `NEXT_PUBLIC_SITE_URL=https://respublica-ev.de` for the release build. The feature branch push does not trigger this main-only workflow.

## Scripts and operational tooling

- `scripts/check-structure.mjs` — structure guard (single App Router / content tree).
- `scripts/check-fresh-migrations.mjs` — migration freshness check (`db:check:fresh`).
- `scripts/cli.mjs` — referenced by ADR-005 (single `respublica` CLI); existence confirmed, contents not read this session.
- `scripts/eao/*` — nine EAO pipelines, see `ARCHITECTURE_MEMORY.md` §EAO and `MODULES/eao.md`.

## Known gaps in this summary

- ESLint rule configuration (`eslint.config.mjs`) not read in full this session — conventions above are observed from sampled files, not confirmed as lint-enforced repository-wide.
- No line-by-line audit of every module's application code was performed; depth of verification varies per module — see individual `MODULES/*.md` files for what was and wasn't directly read.

---

*This file summarizes; it does not replace reading the actual source. Cross-reference `MODULES/*.md` for module-specific detail.*
