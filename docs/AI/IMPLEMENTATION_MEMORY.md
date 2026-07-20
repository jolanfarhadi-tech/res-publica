# Implementation Memory — Cross-Cutting Summary

*How the code is currently shaped. Complements `ARCHITECTURE_MEMORY.md` (why); see `MODULES/*.md` for per-module detail. Source paths only — no large code blocks reproduced here.*

---

## Runtime stack

Next.js 15.3 (App Router), React 19, TypeScript 5.6, Tailwind CSS v4, Framer Motion, `next-mdx-remote` v6 + `gray-matter` (MDX content), Drizzle ORM 0.45 + `pg` (Postgres, production) + `@electric-sql/pglite` (offline-first local dev), `openid-client` v6 (OIDC), `zod` (validation), `vitest` (test runner).
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

`src/app/api/`, one directory per capability area: `auth/{callback,login,logout,session}`, `events/{capacity,registration}`, `governance/{cases,documentation-quality,evidence,evidence-quality,grants,hearing-quality,hearings,repair-plans,scientific-reviews,validation}`, `health/{live,ready}`, `membership/{create,profile}`, `newsletter`, `platform/modules`, `publishing/{grants,workflow}` (the last **uncommitted** — see `CURRENT_STATE.md`).
Evidence: directory listing this session (`find src/app/api -type f`, prior turn).

## Application layer

`src/application/` — one file per cross-module workflow: `events.ts`, `governance-authority.ts`, `harm-governance.ts` + `harm-governance-review.ts`, `member-profile.ts`, `membership.ts`, `publishing.ts` + `publishing-authority.ts` (**uncommitted**). Shared cross-module test: `flows.integration.test.ts`. Each has an adjacent `*.integration.test.ts` except where noted.
Evidence: `find src/application -type f`, this session.

## Domain modules

`src/modules/{ai-layer,analytics,community,crm,dashboard,events,harm-governance,knowledge-graph,membership,publishing}/`, each with its own `manifest.ts` (Plugin Architecture, ADR-003), most with a `README.md` and a `*.test.ts`. Full file-by-file inventory captured this session via `find src/modules -type f` — see `MODULES/*.md` for the 11 modules this restructuring pass covers in detail. **Not covered by a `MODULES/*.md` file in this pass, despite having real implementation + tests:** `community`, `crm`, `dashboard`, `analytics` (see `INDEX.md` §"Module coverage").
Shared registration: `src/modules/manifest.ts` (the `ModuleManifest` type), `src/modules/registry.ts` (+`registry.test.ts`), `src/modules/bootstrap.ts` (+`bootstrap.test.ts`).

## Persistence and Drizzle

Two schema files: `src/persistence/schema.ts` (core domain entities — `people`, `consentRecords`, `payments`, `organizations`, `notifications`, `auditLog`, `authIdentities`, `authSessions`, `authFlows`, `authorizationGrants` — 10 tables, directly grepped) and `src/persistence/module-schema.ts` (per-module tables — ~40 tables spanning membership, events, publishing, community, knowledge-graph, ai-layer, harm-governance, dashboard, crm, analytics, directly grepped this session). Supporting files: `database.ts`, `index.ts`, `repositories.ts`, `runtime.ts`, and tests `persistence.integration.test.ts`, `schema.test.ts`.
Migrations: `drizzle/0000_m1-canonical-domain.sql` through `drizzle/0011_publishing-authority.sql` (12 total; the last is **uncommitted** — untracked file + unstaged `_journal.json`/`module-schema.ts` changes, see `CURRENT_STATE.md`).
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

## CI and repository checks

`.github/workflows/ci.yml` (read in full): on push/PR to `main` — checkout → Node 20 setup → `npm ci` → `node scripts/check-structure.mjs` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run db:check` → `npm run db:check:fresh` → `npm run build`. Runs against a placeholder `NEXT_PUBLIC_SITE_URL`. **This compilation did not run any of these steps** — it reports the pipeline's existence and configuration, not a passing/failing result for the current working tree.

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
