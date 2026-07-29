# Module: Publishing

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

### Layer A — domain logic (committed baseline with scoped uncommitted fixes)

`src/modules/publishing/{intake.ts, moderation.ts, draft-authoring.ts, sign-off.ts, publish.ts, manifest.ts, README.md}` remains committed via `9f9ec5f` and `7ba7fd1` (2026-07-07), both ≤ `origin/main` tip `7025e6f`. `translation.ts`, `types.ts`, and `publishing.test.ts` now also contain scoped uncommitted ADR-036 fixes: human-first translation is valid, final translation requires nonblank human content, and the types preserve that content. The module README describes only the older committed Layer-A baseline and is not final evidence for the current working tree.

### Layer B — authority, persistence, and API (UNCOMMITTED_WORKTREE — this session's primary finding)

`src/modules/publishing/{authority.ts, authority.test.ts}`, `src/application/{publishing.ts, publishing-authority.ts, publishing.integration.test.ts, publishing-authority.integration.test.ts}`, `src/app/api/publishing/{grants/route.ts, workflow/{route.ts, route.test.ts}}`, `src/auth/authorize.ts`, `drizzle/0011_publishing-authority.sql`, plus unstaged changes to `drizzle/meta/_journal.json` and `src/persistence/module-schema.ts`.
**Git status, verified this session:** every implementation path above is `??` (untracked) or ` M` (modified, unstaged). The current branch (`integration/publishing-reconciliation`) has one docs-only commit (`890f97f`) beyond `main`; no commit contains the Publishing Authority implementation.

**This is not a patch file and no patch was applied or evaluated by this session** — it is the actual, live, uncommitted working-tree state, read directly from disk (`Read` tool, full contents) and cross-checked against `git status --short` and `git diff` (unstaged) run this session. This compilation did not rely on, and could not find, any "previous browser-session patch report" in the repository — no such report exists as a file here (see `INDEX.md` conversation-history disclosure).

**No duplicate or competing implementation exists.** There is exactly one publishing-authority implementation in this repository; it simply exists only in the working tree, not in history. This is not a case requiring a choice between competing versions.

Content summary (re-verified 2026-07-24): `authority.ts` defines the four editorial roles and scoped MFA enforcement. Shared authorization now supports an opt-in exact-target requirement, which Publishing uses so a null-target grant cannot act as a wildcard publication scope. `publishing-authority.ts` implements transactional, audited grants/revocations with grant date validation and row-locked revocation. `publishing.ts` uses shared repositories for atomic canonical audit writes and enforces the complete persistent workflow: exact latest-draft review, controlled missing-person errors, assignment/decision provenance, no review before a reviewer assignment, no translation before approval, nonblank human translation content, duplicate-locale and duplicate-ready rejection, full participant separation of duties, separate sign-off/readiness audit records, and append-only readiness supersession. API routes use session-derived actors, trusted-write checks, and Zod payload validation.

## Data and persistence

Committed tables (Layer A dependencies, `src/persistence/module-schema.ts`, all `REMOTE_VERIFIED`): `submissions` (L113), `moderationQueue` (L123), `drafts` (L131), `translationHandoffs` (L143), `signOffRecords` (L152), `publishCommits` (L159).
**Uncommitted schema changes (Layer B, `UNCOMMITTED_WORKTREE`):** publication scope and authorship, exact draft-bound moderation, reviewer/translator assignment actors and timestamps, decision timestamps, persisted translation content, sign-off/finalization provenance, a unique translation-locale constraint, and append-only readiness supersession. Migration `0011` does not invent provenance for legacy rows: unknown authorship, assignment times, review targets, and translation content remain nullable, while current writes always populate them and sign-off rejects incomplete legacy provenance. The migration has a matching journal entry. **Verified 2026-07-24:** `db:check` passed; `db:check:fresh` applied 12 migrations and created 53 tables.

## Authorization and trust boundaries

Capability-tuple pattern (`domain:"civic"`, `capability:"publishing.role.<role>"`, `minimumAssurance:"mfa"`), using shared `src/auth/authorize.ts` with Publishing's opt-in `requireExactTarget: true` (see `MODULES/identity-auth.md`). Enforced separation of duties: a submission author cannot be assigned to or decide review; there is no self-assignment to review/translation; and a Publisher cannot sign off if they were the submission submitter, draft author, reviewer assigner, reviewer, translation assigner, or translator. The `publisher` role cannot be granted or revoked through the ordinary delegation path (founder-only, per `assertEditorialDelegation`).

## Public interfaces

`POST /api/publishing/workflow` (seven discriminated actions; reviewer assignment and moderation decisions require `draftId`, and final translation requires `content`). `POST`/`DELETE /api/publishing/grants`. **All of this API surface remains UNCOMMITTED_WORKTREE.**

## Verification

- **Verified 2026-07-24:** final focused Publishing/Auth/Persistence set passed, 8 files / 32 tests.
- **Verified 2026-07-24:** full suite passed with constrained concurrency, 34 files / 156 tests.
- Structure, lint, typecheck, `db:check`, `db:check:fresh`, production build, and `git diff --check` passed.
- Integration coverage proves audit failure rolls back both sign-off and readiness atomically. Static inspection confirms no filesystem, Git, deployment, or auto-publish action exists at the ready boundary; `commitHash` remains `null`.

## Decisions and rejected approaches

ADR-036's full “Alternatives Considered” section was read on 2026-07-24. It rejects a single-role workflow, automatic authority from identity-provider groups, automatic Git commits by Publishers, and AI approval of low-risk content. The implementation continues to stop at `ready` with `commitHash: null`.

## Current status

- Layer A and Layer B: **LOCALLY_COMMITTED, LOCALLY_VERIFIED 2026-07-24** at
  `09c160b`. The branch containing this baseline and frontend commit `afa2207`
  is pushed to `origin/integration/publishing-reconciliation`.

## Open work

No backend implementation work remains in this frontend phase. Public
collection publication still requires confirmed provenance and owner approval;
see `OPEN_WORK.md` OPEN-010.

## Do not redo

Do not re-implement the publishing domain logic or authority/persistence/API services. Both layers exist and are verified in the current working tree; the remaining action is a commit decision, not a rewrite.

## Evidence index

- `architecture/adr/ADR-036-civic-editorial-delegation-of-authority.md`
- `src/modules/publishing/README.md` (full read)
- `src/modules/publishing/{intake,moderation,draft-authoring,translation,sign-off,publish,manifest,types}.ts` and `publishing.test.ts` (committed baseline with scoped uncommitted translation/type/test fixes)
- `src/modules/publishing/{authority.ts, authority.test.ts}`, `src/application/{publishing.ts, publishing-authority.ts, publishing.integration.test.ts, publishing-authority.integration.test.ts}`, `src/app/api/publishing/{grants,workflow}/route.ts`, `src/auth/authorize.ts` (Layer B and shared exact-target support, all uncommitted)
- `drizzle/0011_publishing-authority.sql`, `drizzle/meta/_journal.json` diff, `src/persistence/module-schema.ts` diff (all read in full this session)
- command: `git status --short` → full output reproduced in `CURRENT_STATE.md`
- command: `git log main..HEAD` (on `integration/publishing-reconciliation`) → `890f97f` (docs-only; no Publishing implementation)
