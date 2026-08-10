# Module: Publishing

## Incremental implementation — Operations Console consumer, 2026-08-10

The bounded Operations Console discovers publication scopes solely from the
current actor's active exact-target MFA editorial grants and consumes the
existing `GET /api/publishing/workspace` projection. It displays scoped queue
counts, submissions, moderation assignments and readiness evidence; Reviewer
and Translator filtering remains owned by the existing application service.

No Publishing write service was duplicated or changed. The console cannot
publish, write public content, create Git commits, bypass human sign-off or
cross a publication scope. `commitHash: null` and the no-auto-publish boundary
remain unchanged.

## Incremental implementation — bounded operational workspace, 2026-07-29

`GET /api/publishing/workspace?scope=...` adds a read-only internal
operational projection without changing the accepted workflow services.
Access requires a session-derived actor, staff MFA, and an active exact-target
Editor, Reviewer, Translator, or Publisher grant.

Editor and Publisher roles can inspect the requested scope. Reviewer and
Translator roles receive only the drafts and workflow records assigned to
their own Person. The API does not return identity contact data, other scopes,
raw grants, or Governance records. Results are privately cached as `no-store`,
correlated, and capped at 100 rows per collection.

The workspace has no write path and cannot create content files, Git commits,
pushes, deployments, or publication. All existing ADR-036 write boundaries
remain in their current application services.

## Incremental implementation — privileged write protection, 2026-07-29

`POST`/`DELETE /api/publishing/grants` and
`POST /api/publishing/workflow` now use the shared privileged-write boundary
with a distinct `publishing.privileged-write` PostgreSQL scope (60 attempts
per fifteen minutes per pseudonymized client). Protection executes before body
parsing, actor resolution, and application persistence; correlated `429`
responses preserve retry metadata.

Publishing application/domain services are unchanged. ADR-036 capability
scope, MFA, role delegation, separation of duties, exact draft/version
moderation, provenance, atomic AuditLog, human sign-off, `commitHash: null` at
readiness, and no-auto-publish semantics remain in force.

## Purpose

The back-stage editorial pipeline: intake → moderation → AI-assisted draft authoring → translation handoff → human sign-off → publish, kept strictly separate from the public site so AI assistance never bypasses a named human's approval. Evidence: `src/modules/publishing/README.md` (read in full, this session).

## Canonical authority

- `architecture/adr/ADR-036-civic-editorial-delegation-of-authority.md` — scoped Civic editorial roles, session-derived authority, separation of duties, human-only sign-off, no-auto-publish boundary. **Accepted** (doc committed `5212636`).
- `src/modules/publishing/README.md` — the module's own status self-description (read in full).

## Current implementation — split explicitly by commit status (special handling per task instructions)

**Commit-state correction, verified 2026-07-24:** both layers described below
were committed together at
`09c160bb7e56a7bd9e5b9039e2f12de49ae727bf`
(`feat: complete Publishing Authority backend`). References below to
`UNCOMMITTED_WORKTREE` describe the pre-commit audit state and are superseded
by this correction. The public frontend added only explanatory safeguard copy:
it makes no `/api/publishing` write call, exposes no assignments/workflow
status, and does not equate readiness with publication.

This module has **two distinct layers with two different git states.** Do not conflate them.

### Layer A — committed domain logic

The original domain baseline and all scoped ADR-036 translation/type/test
corrections are committed. Human-first translation remains valid; a final
translation requires nonblank human content and preserves that content.

### Layer B — committed authority, persistence, and API

Authority, persistence, grants/workflow routes, exact-target shared
authorization, and migration `0011` are committed together at `09c160b`.
There is one implementation, not a competing or worktree-only version.

Content summary (re-verified 2026-07-24): `authority.ts` defines the four editorial roles and scoped MFA enforcement. Shared authorization now supports an opt-in exact-target requirement, which Publishing uses so a null-target grant cannot act as a wildcard publication scope. `publishing-authority.ts` implements transactional, audited grants/revocations with grant date validation and row-locked revocation. `publishing.ts` uses shared repositories for atomic canonical audit writes and enforces the complete persistent workflow: exact latest-draft review, controlled missing-person errors, assignment/decision provenance, no review before a reviewer assignment, no translation before approval, nonblank human translation content, duplicate-locale and duplicate-ready rejection, full participant separation of duties, separate sign-off/readiness audit records, and append-only readiness supersession. API routes use session-derived actors, trusted-write checks, and Zod payload validation.

## Data and persistence

Committed tables (Layer A dependencies, `src/persistence/module-schema.ts`, all `REMOTE_VERIFIED`): `submissions` (L113), `moderationQueue` (L123), `drafts` (L131), `translationHandoffs` (L143), `signOffRecords` (L152), `publishCommits` (L159).
Migration `0011` commits publication scope and authorship, exact draft-bound
moderation, assignment/decision timestamps, persisted translation content,
sign-off/finalization provenance, locale uniqueness, and append-only readiness
supersession. It is applied in Production as part of the verified 14-migration,
55-table chain.

## Authorization and trust boundaries

Capability-tuple pattern (`domain:"civic"`, `capability:"publishing.role.<role>"`, `minimumAssurance:"mfa"`), using shared `src/auth/authorize.ts` with Publishing's opt-in `requireExactTarget: true` (see `MODULES/identity-auth.md`). Enforced separation of duties: a submission author cannot be assigned to or decide review; there is no self-assignment to review/translation; and a Publisher cannot sign off if they were the submission submitter, draft author, reviewer assigner, reviewer, translation assigner, or translator. The `publisher` role cannot be granted or revoked through the ordinary delegation path (founder-only, per `assertEditorialDelegation`).

## Public interfaces

`POST /api/publishing/workflow` (seven discriminated actions; reviewer
assignment and moderation decisions require `draftId`, and final translation
requires `content`). `POST`/`DELETE /api/publishing/grants`. These protected
routes are committed and deployed; anonymous requests fail closed.

## Verification

- **Verified 2026-07-24:** final focused Publishing/Auth/Persistence set passed, 8 files / 32 tests.
- **Verified 2026-07-24:** full suite passed with constrained concurrency, 34 files / 156 tests.
- Structure, lint, typecheck, `db:check`, `db:check:fresh`, production build, and `git diff --check` passed.
- Integration coverage proves audit failure rolls back both sign-off and readiness atomically. Static inspection confirms no filesystem, Git, deployment, or auto-publish action exists at the ready boundary; `commitHash` remains `null`.

## Decisions and rejected approaches

ADR-036's full “Alternatives Considered” section was read on 2026-07-24. It rejects a single-role workflow, automatic authority from identity-provider groups, automatic Git commits by Publishers, and AI approval of low-risk content. The implementation continues to stop at `ready` with `commitHash: null`.

## Current status

- Layer A and Layer B: **COMMITTED, PRODUCTION_DEPLOYED**. The backend baseline
  is `09c160b`; bounded workspace and shared rate-limit protections are also
  committed and deployed in Production commit `fc09d8d`.

## Open work

No backend implementation work remains. Authenticated operation still requires
the owner-side Auth0 callback correction, MFA/staff appointments, and relevant
operational approvals. Public collection publication requires confirmed
provenance and owner approval; see `OPEN_WORK.md` OPEN-010/011.

## Do not redo

Do not re-implement the publishing domain logic or authority/persistence/API
services. Both layers exist, are committed, and preserve the no-auto-publish
boundary.

## Evidence index

- `architecture/adr/ADR-036-civic-editorial-delegation-of-authority.md`
- `src/modules/publishing/README.md` (full read)
- `src/modules/publishing/{intake,moderation,draft-authoring,translation,sign-off,publish,manifest,types}.ts` and `publishing.test.ts`
- `src/modules/publishing/{authority.ts, authority.test.ts}`, `src/application/{publishing.ts, publishing-authority.ts, publishing.integration.test.ts, publishing-authority.integration.test.ts}`, `src/app/api/publishing/`, `src/auth/authorize.ts`
- `drizzle/0011_publishing-authority.sql`, `drizzle/meta/_journal.json`, `src/persistence/module-schema.ts`
- commits `09c160b`, `6f49ce8`, `1dc55e9`; Production baseline `fc09d8d`
