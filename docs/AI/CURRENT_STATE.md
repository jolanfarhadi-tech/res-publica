# Current State — Live Repository Snapshot

## Incremental update — Phase 0 P3 Header hydration boundary

**Verified 2026-07-30 on `codex/platform-phase-3` after `1e750e3`.**
The site-wide Header is now a Server Component. Active-link calculation is
isolated in `HeaderNavLink`, while modal state, focus return, Escape handling,
body scroll locking, desktop-breakpoint closing, and route-change closing are
isolated in `HeaderMobileMenu`. Existing Account, preferences, language, theme,
search, and navigation behavior remains composed through the same components
and dictionaries.

Focused verification passes 21/21 frontend-boundary tests; the full serial
suite passes 52 files / 248 tests. Structure, lint, typecheck, `db:check`,
`db:check:fresh` (14 migrations / 55 tables), `git diff --check`, and the
102-page Production build pass. A 390×844 Production-mode browser check
verified menu open/close, scroll lock, Escape focus return, route-change
closing, localized labels, FA `lang=fa`/`dir=rtl`, no horizontal overflow, and
no console warnings or errors.

P3 milestone 20 was also tested against the real Production build: enumerating
the localized Open Graph image succeeds for DE/EN but fails while prerendering
FA because this Next 15 ImageResponse/Satori version rejects the Persian font's
OpenType substitution. The attempted source change was removed. Do not replace
the Persian card with English or remove its text without an explicit content
decision; see OPEN-019.

## Incremental update — Phase 0 P3 dependency and lint hardening

**Verified 2026-07-29 on `codex/platform-phase-3` after `c844258`.**
The Production dependency tree now uses the audited Next.js 15 security floor
(`15.5.22`) and pins patched PostCSS (`8.5.25`) and Sharp (`0.35.3`)
transitives. `npm run audit:production` reports zero vulnerabilities and is
enforced immediately after `npm ci` in the existing main/PR workflow. A
regression test protects the framework floor, matching Next ESLint release
line, patched transitive floors, and the CI Production audit command.

Linting now runs the supported ESLint CLI and excludes generated output and
the five unrelated historical `.claude/worktrees`. The accepted ADR-012
middleware boundary is unchanged; a proposed Next 16 `proxy.ts` migration was
rejected during the slice because the repository structure guard and ADR
explicitly reserve that filename as a removed P0 defect.

Focused verification passes 3 files / 8 tests; the full serial suite passes
52 files / 248 tests. Structure, lint, typecheck, `db:check`,
`db:check:fresh` (14 migrations / 55 tables), `git diff --check`, and the
102-page Production build pass.

## Incremental update — Phase 3 server-surface audit

**Verified 2026-07-29 on `codex/platform-phase-3` after `363ce6e`.**
The complete `src/app/api` inventory contains no routes for external AI,
Knowledge Graph, Community, CRM, Analytics, media/uploads, programme
applications, or impact operations. Their module manifests remain internal
architecture metadata and do not make those capabilities operational. The AI
Layer has only its deterministic local provider and no external fetch path.

The only sensitive Phase 3 HTTP surface is Governance/HARM, whose writes are
now server-disabled by default. Newsletter collection is independently hidden
and server-disabled. No upload parser, object-store client, analytics ingestion
path, unrestricted export, automated decision, public profile/directory, or
auto-publication worker exists.

Further Phase 3 activation is not safe engineering work without the specific
provider, legal, safeguarding, retention, authority, and owner approvals in
`SECURITY_LEGAL_GATE_REGISTER.md`. No placeholder implementation was added to
simulate those approvals.

## Incremental update — explicit newsletter activation and consent gate

**Verified 2026-07-29 on `codex/platform-phase-2` after `4bcf857`.**
The newsletter form and API now remain unavailable unless the server-only
`NEWSLETTER_ENABLED` value is exactly `true`; provider variables alone cannot
activate collection. An activated request still requires trusted origin,
configured PostgreSQL request protection, a five-per-hour pseudonymized
distributed rate-limit bucket, valid email syntax, and an explicit localized
`newsletter-v1` consent bundle before an address reaches a provider.

The in-memory raw-address counter was removed. The footer hides the form while
the activation gate is closed. Provider secrets, addresses, request payloads,
and consent text are not written to application logs or the rate-limit table.
No provider, environment variable, or external service was activated.

Focused verification passes 3 files / 30 tests; the full suite passes 51 files
/ 244 tests. Structure, lint, typecheck, `git diff --check`, `db:check`,
`db:check:fresh` (14 migrations / 55 tables), and the 102-page Production
build pass. No migration was created.

## Incremental update — server-disabled HARM operations

**Verified 2026-07-29 on `codex/platform-phase-2` after `1dc55e9`.**
All twelve Governance/HARM write methods are now independently disabled unless
the server-only `HARM_OPERATIONS_ENABLED` variable is exactly `true`. The
default correlated `503 feature_not_activated` response is private/no-store
and occurs after trusted-origin rejection but before database runtime,
rate-limit storage, actor resolution, capability/MFA evaluation, persistence,
or audit mutation.

The gate is keyed only to the existing `governance.privileged-write` policy, so
Publishing operations are unaffected. When explicitly activated, all existing
institution-scoped capabilities, MFA, separation of duties, provenance,
transactions, and canonical audit semantics remain unchanged.

Focused verification passes 4 files / 11 tests; the full suite passes 50 files
/ 240 tests. Structure, lint, typecheck, `git diff --check`, `db:check`,
`db:check:fresh` (14 migrations / 55 tables), and the 102-page Production
build pass. No migration was created and no environment was changed.

## Incremental update — bounded Publishing workspace

**Verified 2026-07-29 on `codex/platform-phase-2` after `12e5b2c`.**
`GET /api/publishing/workspace` now provides a private, read-only operational
projection for one exact publication scope. The actor comes only from the
verified session; every role requires staff MFA and an active exact-target
Civic editorial grant. Editor and Publisher roles can inspect the bounded
scope, while Reviewer and Translator roles receive only artifacts assigned to
their own Person.

The endpoint is dynamic, private/no-store, correlated, limited to at most 100
rows per collection, and returns generic authorization failures. It exposes no
universal admin bypass, cross-scope records, identity contact details, or raw
authorization grants. Existing Publishing writes, separation of duties,
provenance, atomic audit semantics, `commitHash: null`, and the no-auto-publish
boundary are unchanged.

Focused verification passes 2 files / 7 tests; the full suite passes 50 files /
238 tests. Structure, lint, typecheck, `git diff --check`, `db:check`,
`db:check:fresh` (14 migrations / 55 tables), and the 102-page Production
build pass. No migration was created.

## Incremental update — disabled-by-default notification delivery

**Verified 2026-07-29 on `codex/platform-phase-2` after `0b97138`.**
The canonical Notification entity now has an internal delivery service with a
provider interface, a non-delivering default adapter, bounded retries,
deterministic idempotency keys, and durable attempt evidence. Event email
templates require an active `event-pii` ConsentRecord before the recipient
address is passed to an enabled provider. Recipient addresses are not written
to delivery-attempt records, logs, or error codes.

Migration `0013_notification-delivery-attempts.sql` adds one append-oriented
attempt table with per-notification attempt uniqueness, provider idempotency
uniqueness, a restrictive Notification foreign key, and conditional runtime
permissions. No provider, background worker, public route, or real delivery is
activated.

Focused verification passes 1 file / 5 tests; the full suite passes 48 files /
231 tests. Structure, lint, typecheck, `git diff --check`, `db:check`,
`db:check:fresh` (14 migrations / 55 tables), and the 102-page Production
build pass.

## Incremental update — protected member Dashboard

**Verified 2026-07-29 on `codex/platform-phase-2` after `6f49ce8`.**
The new localized `/de|en|fa/dashboard` experience composes a private,
self-only account projection from the authenticated session actor. It includes
account assurance, the existing read-only Member Profile projection, the
actor's own versioned consent receipts, event registrations, notifications,
and capability-derived links. It never accepts a person identifier and does
not load another person's records or internal Governance review data.

`GET /api/dashboard` is dynamic, private, non-cacheable, correlated with a
server-generated request ID, and fails closed with `401` or `503`. The
Dashboard does not replace `src/modules/dashboard`, alter the Member Profile
contract, expose raw authorization grants, or introduce consent mutation while
ADR-035 remains absent. No migration was created.

Focused verification passes 3 files / 7 tests; the full suite passes 47 files /
226 tests. Structure, lint, typecheck, `git diff --check`, `db:check`,
`db:check:fresh` (13 migrations / 54 tables), and the 102-page Production
build pass. Production-mode browser checks confirm correct DE/EN/FA metadata,
Persian RTL, no horizontal overflow, noindex/nofollow, and truthful unavailable
states without a configured local protected runtime.

## Incremental update — privileged write request protection

**Verified 2026-07-29 on `codex/platform-phase-1` after `a4f7dc3`.**
All 15 privileged Governance and Publishing write methods now pass through one
shared route boundary before body parsing, actor resolution, authorization, or
persistence. Twelve Governance methods share the
`governance.privileged-write` scope and three Publishing methods share
`publishing.privileged-write`; each permits 60 requests per fifteen-minute
window per scope-separated HMAC client key.

The boundary preserves trusted-origin rejection, fails closed without the
runtime or `SESSION_SECRET`, returns shared non-cacheable `429` metadata with a
server-generated `X-Request-ID`, and invokes the unchanged application service
only after protection passes. Capability tuples, MFA/assurance checks, exact
target scopes, separation of duties, provenance, atomic persistence, canonical
audit semantics, human sign-off, and the no-auto-publish boundary remain in
their existing application/domain owners.

Focused verification passes 11 files / 44 tests; the full suite passes 44
files / 219 tests. Structure, lint, typecheck, `git diff --check`,
`db:check`, `db:check:fresh` (13 migrations / 54 tables), and the 99-page
Production build pass. No migration was created.

## Incremental update — operational resilience and privacy drafts

**Implemented 2026-07-29 on `codex/platform-phase-1` after `3019603`.**
A scheduled GitHub monitor and reusable script now validate the HTTPS
liveness/readiness status, minimal JSON body, and `no-store` contract every
fifteen minutes without logging response payloads or secrets. Technical
runbooks cover incident response, isolated Neon restore drills, Auth0
invitation/provisioning with separation of duties, and safe owner-led Vercel
project consolidation.

Internal legal-review drafts now provide an implementation-backed privacy
notice replacement, processing inventory, retention decision matrix, DPIA
technical appendix, and service-rules needs assessment. They are explicitly
not approved for publication. The live `datenschutz.md` remains unchanged
pending human/legal approval because it currently understates authenticated
profile, consent, event, identity, audit, and processor activity.

Focused monitor tests pass 3/3; the full suite passes 42 files / 211 tests.
Structure, lint, typecheck, `git diff --check`, `db:check`,
`db:check:fresh` (13 migrations / 54 tables), and the 99-page Production
build pass. A read-only check of `https://respublica-ev.de` also confirmed
`/api/health/live` and `/api/health/ready` at `200`; this does not deploy the
branch or close any legal, Auth0, restore, ownership, or retention gate.

## Incremental update — authenticated event cancellation

**Verified 2026-07-29 on `codex/platform-phase-1` after `837a8dc`.**
The event-registration lifecycle now exposes authenticated owner cancellation
through `DELETE /api/events/registration`. Cancellation reuses the existing
event-targeted `events.register` capability and never accepts a caller-supplied
person identifier. One locked transaction changes the actor's active
registration to `cancelled`, removes its waitlist row, promotes the earliest
still-valid waitlisted registration when a confirmed seat opens, persists the
pending promotion notification, and appends the canonical
`events.registration.cancelled` audit record.

The existing public event interaction now presents DE/EN/FA registration,
waitlist, cancellation-in-progress, cancellation-complete, login, duplicate,
unavailable, and error states. The cancel control appears only after the
current browser session completes a registration or waitlist action; persisted
self-facing event history belongs in the protected Dashboard slice.

No schema change was required: the existing registration status, waitlist,
Notification, and AuditLog persistence remain authoritative. Focused
domain/application/route tests pass 15/15 and focused frontend/route tests
pass 6/6; the full suite passes 41 files / 208 tests. Structure, lint,
typecheck, `db:check`, `db:check:fresh` (13
migrations / 54 tables), `git diff --check`, and the 99-page Production build
also pass.

## Incremental update — public authenticated write protection

**Verified 2026-07-29 on `codex/platform-phase-1` after `8a3046a`.**
Membership creation and event registration now use the shared PostgreSQL
rate-limit service and shared request context before actor resolution or
business persistence. Policies are five membership-create attempts per hour
and twenty event-registration attempts per fifteen minutes per pseudonymized
client address. Session-derived actors, capability authorization, atomic
profile consent, event capacity, duplicate detection, waitlist behavior, and
canonical audit writes remain in their existing application services.

Focused tests pass 16/16; full suite 41 files / 202 tests; structure, lint,
typecheck, `db:check`, `db:check:fresh` (13 migrations / 54 tables), and the
99-page Production build pass. No additional migration was created.

## Incremental update — PostgreSQL-backed authentication rate limiting

**Verified 2026-07-29 on `codex/platform-phase-1` after `bad0283`.**
Authentication initiation now consumes an atomic shared PostgreSQL rate-limit
bucket before creating an OIDC flow. The identifier comes from Vercel's
forwarded client address and is stored only as a scope-separated HMAC using
`SESSION_SECRET`; raw addresses, return targets, and query strings are not
persisted. Missing protection configuration fails closed. Limit responses are
private/non-cacheable and include retry metadata.

Migration `0012_platform-rate-limits.sql` adds only
`rate_limit_buckets`, its expiry index, and a conditional DML grant for the
verified `res_publica_runtime` role. Focused tests pass 9/9, including concurrent
increments, window reset, redaction, retry behavior, and fail-closed
configuration. Full suite: 40 files / 199 tests. Structure, lint, typecheck,
`db:check`, `db:check:fresh` (13 migrations / 54 tables), and the 99-page
Production build pass. The migration has not been run against Production.

## Incremental update — security response headers

**Verified 2026-07-29 on `codex/platform-phase-1` after `240c164`.**
The global Next.js response policy now adds a compatibility-safe CSP
(`object-src`, `base-uri`, `frame-ancestors`, `form-action`, and
`upgrade-insecure-requests`), one-year host-scoped HSTS without preload or an
unverified subdomain commitment, and cross-origin opener/resource policies.
Existing content-type, framing, referrer, and permissions policies remain.

Focused header test 1/1; full suite 39 files / 195 tests; structure, lint,
typecheck, `db:check`, `db:check:fresh` (12 migrations / 53 tables), and the
99-page Production build pass. Production-edge presence must be verified only
after deployment.

## Incremental update — authentication request diagnostics

**Verified 2026-07-29 on `codex/platform-phase-1` after `7e75667`.**
All four authentication routes now use a shared request context that generates
its own UUID correlation ID, returns it as `X-Request-ID`, preserves the
existing response body/status/cookies, and converts only uncaught failures to
the stable `{error:"internal_error"}` contract. Structured failure logs contain
timestamp, event, request ID, method, and pathname only; exception detail,
query values, tokens, and profile data are excluded.

Focused tests pass 8/8; full suite 38 files / 194 tests; structure, lint,
typecheck, `db:check`, `db:check:fresh` (12 migrations / 53 tables), and the
99-page Production build pass. No persistence or OIDC semantics changed.

Authenticated Vercel inspection confirms the correct `res-publica` project has
`SESSION_SECRET`, `DATABASE_URL`, `OIDC_REDIRECT_URI`, `OIDC_CLIENT_ID`,
`OIDC_ISSUER`, `OIDC_CLIENT_SECRET`, and `NEXT_PUBLIC_SITE_URL` configured for
Production without exposing values. Auth0 management inspection is blocked by
an unauthenticated dashboard session, and the live callback mismatch remains
unresolved.

## Incremental update — platform implementation programme

**Verified 2026-07-29 on branch `codex/platform-phase-1` at base
`6805f787e5525267496ef11db24c6db288f2b535`.** The approved three-phase
platform mandate is tracked in `PLATFORM_IMPLEMENTATION_PROGRAMME.md`, with
external, architecture, security, and legal activation gates in
`SECURITY_LEGAL_GATE_REGISTER.md`.

The first Phase 1 truthfulness slice restricts anonymous
`GET /api/platform/modules` access. ADR-003's internal build-time manifest
registry remains unchanged, while the HTTP route now returns a private,
non-cacheable `404` and no longer exposes declarative routes, database tables,
dashboard contributions, AI capabilities, or internal module names.

Verification: focused route test 1/1; isolated Publishing integration tests
9/9 after a resource-contention timeout in the first parallel run; full suite
37 files / 191 tests; structure, lint, typecheck, `db:check`,
`db:check:fresh` (12 migrations / 53 tables), and the optimized 99-page
Production build all pass. No migration was created.

## Incremental update — profile consent receipts

**Verified 2026-07-29 on local `main` at base
`7a6ce1bc22b4dcc767b6515c498a4ece9b9b0cfe`.** The current unstaged worktree
requires two separate, default-off confirmations before the authenticated
membership/profile-creation request can be submitted: data protection and use
of profile information within described Res Publica programmes and activities.
The route rejects missing or false confirmations. Successful creation writes
two locale-specific, version-`v1` canonical `consent_records` with one grant
timestamp inside the same transaction as the Membership row and its audit
record.

No migration was created: the existing `consent_records.purpose` column is
PostgreSQL `text`; the Drizzle enum is a TypeScript allowlist, so the six
DE/EN/FA versioned purposes require no structural database change.
`db:check` passed and a fresh database still applies exactly 12 migrations and
creates 53 tables.

Verification on the final source: focused consent/frontend tests 36/36, full
suite 37 files / 191 tests, structure, lint, typecheck, `db:check`,
`db:check:fresh`, and the optimized 99-page production build passed.
Production-mode browser checks confirmed two unchecked controls, a disabled
submit action until both are selected, correct DE/EN/FA copy, Persian RTL, and
working localized data-protection navigation. No production deployment has
yet occurred.

## Incremental update — Civic Observatory frontend redesign

**Verified 2026-07-29 on local `main` at base
`7a6ce1bc22b4dcc767b6515c498a4ece9b9b0cfe`.** The current unstaged frontend
worktree introduces the Civic Observatory design system, complete homepage
narrative, localized Lab and privacy-settings routes, conservative consent UI,
a reviewed DE/EN/FA HARM research-project entry, updated collection/search/form
surfaces, and a redesigned private Member Profile display. That redesign alone
did not change backend contracts, authentication, persistence, migrations, or
Publishing Authority semantics.

Verification on the current source: structure, lint, typecheck, 20 focused
frontend boundary tests, full suite 36 files / 182 tests with a 60-second
PGlite test budget, `db:check`, `db:check:fresh` (12 migrations / 53 tables),
optimized production build (99 generated static pages), 71 localized route
smoke checks, zero browser console errors, zero broken documentation links,
zero live retired-term drift, and `git diff --check`. Lighthouse against the
optimized build scored desktop 100/100/100/100 and mobile
95/100/100/100 (performance/accessibility/best-practices/SEO), CLS 0.

The exact homepage first-load JavaScript is 106kB; Framer Motion remains scoped
to the Lab route. Rendered checks confirmed desktop/mobile navigation, native
modal focus containment, German wrapping, Persian RTL, no 375px overflow,
metadata in `<head>`, and truthful private-profile fallback behavior.
`tsconfig.json` and `tatus` remain pre-existing unrelated changes and are
excluded. No commit, push, or deployment was performed.

**Verified.** Re-run fresh, this session, 2026-07-24 (repository date context; git commit dates shown below are their own recorded dates, not this verification date). Do not reuse this file's content past its next re-run — re-execute the commands below before trusting it on a later date.

---

## Incremental update — public frontend release

**Verified 2026-07-24.** The public narrative implementation is committed at
`afa22073f8e85dfc2885c052365ac90a853e2391`
(`feat: transform public narrative experience`) and pushed to
`origin/integration/publishing-reconciliation`. The remote branch hash was
verified with `git ls-remote`. Publishing Authority remains the stable backend
baseline at `09c160bb7e56a7bd9e5b9039e2f12de49ae727bf`.

Release verification passed: focused frontend tests 12/12; full suite 35 files
/ 168 tests; structure, lint, typecheck, `db:check`, `db:check:fresh`
(12 migrations / 53 tables), production build with
`NEXT_PUBLIC_SITE_URL=https://respublica-ev.de`, and `git diff --check`.
The production-mode build returned 200 for 53 core route checks and all 42
sitemap URLs. Metadata checks confirmed DE/EN/FA direction, canonical URLs,
hreflang, and x-default. Lighthouse accessibility scores were 96 for all three
localized homepages and 100 for Method, Offerings, and Membership.

Production deployment is externally blocked. The verified existing Vercel
project is `res-publica` with production domain `https://respublica-ev.de` and
Git production branch `main`. Its production environment contains only
`NEXT_PUBLIC_SITE_URL`; `/api/health/ready` returns 503 with
`configured:false`. A production `DATABASE_URL` is required for readiness, and
OIDC issuer/client/redirect configuration is required for the protected
authentication and Member Profile path. No guessed values were supplied and no
production deployment was attempted.

## Current branch

**Verified.** `integration/publishing-reconciliation` (`git branch --show-current`).

## Latest commit

**Verified.** `afa2207` — "feat: transform public narrative experience".

Local `main` remains one commit ahead of `origin/main`: `5212636` only.

## Prior pre-commit git status (historical; superseded by the incremental update above)

**Verified**, `git status --short`, run this session:

```
 M docs/AI/ARCHITECTURE_INDEX.md
 M docs/AI/ARCHITECTURE_MEMORY.md
 M drizzle/meta/_journal.json
 M docs/AI/CURRENT_STATE.md
 M docs/AI/DECISION_LOG.md
 M docs/AI/MODULES/identity-auth.md
 M docs/AI/MODULES/persistence.md
 M docs/AI/MODULES/publishing.md
 M docs/AI/OPEN_WORK.md
 M docs/AI/WARNINGS_AND_DEBT.md
 M src/auth/authorize.ts
 M src/persistence/module-schema.ts
 M src/modules/publishing/publishing.test.ts
 M src/modules/publishing/translation.ts
 M src/modules/publishing/types.ts
 M tsconfig.json
?? drizzle/0011_publishing-authority.sql
?? src/app/api/publishing/
?? src/application/publishing-authority.ts
?? src/application/publishing-authority.integration.test.ts
?? src/application/publishing.integration.test.ts
?? src/application/publishing.ts
?? src/modules/publishing/authority.test.ts
?? src/modules/publishing/authority.ts
?? tatus
```

Staged: none. Publishing-scope changes are unstaged/untracked. `tsconfig.json` remains a pre-existing unrelated final-newline-only change and is excluded from the Publishing boundary. `tatus` remains untracked and untouched.

`docs/AI/` and `docs/source/communication/` are no longer untracked: both were committed by `890f97f`.

## Implemented modules

**Verified** (source + at least one adjacent test file exist; committed on `main`, ≤ `origin/main` tip `7025e6f` — i.e., present on the remote). "Implemented" here means source and tests exist on disk — **it does not mean the tests currently pass**; no test suite was run to produce this file.

| Module | Source | Test evidence |
|---|---|---|
| Identity/Auth | `src/auth/*` | `authorize.test.ts`, `config.test.ts`, `src/app/api/auth/routes.test.ts` |
| Member Profile (first slice) | `src/app/[locale]/profile/`, `src/application/member-profile.ts` | `member-profile.integration.test.ts`, `route.test.ts`, `MemberProfileDashboard.test.ts` |
| HARM Governance | `src/modules/harm-governance/*` | `authority.test.ts`, `harm-governance.test.ts`, `harm-governance.integration.test.ts` |
| Publishing Authority | `src/modules/publishing/*`, `src/application/publishing*.ts`, `src/app/api/publishing/*` | domain, authority, application, and route tests |
| Events | `src/modules/events/*` | `events.test.ts`, `src/app/api/events/capacity/route.test.ts` |
| Membership | `src/modules/membership/*` | `membership.test.ts` |
| Knowledge Graph | `src/modules/knowledge-graph/*` | `knowledge-graph.test.ts` |
| AI Layer (local provider only) | `src/modules/ai-layer/*` | `ai-layer.test.ts` |
| Persistence (migrations 0000–0010) | `src/persistence/*`, `drizzle/0000`–`0010` | `persistence.integration.test.ts`, `schema.test.ts` |
| Frontend/i18n | `src/app/[locale]/*`, `src/i18n/*`, `middleware.ts` | not individually confirmed this session |
| EAO | `scripts/eao/*` | `project-health.test.mjs` |
| Community, CRM, Dashboard, Analytics | `src/modules/{community,crm,dashboard,analytics}/*` | own `*.test.ts` files exist; depth not assessed |

## Unfinished / partial modules

**Verified:**

- **Publishing Authority**: no longer unfinished. The verified ADR-036
  implementation is committed at `09c160b`.
- **AI Layer — external provider**: not started (module's own README, direct quote: "Real external provider... not started").
- **Member Profile**: multiple TODO items unchecked in `docs/source/projects/MEMBER_PROFILE.md`'s own checklist (see `docs/AI/OPEN_WORK.md` OPEN-004).
- **Knowledge Graph HTTP routes** (`/api/knowledge-graph/{lookup,related,search}`): declared in the module's manifest, not found under `src/app/api/` in this session's listing — status genuinely undetermined (may be in-process-only, may be unbuilt).

## Pending migrations

**Verified.** `drizzle/0011_publishing-authority.sql` and its journal/schema
changes are committed in `09c160b`. On 2026-07-24, `npm run db:check` passed
and `npm run db:check:fresh` applied all 12 journaled migrations and created
53 tables.

## Pending tests

**Verified 2026-07-24 after frontend release.** Focused frontend tests
passed 12/12. The complete deterministic suite
`npm test -- --maxWorkers=1` passed all 35 files / 168 tests.
`check-structure`, lint, typecheck, `db:check`, `db:check:fresh`
(12 migrations / 53 tables), production build with
`NEXT_PUBLIC_SITE_URL=https://respublica-ev.de`, and `git diff --check` all
passed.

## Known problems

**Verified:**
1. The frontend release candidate is pushed at `afa2207`, but production
   deployment is blocked by missing database and OIDC configuration
   (WARN-012).
2. `src/modules/membership/README.md` contains a stale claim that ADR-027 "remains unresolved" — ADR-027 is Accepted and `src/auth/` has committed source (WARN-004).
3. `tsconfig.json` has an unrelated final-newline-only working-tree change; exclude it from the Publishing commit boundary.
4. Five `worktree-agent-*` branches are stale (zero unique commits, verified) — harmless but unswept.
5. An untracked stray file `tatus` exists at repo root — left untouched and excluded.

## Next recommended development step

**Verified next step:** configure the existing Vercel project's production
database and OIDC values, confirm `/api/health/ready` returns 200 and auth is
operational, then deploy the exact pushed revision through the existing
project. `tsconfig.json` and `tatus` remain unrelated and excluded.
