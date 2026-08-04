# Module: Persistence

## Incremental migrations 0014–0016 — 2026-08-04 (uncommitted)

Three additive migrations add membership applications/document
acknowledgements, independent research preference/consent/eligibility records,
OIDC flow intent, and pseudonymous wallet metadata. They do not update, delete,
backfill, or infer decisions for existing rows. `db:check` passes and the fresh
chain applies 17 migrations and creates 63 tables. Recovery and pre-application
checks are documented in `docs/persistence/MIGRATIONS_0014_0016_RECOVERY.md`.
No Production migration is authorized or applied.

## Production migration verification — 2026-07-30

The canonical Neon Production branch now contains all 14 repository migrations
and 55 public tables. Only `0012_platform-rate-limits` and
`0013_notification-delivery-attempts` were pending; both were verified
additive and backward-compatible before forward application. TLS 1.3,
certificate validation, the protected branch, seven-day history retention, a
pre-migration recovery timestamp, journal hashes, and post-migration table and
grant state were verified.

The dedicated migration role owns the Drizzle journal but does not retain
CREATE on `public`. A temporary CREATE grant was applied for the two migrations
and revoked afterward. The runtime role has the intended DML on
`rate_limit_buckets`, SELECT/INSERT/UPDATE but no DELETE on
`notification_delivery_attempts`, and no membership in migration or owner
roles. Vercel Production now uses a pooled `res_publica_runtime` connection
with certificate-verifying TLS; no connection value was recorded.

## Incremental implementation — notification delivery attempts, 2026-07-29

Migration `0013_notification-delivery-attempts.sql` adds one
`notification_delivery_attempts` table beneath the canonical Notification
entity. It records provider, deterministic idempotency key, bounded attempt
number, state, retryability, non-sensitive error code, optional provider
message reference, and timestamps. It does not store the recipient address or
message body.

Unique constraints prevent duplicate attempt numbers per Notification and
duplicate idempotency keys. The Notification foreign key is restrictive, and
the verified runtime role receives only SELECT/INSERT/UPDATE. Local and
Production verification apply 14 migrations and create 55 tables.

## Incremental implementation — shared rate-limit buckets, 2026-07-29

Migration `0012_platform-rate-limits.sql` adds the Shared Platform Services
table `rate_limit_buckets` with a composite `(scope, identifier_hash)` primary
key, expiry index, atomic PostgreSQL upsert semantics, and a conditional DML
grant for `res_publica_runtime`. It is not a canonical business entity and
contains no raw client address. Buckets reset atomically and stale expired rows
are removed after a bounded grace period.

The same table now protects distinct Governance and Publishing
privileged-write scopes in addition to login, membership, and event writes.
Scope is included in the HMAC input, so one stored identifier hash cannot
correlate a client across these policy domains. No raw IP address or
business/person identifier is persisted.

The `newsletter.subscribe` scope now replaces the former process-local
raw-address Map. It permits five attempts per hour and remains unreachable
while the independent newsletter activation gate is closed.

Local verification applies 13 migrations and creates 54 tables. The migration
has not been applied to Production and requires the normal snapshot,
authorization, TLS, and post-migration permission checks.

## Purpose

The shared Drizzle/Postgres persistence layer underlying every domain and per-module table in the repository, plus the offline-first local-dev database strategy. Evidence: `src/persistence/` directory (grepped in full this session); `architecture/adr/ADR-010-offline-first-development.md`.

## Canonical authority

- `architecture/adr/ADR-002-domain-model.md` — canonical domain entities.
- `architecture/adr/ADR-010-offline-first-development.md` — offline-first as platform-wide principle.
- No single dedicated "persistence architecture" ADR was found; this module's shape is inferred from ADR-002/010 plus direct code inspection.

## Current implementation

`src/persistence/{database.ts, index.ts, module-schema.ts, persistence.integration.test.ts, repositories.ts, runtime.ts, schema.test.ts, schema.ts}` (directory listing this session). Drizzle ORM 0.45 + `pg` (production Postgres) + `@electric-sql/pglite` (local dev), per `package.json` (read in full this session).

**Incremental update 2026-07-29, verified unstaged worktree:** initial
Membership/profile creation now writes two locale-specific version-`v1`
`consent_records` in the same transaction as the Membership and canonical
audit record. The existing `purpose` column is PostgreSQL `text`; extending
its TypeScript allowlist introduces no table, column, constraint, or migration.

## Data and persistence (this module's own subject)

**Core domain schema** (`src/persistence/schema.ts`, grepped this session): `people` (L13), `consentRecords` (L22), `payments` (L38), `organizations` (L56), `notifications` (L65), `auditLog` (L81), `authIdentities` (L99), `authSessions` (L115), `authFlows` (L132), `authorizationGrants` (L146) — 10 tables.

**Per-module schema** (`src/persistence/module-schema.ts`, grepped this session, ~40 tables): Membership (`members`, `membershipStatusChanges`, `recurringPledges`, `institutionalSupporterProfiles`, `membershipBenefitGrants`), Events (`events`, `registrations`, `waitlistEntries`, `eventQaLog`, `outcomePublications`), Publishing (`submissions`, `moderationQueue`, `drafts`, `translationHandoffs`, `signOffRecords`, `publishCommits`), Community (`communityMembers`, `ladderStageTransitions`, `evangelismInvitations`), Knowledge Graph (`kgEntities`, `kgRelationships`), AI Layer (`aiQueryLog`, `aiCostLedger`), HARM Governance (`harmCases`, `harmEvidenceItems`, `basicValidationDecisions`, `structuredHearings`, `evidenceQualityAssessments`, `documentationQualityReviews`, `hearingQualityReviews`, `scientificReviews`, `repairPlans`), Dashboard (`dashboardModuleManifestEntries`, `userPreferences`, `impactEvidenceRecords`), CRM (`donorRecords`, `institutionalPartners`, `grantFunders`, `conflictOfInterestDisclosures`, `fundingSourcePublicationRecords`, `partnershipStatusLogs`), Analytics (`metricSnapshots`, `funnelStageEvents`).

**Migrations:** 14 committed, journaled migrations from
`0000_m1-canonical-domain.sql` through
`0013_notification-delivery-attempts.sql`. All are applied in Production and a
fresh database creates 55 tables.

## Authorization and trust boundaries

Not this module's concern directly — authorization is layered on top by `src/auth/authorize.ts` and per-module `authority.ts` files (see `MODULES/identity-auth.md`). This module provides the tables those layers read/write.

## Public interfaces

Not an HTTP-facing module. Consumed via `Database` type (imported across `src/application/*.ts`, confirmed via imports in `src/application/publishing.ts`, read this session). `scripts/check-fresh-migrations.mjs`, `npm run db:generate`/`db:migrate`/`db:check`/`db:check:fresh` (`package.json`).

## Verification

**Verified 2026-07-29:** consent persistence is covered by domain, route, and
PGlite integration tests. The full suite passed 37 files / 191 tests.
`db:check` passed; `db:check:fresh` still applied exactly 12 migrations and
created 53 tables. No migration was generated or run against production.

Tests confirmed to exist: `src/persistence/persistence.integration.test.ts`, `src/persistence/schema.test.ts`. **Verified 2026-07-24:** the final focused set passed 32/32 and the full one-worker suite passed 156/156. `db:check` passed and `db:check:fresh` applied all 12 migrations, creating 53 tables. Migration `0011` leaves unknown legacy Publishing authorship, assignment time, review target, and translation content nullable instead of fabricating provenance; all new writes persist those fields, and sign-off rejects incomplete legacy provenance.

## Decisions and rejected approaches

Offline-first (`@electric-sql/pglite` for local dev vs. `pg` for production) is a deliberate platform-wide principle (ADR-010), not an ad hoc convenience — see `ARCHITECTURE_MEMORY.md` and `WARNINGS_AND_DEBT.md` WARN-010 for the associated environment-parity risk class.

## Current status

**PRODUCTION_VERIFIED** for migrations `0000`–`0013`; no migration is pending.

## Open work

Migration verification is complete. Future generation must retain WARN-015's
snapshot-history review discipline.

## Do not redo

Do not re-create any of the ~50 tables enumerated above — all exist. Do not create a second schema file for a new module's tables without first checking whether `module-schema.ts` is the established convention (it is, for every module inspected this session).

## Evidence index

- `architecture/adr/ADR-002-domain-model.md`, `ADR-010-offline-first-development.md`
- `src/persistence/{schema.ts, module-schema.ts, database.ts, index.ts, repositories.ts, runtime.ts}` (grepped/listed this session)
- `drizzle/0000_m1-canonical-domain.sql` … `0011_publishing-authority.sql`
- `package.json` (dependencies, scripts — full read this session)
- `.github/workflows/ci.yml` (full read this session)
- tests: `persistence.integration.test.ts`, `schema.test.ts`
- command: `grep "pgTable" src/persistence/schema.ts src/persistence/module-schema.ts`, this session

## Incremental research persistence — 2026-08-04

Additive main migrations 0014–0018 introduce Membership Applications,
acknowledgements, research readiness/consent/eligibility, wallet metadata,
temporary issuance/recovery challenges and recovery evidence. Nullable public-key
columns preserve legacy/offered rows. A separate `drizzle-research` chain creates
six tables in `research_anonymous` with no Person/Member/Auth0/wallet/credential/
consent foreign key and no PUBLIC privilege. Verified fresh state: 19 main
migrations / 66 tables; one verifier migration / six tables. Production has not
been migrated by this slice.
