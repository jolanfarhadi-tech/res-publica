# Current State — Live Repository Snapshot

**Verified.** Re-run fresh, this session, 2026-07-24 (repository date context; git commit dates shown below are their own recorded dates, not this verification date). Do not reuse this file's content past its next re-run — re-execute the commands below before trusting it on a later date.

---

## Current branch

**Verified.** `integration/publishing-reconciliation` (`git branch --show-current`).

## Latest commit

**Verified.** `890f97f` — "docs: add permanent AI repository memory system". This branch is one commit ahead of local `main` (`5212636`) and two commits ahead of `origin/main` (`7025e6f`).

Local `main` remains one commit ahead of `origin/main`: `5212636` only.

## Current git status

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
| Publishing (domain logic layer only) | `src/modules/publishing/{intake,moderation,draft-authoring,translation,sign-off,publish}.ts` | `publishing.test.ts` |
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

- **Publishing — authority/persistence/API layer**: production-readiness defects found in the uncommitted implementation were fixed and locally verified. ADR-036 reconciliation now binds moderation to the exact latest draft, records assignment/decision actors and timestamps, rejects stale/unreviewed drafts and incomplete legacy provenance, enforces exact publication scope plus the full separation-of-duties set, requires nonblank human translation content, emits separate atomic sign-off/readiness audit records, rejects duplicate readiness, and append-only supersedes prior readiness when a new draft is created. The work remains entirely uncommitted.
- **AI Layer — external provider**: not started (module's own README, direct quote: "Real external provider... not started").
- **Member Profile**: multiple TODO items unchecked in `docs/source/projects/MEMBER_PROFILE.md`'s own checklist (see `docs/AI/OPEN_WORK.md` OPEN-004).
- **Knowledge Graph HTTP routes** (`/api/knowledge-graph/{lookup,related,search}`): declared in the module's manifest, not found under `src/app/api/` in this session's listing — status genuinely undetermined (may be in-process-only, may be unbuilt).

## Pending migrations

**Verified.** `drizzle/0011_publishing-authority.sql` remains untracked with a matching unstaged journal entry. On 2026-07-24, `npm run db:check` passed and `npm run db:check:fresh` applied all 12 journaled migrations and created 53 tables.

## Pending tests

**Verified 2026-07-24.** Final focused Publishing/Auth/Persistence verification passed: 8 files, 32 tests. The complete deterministic suite `npm test -- --maxWorkers=1` passed all 34 files / 156 tests. `check-structure`, lint, typecheck, `db:check`, `db:check:fresh` (12 migrations / 53 tables), production build with `NEXT_PUBLIC_SITE_URL=https://example.org`, and `git diff --check` all passed. The build required approved network access for Google Fonts.

## Known problems

**Verified:**
1. Publishing-authority work is verified but uncommitted and remains at risk of loss from a destructive git operation (see `docs/AI/WARNINGS_AND_DEBT.md` WARN-001).
2. `src/modules/membership/README.md` contains a stale claim that ADR-027 "remains unresolved" — ADR-027 is Accepted and `src/auth/` has committed source (WARN-004).
3. `tsconfig.json` has an unrelated final-newline-only working-tree change; exclude it from the Publishing commit boundary.
4. Five `worktree-agent-*` branches are stale (zero unique commits, verified) — harmless but unswept.
5. An untracked stray file `tatus` exists at repo root — left untouched and excluded.

## Next recommended development step

**Verified next step:** review the explicit Publishing-only commit boundary documented in `OPEN_WORK.md` OPEN-001, excluding `tsconfig.json` and `tatus`, then obtain the required human approval before staging or committing. No stage, commit, or push has been performed.
