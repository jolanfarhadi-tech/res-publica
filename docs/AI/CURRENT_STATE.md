# Current State — Live Repository Snapshot

## Incremental update — Mandatory hardening Phase B: privileged access, 2026-08-16

High-impact Governance, Publishing, Membership, Fellowship and gated research
credential operations now require a provider-backed `recent-mfa` session whose
authentication instant is no older than five minutes. A standard OIDC step-up
entry requests fresh provider authentication without manufacturing assurance
locally. Existing exact capabilities, target scopes, domain isolation,
separation of duties, rate limits, feature gates and atomic persistence remain
in force.

Sensitive transitions require a bounded, operation-compatible reason code and
server-generated request ID. Accepted transitions correlate canonical audit
evidence by actor, session, request, capability, reason and timestamp. Handled
authorization denials emit privacy-minimized operational telemetry without raw
IP addresses, identities, tokens or request bodies. Governance revocation now
locks and conditionally changes the grant in the same transaction as its audit,
preventing duplicate revoke evidence under concurrent requests.

Additive migration `0023_privileged-access-audit-context.sql` adds only nullable
audit-correlation columns and indexes. Provider MFA policy/enrollment, security
event export, named owners, periodic review evidence, alert retention and
Production migration remain external gates. The research real-data activation
gate remains closed.

Verification passes 10 focused files / 38 tests and the full serial suite at
104 files / 428 tests. Lint, typecheck, structure, secret/supply-chain checks,
the 20-activity/98-table processing inventory, zero-vulnerability Production
dependency audit, Drizzle consistency, the fresh 24-migration/98-table main
schema, isolated 1/6 research schema, all nine EAO pipelines, the 166-page
Production build and `git diff --check` pass. EAO full-platform readiness
remains correctly No-Go because 32 external activation gates are unresolved;
Production itself remains unchanged.

## Incremental update — Mandatory hardening Phase A: supply chain and Tier-0, 2026-08-16

The repository now pins the supported runtime to Node 24.18.0 across
`package.json`, `.nvmrc` and CI. GitHub Actions are immutable-SHA pinned,
checkout credentials are not persisted, default workflow authority is
read-only, and source-commit identity is checked before verification. Pull
requests receive dependency review; CodeQL provides the repository SAST gate.

Two deterministic local controls now fail CI on high-confidence secret
material in the active tree or Git history, unexpected lockfile registries or
install scripts, mutable workflow actions, runtime drift, or missing CI gates.
The scanners suppress secret values. The exact install-script allowlist and
Tier-0/provider boundaries are documented with a dependency-compromise
playbook. Provider-side branch protection, named owners, event export, secret
rotation and Production control-plane configuration remain external evidence,
not claims made by repository code.

A Vite 8/Node 24 regression was also corrected: imported CRLF `.mjs` EAO and
operations modules no longer retain executable shebangs that Vite moved behind
generated exports. They continue to run through the existing explicit `node`
npm commands, and the canonical Vitest runner remains unchanged.

Verification passes 8 focused files / 28 tests and the full serial suite at
101 files / 418 tests. Lint, typecheck, structure, secret/supply-chain checks,
Drizzle consistency, the fresh 23-migration/98-table main schema, isolated 1/6
research schema, 20-activity/98-table processing inventory, all nine EAO
pipelines, zero-vulnerability Production dependency audit, Production build
and `git diff --check` pass. Production remains unchanged.

## Incremental update — Release F Integrated Operations and EAO readiness, 2026-08-16

The protected `/{locale}/operations` entry now composes Membership, Publishing,
Academy, Fellowship and Civic Knowledge Graph workspaces without creating a
universal administrator role. The server returns only operational-area links
supported by an active, exact Civic grant at MFA assurance. Domain pages retain
their own authorization checks and write semantics. The Academy aggregate read
was tightened from any `academy.*` MFA grant to the dedicated exact
`academy.operations.read:academy` grant, preventing course-scoped staff from
receiving the full Academy operational projection.

The EAO Release Readiness pipeline now consumes unresolved blocking rows from
the canonical Security/Legal Gate Register during its existing dependency-map
walk. Its recommendation is explicitly scoped to full-platform Production
activation. The current repository therefore reports `No-Go` while 29 external,
legal or capability-specific operational gates remain open; this does not
misrepresent a bounded code-only deployment as either approved or forbidden.
EAO execution remains read-only and advisory.

Verification passes 7 focused files / 26 tests and the full serial suite at 99
files / 413 tests. Lint, typecheck, structure, all nine EAO pipelines, Drizzle
consistency, the fresh 23-migration/98-table main schema, isolated 1/6 research
schema, 20-activity/98-table processing inventory, zero-vulnerability
Production dependency audit, `git diff --check`, and a 166-page Production
build pass. Production remains unchanged.

## Incremental update — Release E Public API and Public Knowledge Projection, 2026-08-16

The implemented `public-api` module owns no database table and projects the
existing human-approved public Knowledge Graph through three versioned routes:
`/api/public/v1`, `/content-graph/entities`, and
`/content-graph/relationships`. The boundary is anonymous, read-only and
grounded-public-content-only; it is not the deferred institutional partner
platform.

Entity and relationship responses are built through explicit DTO allowlists.
They contain public URLs and deterministic/human-verified provenance but no
repository paths, canonical-source paths, domain ownership fields or private
table records. Locale filters project DE/EN/FA names and sources. Stable opaque
cursors are bound to resource and filter scope; unknown parameters and invalid
or cross-scope cursors fail closed. Responses provide deterministic ETags,
conditional 304 handling, public cache controls and request IDs. Collection
reads use the shared privacy-preserving PostgreSQL limiter before projection.

No migration, partner account, API key, agreement, quota store, embed widget,
AI provider or Event data integration is introduced. Consumers must preserve
public source URLs; no additional reuse licence is implied. Production remains
at 19 migrations / 66 tables and is unchanged.

Verification passes 21 focused tests, the full serial suite (97 files / 407
tests), lint, typecheck, structure, main and isolated fresh migration checks,
processing-inventory drift, Production dependency audit (zero vulnerabilities),
`git diff --check`, and a 166-page Production build.

## Incremental update — Release D Governed AI/RAG, 2026-08-16

The shared AI Layer now exposes one authenticated Civic route at
`POST /api/ai/rag`. The shared PostgreSQL limiter runs before actor resolution;
the application boundary then requires the session-derived actor's exact
`civic:ai.rag.query:public-knowledge` capability and verified assurance before
any Knowledge Graph retrieval occurs. Existing accounts require a separately
approved grant-provisioning operation; new verified-signup accounts receive the
exact self-service grant atomically with their other bounded grants.

The executable policy registry keeps untrusted input structurally separate
from frozen policy data. Citations are accepted only when they belong to the
query-specific retrieval set, and unsupported output is replaced by refusal.
Only currently public Knowledge Graph sources become public citation URLs.
The local provider remains deterministic keyword retrieval, zero-cost and
advisory; Governance AI and every external provider fail closed.

Raw prompts are not persisted or retained in the in-memory cost ledger. The
database records an HMAC prompt digest, policy/input/provider provenance,
public citation URLs, refusal state, zero cost, request ID and answer digest.
Additive migration `0022_governed-ai-runtime` adds only nullable provenance
columns to the existing `ai_query_log`; it creates no table and contains no
destructive DDL. The local fresh chain applies 23 migrations and creates 98
tables. Production remains at 19 migrations / 66 tables and is unchanged.

Verification passes 35/35 focused tests, the full serial suite (94 files /
395 tests), lint, typecheck, structure, main and isolated fresh migration
checks, processing-inventory drift, Production dependency audit (zero
vulnerabilities), `git diff --check`, and a 163-page Production build.

## Incremental update — Release C Knowledge Graph and Search, 2026-08-10

The accepted generic Knowledge Graph boundary is implemented without creating
a second graph or enabling AI-inferred publication. Civic-owned entity and
`co-occurs` types are registered explicitly; committed MDX is read in stable
order; multilingual sources produce deterministic entity/relationship
candidates and one reproducible SHA-256 content digest. A rebuild records a
candidate ledger only and never changes the authoritative graph.

Independent human approval requires a session-derived actor, exact Civic
candidate scope and MFA. The rebuild initiator cannot review their own
candidates. Relationship approval fails until both endpoints are verified in
the same domain, and Civic candidates cannot mutate Governance-owned records.
Approved graph state, source provenance and canonical AuditLog evidence commit
atomically. Rejection and every failed authorization/state/domain check leave
graph, provenance and audit state unchanged.

The three manifest-declared public read routes now exist and expose only
allowlisted fields backed by currently public-eligible, human-approved
provenance. Public/staff reads and staff writes reuse the shared PostgreSQL
limiter; no raw IP address is stored. The site search index is deterministically
enriched by explicit public MDX entity declarations. The verified HARM project
declares two source-grounded entities in DE/EN/FA; no invented content or AI
relationship was added. The MFA Operations page exists in all three locales at
`/[locale]/operations/knowledge-graph`, with Persian RTL inherited from the
existing layout.

Migration `0021_knowledge-graph-governance` is additive and introduces three
ledger/provenance tables while retaining the existing `kg_entities` and
`kg_relationships` stores. A fresh database applies 22 migrations and creates
98 tables; the processing inventory covers 20 activities and all 98 tables.
Production remains at 19 migrations / 66 tables and has not been changed.
Verification passes focused Release-C tests, the full serial suite (92 files /
386 tests), lint, typecheck, structure, schema/fresh migration checks, the
processing inventory and a 162-page Production build.

## Incremental update — Release B Fellowship System, 2026-08-10

The Civic-domain Fellowship System is implemented as a human-gated,
non-gamified recognition workflow. One candidacy model supports staff
nomination and voluntary self-application, qualitative evidence references,
exact reviewer assignment, mandatory conflict declaration, fail-closed
recusal, human recommendation, independent final decision, private Fellowship
records and explicit status history. It references canonical Person and
AuditLog and creates no parallel identity, session, authorization, consent,
rate-limit or audit mechanism.

Candidates and nominators cannot review or decide their own case; reviewers
cannot make the final decision; a conflicted reviewer cannot submit a review;
and approval requires a completed human approval recommendation. Every staff
write uses same-origin protection, the shared PostgreSQL limiter, an exact
Civic capability/target and MFA. Accepted state changes and canonical audit
evidence commit atomically. No field or projection implements a score, rank,
badge, leaderboard or automated threshold, and no public member/Fellow roster
exists.

Localized public, self-dashboard and Operations routes exist at
`/[locale]/fellowship`, `/[locale]/dashboard/fellowship` and
`/[locale]/operations/fellowship`. DE/EN/FA copy is complete and Persian uses
the existing RTL layout. Public programme copy remains `documented`, not
operational; no Fellow, cohort, role assignment or institutional claim is
seeded.

Migration `0020_fellowship-system` is additive. A fresh database applies 21
journaled migrations and creates 95 tables. The processing inventory covers
20 activities and all 95 tables. Real self-application and candidacy
processing remain fail-closed unless `FELLOWSHIP_APPLICATIONS_ENABLED=true`;
that Production setting is not added or activated. Local Release-B
verification passes 89 test files / 367 tests, lint, typecheck, structure,
Drizzle checks and both fresh-database boundaries.

## Incremental update — Release A Academy platform, 2026-08-10

The Civic-domain Academy is implemented as a governed multilingual learning
platform rather than a catalogue of invented offerings. It owns programmes,
courses, translations, modules, lessons, resources, instructor assignments,
cohorts, four enrollment policies, applications, invitations, enrollments,
progress, human-reviewed assessments and completion records. It references the
canonical Person/Notification/AuditLog entities and introduces no duplicate
identity, session, authorization, rate-limit or audit mechanism.

Programme and course publication follows
`draft -> review -> approved -> published -> archived`. Course creators cannot
approve their own work, approvers cannot publish it, learners cannot review
their own assessments, issuers cannot revoke their own certificates, and
learners cannot issue their own records. Staff writes require origin checks,
the shared PostgreSQL limiter, exact Civic capabilities and MFA; accepted
state changes append canonical AuditLog evidence in the same transaction.
Completion IDs are random and non-sequential, and the public verification DTO
contains no learner identifier or contact data. Completion copy expressly
disclaims external or state accreditation.

Localized public routes now exist at `/[locale]/academy`, courses and programme
details; private routes exist at `/[locale]/dashboard/academy` and
`/[locale]/operations/academy`. DE/EN/FA copy is complete and Persian continues
through the existing RTL layout. No course, instructor or completion claim is
seeded or fabricated: the public catalogue remains empty until independently
reviewed records are actually published.

Migration `0019_academy-platform` is additive. A fresh database applies 20
journaled migrations and creates 86 tables. The processing inventory now
covers 19 activities and all 86 tables. Real learner writes remain fail-closed
unless `ACADEMY_ENROLLMENT_ENABLED=true`; that Production setting is not added
or activated by this implementation. Local Release-A verification passes 85
test files / 350 tests, lint, typecheck, structure, Drizzle checks, fresh
migrations, the 140-page Production build and the inventory drift gate.

## Incremental update — governed Content Operations client, 2026-08-10

The protected Operations Console now exposes the seven already-implemented
ADR-036 workflow actions only to independently authorized roles in the current
exact publication scope: intake, human draft versioning, reviewer assignment,
moderation decision, translation assignment, human translation finalization
and Publisher sign-off/readiness. The client derives artifact identifiers from
the bounded workspace, requires at least one source reference for a new draft,
requires reasons for moderation, and requires explicit human confirmation
before readiness.

All mutations continue through the existing `/api/publishing/workflow` route;
no application service, API contract, schema or migration was duplicated or
changed. The server remains authoritative for MFA, exact grants, latest-draft
checks, separation of duties, provenance and atomic AuditLog writes. The UI has
no publish, archive, file, Git, push or deployment action. `ready` retains
`commitHash: null`; actual public-file publication and archival remain outside
this interface and require the existing explicit repository/release boundary.

## Incremental update — truthful member application and wallet states, 2026-08-10

The protected Member Profile now includes the session actor's own allowlisted
Membership Application history: requested tier, status, submission timestamp
and decision timestamp only. Applicant contact/address data, decision actor,
audit references and board deliberation remain excluded at the query projection.
Pending and decided applicants no longer receive the misleading generic
"no membership" action or an invitation to create a duplicate application.
The view remains read-only and localized in DE/EN/FA with Persian RTL.

The Dashboard now derives research-wallet activation availability on the server
from the existing independent wallet approval flags. When that gate is closed,
the Wallet panel is explicitly read-only: it does not inspect browser wallet
storage and renders no activation, recovery, upload or revocation control. The
real-data gate remains closed; no credential issuance, research intake,
migration, provider or legal approval is activated by this display correction.

## Incremental update — processing-inventory drift gate, 2026-08-10

`docs/privacy/PROCESSING_INVENTORY.json` is now the machine-readable technical
inventory synchronized with the human review draft. Eighteen implementation
activities cover all 66 tables parsed from the two current PostgreSQL schema
files and classify active, provider-inactive, internal-only, server-disabled
and synthetic-only boundaries separately.

`npm run privacy:inventory:check` and its regression test fail on an
unclassified table, missing source evidence, human-document drift, an invented
legal basis/retention/erasure value, or an opened Research/HARM real-data
boundary. CI runs the check before lint/typecheck/tests. This is engineering
evidence only: all legal-basis, retention-period and erasure-rule fields remain
`null`, and no legal/DPA/DPIA gate is closed by this work.

## Incremental update — bounded Operations Console, 2026-08-10

The existing programme milestone **Bounded administration** now has a narrow
Membership and Publishing operator surface. `GET /api/operations` derives its
queue only from the signed-in actor's active, exact-target Civic grants and
requires MFA before loading operational data. Membership details require the
same exact application grant and exclude research-readiness data. Applicant
contact/address data, versioned document acknowledgements, assignment time,
decision actor/timestamps and canonical decision-audit references are loaded
only in that protected detail projection.

The localized `/[locale]/operations` route reuses the existing atomic
Membership decision endpoint and the existing scope-filtered Publishing
workspace. It introduces no super-admin role, no clarification or lifecycle
transition unsupported by the accepted implementation, and no new Publishing
write path. Membership approve/reject still requires an explicit confirmation;
the application service continues to enforce MFA, exact target, separation of
duties, atomic persistence, notification and audit semantics. Publishing
readiness remains non-publishing and writes no content or Git commit.

The Dashboard exposes the workspace link only when the current MFA assurance
satisfies at least one active exact operational grant. DE/EN/FA, Persian RTL,
private no-store responses, correlated failures and a 375px no-overflow state
are verified. No migration or external provider activation is introduced.

## Verified Production baseline and operational hardening — 2026-08-10

**Verified baseline immediately before this slice:** local branch
`codex/platform-phase-3`, local HEAD, `origin/codex/platform-phase-3`,
`origin/main`, and the active Vercel Production deployment all contained commit
`7d2bb07ed7f41244cb067a34eee63c15f1b2b98d`. Deployment
`dpl_Hcik4d48y5SykE4ZPaDj6bxpqez5` in the canonical Vercel project
`res-publica` serves `https://respublica-ev.de`. Production has the required
database/session/OIDC variable names and no `RESEARCH_*` activation variable.
No value was recorded in repository memory.

**Verified:** the protected Neon Production branch in `aws-eu-central-1`
contains all 19 repository migrations and 66 public tables. Migrations
0014–0018 are applied. A 2026-08-10 isolated, non-finalized restore from a new
manual snapshot reproduced 19 migrations, 66 tables, zero unvalidated
constraints and a successful readiness query over certificate-authorized TLS
1.3. Production was not targeted; temporary drill branches were removed after
evidence was retained. RPO/RTO remain unapproved owner decisions.

**Verified:** the current Membership/Auth implementation separates Auth0
signup and verified account activation from the Membership Application and
MFA/exact-scope/separation-of-duties board decision. The gated research path
contains actual local BBS credential issuance, selective disclosure, recovery,
revocation and an isolated verifier tested only with synthetic data. ADR-037
and ADR-038 remain **Proposed**. `RESEARCH_REAL_DATA_ACTIVATION_APPROVED` remains
absent/false, so real credentials and real research contributions fail closed.

Auth0 discovery and Production login initiation now resolve to the approved EU
tenant with the exact callback, PKCE, state and nonce. The old callback-mismatch
finding is resolved. A repeatable, non-mutating Membership Production E2E check
now verifies the anonymous/OIDC boundary and can validate private reads plus
genuine MFA when an owner-controlled synthetic session is supplied. No such
session is stored in the repository, so authenticated application/board E2E is
still an explicit operational verification item rather than a claimed result.

This operational-hardening slice adds private no-store session
responses, correlation for the Profile boundary, structured privacy-safe logs
for database/OIDC/critical request/notification failures, direct Auth0
discovery monitoring, read-only protected-boundary monitoring, and the
repeatable restore checker. `tsconfig.json` and `tatus` remain unrelated and
excluded.

## Incremental update — completed safe slices deployed, 2026-08-04

Functional release commit `f2c59e1f1e7f4ebc7cb0a334d3b85c42117548cf`
is deployed from `main` through canonical Vercel project `res-publica` as
`dpl_EoKd5CFUZEb4hjHn5Tf7puMA9gH9`. Build logs prove branch `main`, commit
`f2c59e1`, Next.js 15.5.22, and 105 generated pages. The custom Production
domain aliases this Ready deployment.

This release adds the self-only Payment history to the protected Dashboard,
fixes the Knowledge Graph domain-filter precedence defect, records the exact
absence/boundary of its declarative HTTP routes, and reconciles stale
repository memory. It introduces no migration or provider activation.
Repository health checks return live/ready `200`; DE/EN/FA, Membership,
Dashboard/Profile anonymous pages, sitemap, robots, and all three Open Graph
images return `200`. Login initiation returns the expected `302`, anonymous
session inspection `200`, and private Dashboard/Profile APIs `401`.

Auth0 management access still redirects to the provider's own dashboard login,
so the exact Allowed Callback URL cannot be changed by the current authorized
session. The owner-side action in OPEN-011/WARN-014 remains the only observed
technical blocker to authenticated Production verification.

## Incremental update — Knowledge Graph domain-filter correction, 2026-08-04

`searchEntities` now applies its optional Civic/Governance domain predicate to
canonical-name, alias, and entity-type matches as one grouped condition. The
previous operator precedence allowed alias and type matches from the peer
domain to bypass the requested boundary. A regression fixture proves both
directions and the focused Knowledge Graph suite passes 10/10.

The manifest-declared `/api/knowledge-graph/{lookup,related,search}` routes are
confirmed absent, not merely missed by an earlier listing. Current consumers
import the deterministic query functions in-process. The manifest explicitly
describes its routes as declarative future wiring; no public HTTP contract was
invented because an access policy and route implementation milestone are not
accepted in the current programme.

## Incremental update — self-facing payment history, 2026-08-04

The protected Dashboard now includes the remaining member-facing Payment view
from `MEMBER_PROFILE.md`. The query is constrained by the session-derived
`actor.personId` and returns an explicit allowlist of amount, currency, purpose,
status, and timestamps. Provider references, payer identifiers, other people's
records, and all internal or Governance data never enter the projection.

The existing Notification view remains unchanged. DE/EN/FA copy covers all
four canonical payment states and locale-aware amount/date formatting. No API
mutation, authorization change, migration, provider activation, or new domain
model was introduced. Focused verification passes 3 files / 7 tests; the full
serial suite passes 53 files / 253 tests. Structure, lint, typecheck,
`db:check`, fresh 14-migration/55-table verification, the 105-page Production
build, and `git diff --check` pass.

## Incremental update — Production deployment, 2026-07-30

Commit `fc09d8d003106e32bd6af2431043055171566c2d` is deployed from
`main` through the canonical Vercel project `res-publica`. Production
deployment `dpl_29PZCkF2WzgWtqiLB9sURaRksXvw` serves
`https://respublica-ev.de`; build logs confirm the exact commit and 105-page
build.

The protected Neon `production` branch is in `aws-eu-central-1` with seven-day
history retention. TLS 1.3 and certificate validation were verified before
migration. Repository migrations `0012_platform-rate-limits` and
`0013_notification-delivery-attempts` were the only pending migrations and
were applied forward-only from a recorded pre-migration recovery timestamp.
Production now has 14 journaled migrations and 55 public tables, with no
pending or content-drifted migration. The temporary schema CREATE grant was
revoked, and runtime permissions match the migration boundary.

Production health and readiness return `200`; all DE/EN/FA public routes,
canonical metadata, hreflang/x-default, RSS, sitemap, robots, localized Open
Graph images, Persian RTL, mobile navigation, private Dashboard/Profile
protection, event authorization, and Governance/Publishing activation or
authorization boundaries were verified. Browser and final Vercel error-log
checks are clean. Auth0 still rejects the correct application redirect
`https://respublica-ev.de/api/auth/callback` because that value is absent from
the application's Allowed Callback URLs; authenticated operations remain
externally blocked until the Auth0 owner corrects that setting.

## Incremental update — Phase 0 P3 Persian Open Graph fallback

**Verified 2026-07-30 on `codex/platform-phase-3` after `cc21280`.**
OPEN-019 has the owner-approved temporary resolution: DE and EN prebuild their
localized Open Graph cards, while FA prebuilds a language-neutral Res Publica
identity card without passing Persian text through ImageResponse/Satori.
Localized FA title and description remain in HTML metadata, and Persian
`lang=fa`/`dir=rtl` behavior is unchanged.

Focused regression verification passes 26/26 tests. The Production build
generates 105 pages, including static `/de/opengraph-image`,
`/en/opengraph-image`, and `/fa/opengraph-image` routes without the prior
OpenType substitution failure. Production-mode local checks confirm localized
DE/EN/FA metadata, no FA horizontal overflow, and `200 image/png` for every
locale image URL.

## Incremental update — Phase 0 P3 lazy locale dictionaries

**Verified 2026-07-30 on `codex/platform-phase-3` after `f689e9f`.**
`getDictionary()` is now an async locale-keyed loader. The German reference
dictionary remains a type-only import so DE/EN/FA shape compatibility is
compile-time checked without eagerly loading any runtime JSON. All server
callers await the shared boundary, including metadata, RSS, search indexing,
collection pages, not-found, membership, and the dynamic Open Graph route.

The Production build emits the three dictionaries as distinct server chunks
(DE `8820.js`, EN `2664.js`, FA `2126.js`) and still generates 102 pages.
Focused verification passes 22/22 frontend-boundary tests; the full serial
suite passes 52 files / 249 tests. Structure, lint, typecheck, `db:check`,
`db:check:fresh` (14 migrations / 55 tables), and `git diff --check` pass.
Production-mode rendering verifies localized DE/EN/FA headings and controls,
FA `lang=fa`/`dir=rtl`, zero horizontal overflow, and zero browser
warnings/errors.

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

P3 milestone 20's original Persian-text rendering path was rejected by the
current ImageResponse/Satori OpenType support. It is now resolved by the
explicit owner-approved neutral FA card described above; see OPEN-019.

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

## Historical branch at the 2026-07-24 compilation

**Verified.** `integration/publishing-reconciliation` (`git branch --show-current`).

## Historical latest commit at that compilation

**Verified.** `afa2207` — "feat: transform public narrative experience".

At that time, local `main` was one commit ahead of `origin/main`: `5212636`.
This was later resolved; see the current Production update at the top.

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
- **Knowledge Graph HTTP routes** (`/api/knowledge-graph/{lookup,related,search}`): confirmed unbuilt. The deterministic query API is consumed in-process; the manifest calls the route list declarative future wiring. No accepted public-route/access-policy milestone currently authorizes exposing it.

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

## Historical known problems from the 2026-07-24 compilation

**Verified:**
1. Production database/OIDC variables were then missing; this is resolved
   except for the separate Auth0 callback blocker (WARN-014).
2. The Membership README's stale ADR-027 claim is now corrected (WARN-004).
3. `tsconfig.json` has an unrelated final-newline-only working-tree change; exclude it from the Publishing commit boundary.
4. Five `worktree-agent-*` branches are stale (zero unique commits, verified) — harmless but unswept.
5. An untracked stray file `tatus` exists at repo root — left untouched and excluded.

## Historical next recommended step from that compilation

That configuration/deployment step is complete. Current external actions are
listed in `OPEN_WORK.md` and `SECURITY_LEGAL_GATE_REGISTER.md`; `tsconfig.json`
and `tatus` remain unrelated and excluded.

## Historical implementation verification — Membership and gated research wallet, 2026-08-04

This section records the pre-commit verification that preceded feature commit
`326229ff7a01574c474622737bf18315db9416ed`; the Production state at the top of
this file supersedes its deployment claims. The then-unstaged implementation
added the account/application/board decision
boundary, optional research readiness, project consent/eligibility, local BBS
wallet, holder-controlled recovery, separate research verifier and anonymous
intake. Main migrations ran through 0018 (19 migrations, 66 tables). The
isolated verifier has one migration and six tables. Focused serial verification
passed 12 files / 30 tests. The complete serial suite passed 72 files / 294
tests. Structure, lint, typecheck, both migration checks, the zero-vulnerability
Production dependency audit and the 119-page Production build all passed.

Real credentials and real research contributions remain fail-closed under the
exact final gate `RESEARCH_REAL_DATA_ACTIVATION_APPROVED`. Synthetic cryptographic
smoke creates no persistent records. ADR-037/038 remain Proposed and require the
external approvals listed in the gate register. At the time of this historical
verification no Production migration had been performed; migrations 0014–0018
were subsequently applied as recorded in the current section above.
