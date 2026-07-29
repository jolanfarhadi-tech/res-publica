# Module: Persistence

## Incremental implementation — notification delivery attempts, 2026-07-29

Migration `0013_notification-delivery-attempts.sql` adds one
`notification_delivery_attempts` table beneath the canonical Notification
entity. It records provider, deterministic idempotency key, bounded attempt
number, state, retryability, non-sensitive error code, optional provider
message reference, and timestamps. It does not store the recipient address or
message body.

Unique constraints prevent duplicate attempt numbers per Notification and
duplicate idempotency keys. The Notification foreign key is restrictive, and
the verified runtime role receives only SELECT/INSERT/UPDATE. Local
verification applies 14 migrations and creates 55 tables. Migration 0013 has
not been applied to Production.

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

**Migrations** (`drizzle/`, directory listing this session): `0000_m1-canonical-domain.sql` → `0011_publishing-authority.sql` (12 total). The last, `0011`, is **UNCOMMITTED_WORKTREE** (untracked file; matching `_journal.json` entry unstaged) — see `MODULES/publishing.md`. All others (`0000`–`0010`) are `REMOTE_VERIFIED` (on `origin/main`).

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

**REMOTE_VERIFIED** for migrations `0000`–`0010`. **UNCOMMITTED_WORKTREE, LOCALLY_VERIFIED 2026-07-24** for migration `0011` and its corresponding schema/journal changes.

## Open work

Migration verification is complete. Remaining work is the human-approved Publishing-only commit decision; see `OPEN_WORK.md` OPEN-001.

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
