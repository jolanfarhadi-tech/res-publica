# Module: Publishing

## Purpose

The back-stage editorial pipeline: intake → moderation → AI-assisted draft authoring → translation handoff → human sign-off → publish, kept strictly separate from the public site so AI assistance never bypasses a named human's approval. Evidence: `src/modules/publishing/README.md` (read in full, this session).

## Canonical authority

- `architecture/adr/ADR-036-civic-editorial-delegation-of-authority.md` — scoped Civic editorial roles, session-derived authority, separation of duties, human-only sign-off, no-auto-publish boundary. **Accepted** (doc committed `5212636`).
- `src/modules/publishing/README.md` — the module's own status self-description (read in full).

## Current implementation — split explicitly by commit status (special handling per task instructions)

This module has **two distinct layers with two different git states.** Do not conflate them.

### Layer A — domain logic (REMOTE_VERIFIED, committed)

`src/modules/publishing/{intake.ts, moderation.ts, draft-authoring.ts, translation.ts, sign-off.ts, publish.ts, manifest.ts, types.ts, publishing.test.ts, README.md}`. Committed via `9f9ec5f` and `7ba7fd1` (2026-07-07), both ≤ `origin/main` tip `7025e6f` — **on the remote.** The module's own README (as committed) states its own status verbatim: *"Domain logic, moderation, draft authoring (AI-integrated), translation handoff, sign-off (audit-integrated), and publish-readiness are implemented and tested. No persistence layer, no API routes wired, no CLI `publish-draft` lookup yet (all await Backend Architecture)."*

### Layer B — authority, persistence, and API (UNCOMMITTED_WORKTREE — this session's primary finding)

`src/modules/publishing/{authority.ts, authority.test.ts}`, `src/application/{publishing.ts, publishing-authority.ts, publishing.integration.test.ts}`, `src/app/api/publishing/{grants/route.ts, workflow/{route.ts, route.test.ts}}`, `drizzle/0011_publishing-authority.sql`, plus unstaged changes to `drizzle/meta/_journal.json` and `src/persistence/module-schema.ts`.
**Git status, verified this session:** every one of these paths is `??` (untracked) or ` M` (modified, unstaged) in `git status --short`. **`git log main..HEAD` on the current branch (`integration/publishing-reconciliation`) is empty** — this branch has never committed anything. **This code is not on any commit, local or remote, anywhere in this repository as of this compilation.**

**This is not a patch file and no patch was applied or evaluated by this session** — it is the actual, live, uncommitted working-tree state, read directly from disk (`Read` tool, full contents) and cross-checked against `git status --short` and `git diff` (unstaged) run this session. This compilation did not rely on, and could not find, any "previous browser-session patch report" in the repository — no such report exists as a file here (see `INDEX.md` conversation-history disclosure).

**No duplicate or competing implementation exists.** There is exactly one publishing-authority implementation in this repository; it simply exists only in the working tree, not in history. This is not a case requiring a choice between competing versions.

Content summary (from direct reads this session): `authority.ts` defines `EDITORIAL_ROLES = ["editor","reviewer","translator","publisher"]`, `requireEditorialRole()`, `assertEditorialDelegation()` (forbids self-grant; forbids granting `publisher` except via a founder-only path). `publishing-authority.ts` implements `grantEditorialRole()`/`revokeEditorialRole()`, transactional, writing `authorizationGrants` + `auditLog` together. `publishing.ts` implements the full workflow (`createSubmission` → `assignReviewer` → `decideModeration` → `createDraftVersion` → `createTranslationAssignment` → `finalizeTranslation` → `signOffAndMarkReady`), enforcing separation of duties (author ≠ reviewer ≠ publisher; no self-assignment). API routes (`grants`, `workflow`) use `zod` discriminated unions, reject untrusted writes, and map errors to `403`/`404`/`409`/`503`.

## Data and persistence

Committed tables (Layer A dependencies, `src/persistence/module-schema.ts`, all `REMOTE_VERIFIED`): `submissions` (L113), `moderationQueue` (L123), `drafts` (L131), `translationHandoffs` (L143), `signOffRecords` (L152), `publishCommits` (L159).
**Uncommitted schema changes (Layer B, `UNCOMMITTED_WORKTREE`):** `publicationScope` added to `submissions`; `authoredByPersonId` (FK → `people`) + `createdAt` added to `drafts`; `finalizedAt` added to `translationHandoffs` — exact diff read in full this session. New migration `drizzle/0011_publishing-authority.sql` (untracked) with a matching `drizzle/meta/_journal.json` entry (`idx: 11`, unstaged).
**Not verified this session:** whether `npm run db:check`/`db:check:fresh` pass against this migration. **Do not assume they do.**

## Authorization and trust boundaries

Capability-tuple pattern (`domain:"civic"`, `capability:"publishing.role.<role>"`, `minimumAssurance:"mfa"`), same primitive as `src/auth/authorize.ts` (see `MODULES/identity-auth.md`). Enforced separation-of-duties, directly read in `publishing.ts`: an author cannot review their own submission (`author_review_forbidden`); a publisher cannot sign off if they were the draft's author, its assigned reviewer, or a translation assignee (`publisher_separation_required`); no self-assignment to translation/review; `publisher` role cannot be granted or revoked through the ordinary grant/revoke path (founder-only, per `assertEditorialDelegation`).

## Public interfaces

`POST /api/publishing/workflow` (seven discriminated actions: create-submission, create-draft, assign-reviewer, decide-moderation, assign-translation, finalize-translation, mark-ready). `POST`/`DELETE /api/publishing/grants`. **All of this API surface is UNCOMMITTED_WORKTREE** — it exists on disk, not in git history.

## Verification

- Layer A test: `src/modules/publishing/publishing.test.ts` — REMOTE_VERIFIED (committed), not run this session.
- Layer B tests: `src/modules/publishing/authority.test.ts`, `src/application/publishing.integration.test.ts`, `src/app/api/publishing/workflow/route.test.ts` — **exist on disk, UNCOMMITTED_WORKTREE, not run this session.**
- **This compilation did not run `npm test` and therefore cannot and does not claim these tests pass.** Any prior report (from this session or any other) that these tests "passed" is not independently re-verified here and must not be trusted without re-running them against the exact current working tree — per this task's explicit instruction not to mark publishing complete merely because a previous agent reported passing tests.

## Decisions and rejected approaches

No explicit rejected-alternatives text was found for the publishing-authority design specifically (no ADR "Alternatives Considered" section for ADR-036 was read in full this session — only its title/decision summary via `brain/DECISIONS.md`). The module's own committed README documents one explicit non-goal: *"`publish.ts` marks a draft 'ready to publish' but never writes a file or invokes Git. The actual commit is a separate, explicitly-approved action outside this module's scope."*

## Current status

- Layer A (domain logic): **REMOTE_VERIFIED**, **IMPLEMENTED_NOT_REVERIFIED**.
- Layer B (authority/persistence/API): **UNCOMMITTED_WORKTREE**. Not LOCALLY_COMMITTED, not REMOTE_VERIFIED, not IMPLEMENTED_AND_TESTED (tests exist but unexecuted this session — do not upgrade this status without an actual test run).

## Open work

See `OPEN_WORK.md` OPEN-001 (primary item) and `WARNINGS_AND_DEBT.md` WARN-001/WARN-006 (data-loss and migration-verification risk). Safe next action: run `npm test`, `npm run typecheck`, `npm run db:check`, `npm run db:check:fresh` against the current tree before any commit decision. **This compilation did not run any of these and did not apply, stage, or modify any publishing code or patch.**

## Do not redo

Do not re-implement the publishing domain logic (intake/moderation/draft-authoring/translation/sign-off/publish) — Layer A already exists, is committed, and is tested. Do not re-implement the authority/persistence/API layer either — Layer B already exists in the working tree; the open task is verification and a commit decision, not a rewrite.

## Evidence index

- `architecture/adr/ADR-036-civic-editorial-delegation-of-authority.md`
- `src/modules/publishing/README.md` (full read)
- `src/modules/publishing/{intake,moderation,draft-authoring,translation,sign-off,publish,manifest,types}.ts` (Layer A, committed `9f9ec5f`/`7ba7fd1`)
- `src/modules/publishing/{authority.ts, authority.test.ts}`, `src/application/{publishing.ts, publishing-authority.ts, publishing.integration.test.ts}`, `src/app/api/publishing/{grants,workflow}/route.ts` (Layer B, all read in full this session, all uncommitted)
- `drizzle/0011_publishing-authority.sql`, `drizzle/meta/_journal.json` diff, `src/persistence/module-schema.ts` diff (all read in full this session)
- command: `git status --short` → full output reproduced in `CURRENT_STATE.md`
- command: `git log main..HEAD` (on `integration/publishing-reconciliation`) → empty
