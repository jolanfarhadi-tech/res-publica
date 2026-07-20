# Current State — Live Repository Snapshot

**Verified.** Re-run fresh, this session, 2026-07-20 (repository date context; git commit dates shown below are their own recorded dates, not this verification date). Do not reuse this file's content past its next re-run — re-execute the commands below before trusting it on a later date.

---

## Current branch

**Verified.** `integration/publishing-reconciliation` (`git branch --show-current`).

## Latest commit

**Verified.** `5212636` — "docs: accept civic editorial authority model" — 2026-07-19 (`git log -1 --format='%h|%ad|%s' --date=short` → `5212636|2026-07-19|docs: accept civic editorial authority model`). Full hash: `521263657d04aeeee4da7c2aa8b7241a19002d41`.

This is also the tip of local `main`. `origin/main` is one commit behind, at `7025e6f` ("docs: synchronize ADR decision index") — `git log origin/main..main` → `5212636` only; `git log main..origin/main` → empty.

## Current git status

**Verified**, `git status --short`, run this session:

```
 M drizzle/meta/_journal.json
 M src/persistence/module-schema.ts
?? docs/AI/
?? docs/source/communication/
?? drizzle/0011_publishing-authority.sql
?? src/app/api/publishing/
?? src/application/publishing-authority.ts
?? src/application/publishing.integration.test.ts
?? src/application/publishing.ts
?? src/modules/publishing/authority.test.ts
?? src/modules/publishing/authority.ts
?? tatus
```

Staged: none. Unstaged (modified, tracked): `drizzle/meta/_journal.json`, `src/persistence/module-schema.ts`. Untracked: `docs/AI/` (this directory), `docs/source/communication/`, `drizzle/0011_publishing-authority.sql`, `src/app/api/publishing/`, `src/application/publishing-authority.ts`, `src/application/publishing.integration.test.ts`, `src/application/publishing.ts`, `src/modules/publishing/authority.test.ts`, `src/modules/publishing/authority.ts`, `tatus`.

**Verified — no change from the immediately preceding verification** of this same state (checked twice this session, identical output both times).

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

- **Publishing — authority/persistence/API layer**: `src/modules/publishing/authority.ts`, `src/application/publishing.ts`, `src/application/publishing-authority.ts`, `src/app/api/publishing/{grants,workflow}/`. **Entirely uncommitted** — not on any commit, local or remote. Tests exist (`authority.test.ts`, `publishing.integration.test.ts`, `route.test.ts`) but have not been run against this tree.
- **AI Layer — external provider**: not started (module's own README, direct quote: "Real external provider... not started").
- **Member Profile**: multiple TODO items unchecked in `docs/source/projects/MEMBER_PROFILE.md`'s own checklist (see `docs/AI/OPEN_WORK.md` OPEN-004).
- **Knowledge Graph HTTP routes** (`/api/knowledge-graph/{lookup,related,search}`): declared in the module's manifest, not found under `src/app/api/` in this session's listing — status genuinely undetermined (may be in-process-only, may be unbuilt).

## Pending migrations

**Verified.** `drizzle/0011_publishing-authority.sql` — untracked, not applied to any tracked migration history, matching `drizzle/meta/_journal.json` entry present only as an unstaged change. `npm run db:check` / `npm run db:check:fresh` have not been run against it by any session that produced this document.

## Pending tests

**Verified — not run this session or (as far as this session can determine) any prior session that produced current `docs/AI/` content.** The following test files exist on disk with unknown pass/fail status: every test file listed in the "Implemented modules" table above, plus `src/modules/publishing/authority.test.ts`, `src/application/publishing.integration.test.ts`, `src/app/api/publishing/workflow/route.test.ts` (all three uncommitted). `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` have not been executed.

## Known problems

**Verified:**
1. Publishing-authority work is uncommitted and at risk of loss from a destructive git operation (see `docs/AI/WARNINGS_AND_DEBT.md` WARN-001).
2. `src/modules/membership/README.md` contains a stale claim that ADR-027 "remains unresolved" — ADR-027 is Accepted and `src/auth/` has committed source (WARN-004).
3. `docs/source/communication/{brand-identity,pitch-arsenal}.md` are untracked with unconfirmed purpose (WARN-008).
4. Five `worktree-agent-*` branches are stale (zero unique commits, verified) — harmless but unswept.
5. An untracked stray file `tatus` exists at repo root — confirmed harmless (colorized `git log` output), left in place.

## Next recommended development step

**Not speculation — directly derived from the evidence above, per this document's own scope rule (report evidenced next steps, not aspirational ones):** run `npm test`, `npm run typecheck`, `npm run db:check`, and `npm run db:check:fresh` against the current working tree to determine whether the uncommitted publishing-authority implementation (migration `0011` + `src/modules/publishing/authority.ts` + `src/application/publishing*.ts` + `src/app/api/publishing/*`) is ready to commit. This is the single concrete, evidenced, actionable next step available in this repository as of this snapshot. See `docs/AI/OPEN_WORK.md` OPEN-001 for the full item record.
