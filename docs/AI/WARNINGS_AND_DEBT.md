# Warnings and Debt — Verified Risk Register

*Only verified risks with evidence. Being "incomplete" alone is not listed here unless it carries a specific, evidenced risk — see `OPEN_WORK.md` for incompleteness that is simply unfinished work.*

---

### WARN-001 — Publishing-authority implementation exists only in the uncommitted working tree
- **Evidence:** `git status --short` re-verified 2026-07-24: Publishing authority/application/API/tests and migration remain untracked; schema/journal/type changes remain unstaged. The branch has one docs-only commit beyond `main`; no commit contains the Publishing implementation.
- **Impact:** production-readiness-verified implementation work (domain logic, persistence, authority enforcement, API routes, tests) could be silently lost — e.g., by a `git checkout`/`git clean`/branch switch performed without awareness of this state.
- **Severity:** **High** (data-loss risk for real engineering work), not urgent (no external system depends on it yet).
- **Safe handling:** do not run any destructive git operation (`checkout --`, `clean -f`, `reset --hard`, branch switch away from `integration/publishing-reconciliation`) without first confirming this work has been committed or is intentionally being discarded.
- **Resolution condition:** the locally verified work is committed after explicit human approval, or deliberately discarded by the repository owner.

### WARN-002 — Five stale worktree-agent branches
- **Evidence:** `git branch -a` lists `worktree-agent-{a41b2f98bb4889568,ac265ef0dcfbd1d11,aca5f3876aea4f4e9,adee0af9fffa74fc8,afb36aeffa2f75bec}`, all physically backed by `.claude/worktrees/agent-*/` directories (`git worktree list`, prior session). **Directly verified this session:** all five are at commit `af64931` with zero commits ahead of `main` (`git log main..<branch>` empty for each).
- **Impact:** low — these are inert, contain no unique work, and do not affect build/CI. Mild repository clutter only.
- **Severity:** **Low**.
- **Safe handling:** do not delete without the repository owner's explicit instruction — this documentation task is read-only and does not authorize branch/worktree deletion.
- **Resolution condition:** repository owner runs `git worktree remove` and `git branch -D` for each, at their discretion, outside any documentation task.

### WARN-003 — The `tatus` file (root-level, untracked)
- **Evidence (read-only inspection, this session and the prior one):** `tatus`, 6491 bytes, sits at the repository root, untracked (`git status --short` shows `?? tatus`). Its content (first ~40 lines read) is plain-text, ANSI-color-coded `git log` output — specifically `git log --oneline --decorate` style output showing commits from `3b5fbe9` ("Snapshot Bevor Codex changes") backward, i.e., a snapshot of `main`'s history from before the 2026-07-19 module sprint completed. **No Git history or terminal evidence in this repository directly explains how this file was created** — it is not the output of any tracked script or commit; its content is consistent with a shell redirection mistake (e.g., a `git log` command whose intended output filename was truncated), but this is an inference, not a confirmed fact.
- **Impact:** none to build, tests, or application behavior — it is not imported, referenced, or read by any code or script found this session. Purely a stray artifact.
- **Severity:** **Low / informational**.
- **Safe handling:** **do not delete, rename, truncate, or `git add` it.** Leave it exactly as found.
- **Resolution condition:** repository owner confirms its origin and decides whether to remove it — outside the scope of any documentation-only task.

### WARN-004 — Stale documentation: `src/modules/membership/README.md` contradicts current auth state
- **Evidence:** `src/modules/membership/README.md` (read in full, this session) states: *"This module does not define, implement, or own Authentication; `ADR-027` remains unresolved."* This was true as of the commit that introduced it (`9f9ec5f`, 2026-07-07). **Directly verified this session:** ADR-027 (`architecture/adr/ADR-027-identity-authentication-authorization.md`) now states `## Status` → "Accepted — explicitly approved by the Founder on 2026-07-19," and `src/auth/` contains committed, tested-in-principle source for OIDC, sessions, and authorization (commits `a9fac9c`, `e31ca3c`, `770857e`, all 2026-07-19; tests exist but were not run this session — see `MODULES/identity-auth.md`).
- **Impact:** a future agent reading only this module's README could incorrectly conclude authentication is unimplemented repository-wide, when it is in fact implemented and used elsewhere (including by the uncommitted publishing-authority code, WARN-001).
- **Severity:** **Medium** — documentation drift that could mislead an agent into redundant or contradictory work.
- **Safe handling:** when working on membership/auth integration, trust `src/auth/` and ADR-027's current status over this specific README line; do not treat the README's auth claim as current.
- **Resolution condition:** the README is updated to reflect that `ADR-027` is accepted and `src/auth/` exists — an application-code-adjacent doc change, out of scope for this documentation-only task.

### WARN-005 — `main` has one commit not yet pushed to `origin/main`
- **Evidence:** `git log origin/main..main` → `5212636` only (this session); `git log main..origin/main` → empty.
- **Impact:** low in isolation, but combined with WARN-001 (uncommitted work on a separate branch), means this repository currently has real work at two different "not yet on remote" levels — one commit ahead locally, and a full feature entirely uncommitted. A force-push, remote reset, or fresh clone from `origin` would not include `5212636` or the publishing-authority work.
- **Severity:** **Medium**.
- **Safe handling:** be aware that `origin/main` is not the full picture of local progress before assuming a fresh clone/checkout reflects everything described in this documentation set.
- **Resolution condition:** repository owner pushes `main`, at their discretion — outside this task's scope (this task must not push).

### WARN-006 — Resolved 2026-07-24: migration `0011` verified against a fresh database
- **Evidence:** `npm run db:check` passed. `npm run db:check:fresh` applied 12 journaled migrations and created 53 tables.
- **Remaining handling:** migration `0011` is still uncommitted and remains covered by WARN-001, but migration validity is no longer an unknown local risk.
- **Resolution condition:** satisfied for local verification; CI will independently re-run both checks after a future approved push/PR.

### WARN-007 — ADR-031 implementation is accepted but not confirmed
- **Evidence:** ADR-031 (project ownership/cross-domain collaboration) remains unverified — see `OPEN_WORK.md` OPEN-007 and `ARCHITECTURE_MEMORY.md`. ADR-029 is no longer part of this warning: its explicit M1 decision is canonical append-only audit with no event bus.
- **Impact:** if a future task assumes ADR-031 is fully implemented because the ADR says “Accepted,” it risks building on a boundary that may not exist in code yet.
- **Severity:** **Medium** — a documentation-verification gap, not a confirmed code defect.
- **Safe handling:** do not treat “ADR accepted” as “code implemented” for ADR-031 without a targeted search first (see `ARCHITECTURE_MEMORY.md`'s explicit ACCEPTED-vs-IMPLEMENTED distinction throughout).
- **Resolution condition:** a targeted code search either confirms an implementation (update `ARCHITECTURE_MEMORY.md`) or confirms the gap is real (move to `OPEN_WORK.md` as an active item).

### WARN-008 — Resolved: `docs/source/communication/` committed separately
- **Evidence:** commit `890f97f` includes both communication documents. They are no longer untracked and are outside the Publishing Authority commit boundary.
- **Resolution condition:** satisfied; no Publishing action required.

### WARN-009 — Two Foundation-era documentation artifacts have no surviving original text
- **Evidence:** `brain/PROJECT_BRAIN_STATUS.md` §3 — the Engineering/Security Audit report and the 9-stage Experience Blueprint originals do not exist anywhere in this repository, only compressed summaries.
- **Impact:** any future work citing "the audit" or "the experience blueprint" for exact detail cannot do so — only the summary-level facts in `brain/CHANGELOG.md`/`FOUNDATION_REVIEW_FINAL.md` are available.
- **Severity:** **Low** — a permanent, already-accepted documentation gap, not a live blocker for any currently-active engineering task.
- **Safe handling:** cite only the surviving summaries; do not present a regenerated version as the original (see `OPEN_WORK.md` OPEN-002).
- **Resolution condition:** either the original text is located, or stakeholders formally accept the summary as the permanent record (both outside this task's scope).

### WARN-010 — Environment-dependent behavior: local dev database differs from production
- **Evidence:** `@electric-sql/pglite` (in-memory/embedded Postgres) for local dev vs. `pg` (real Postgres) in production, per ADR-010 and `package.json` dependencies.
- **Impact:** standard, accepted risk class for offline-first architectures — behavior differences between `pglite` and a real Postgres instance (extensions, exact query planner behavior) are possible in principle. No specific incident evidencing an actual divergence was found this session.
- **Severity:** **Low** (architectural pattern is deliberate and documented, not an oversight) — flagged for awareness, not as a defect.
- **Safe handling:** do not assume local-dev test passes guarantee identical production-database behavior for anything exercising Postgres-specific features.
- **Resolution condition:** none required — this is accepted, documented architecture (ADR-010), not unresolved debt.

---

## Not included here (evidence insufficient to call these verified risks)

- **GitHub integration / permissions blockers** — no evidence found either way this session; not listed as a risk without evidence.
- **Deprecated terminology still in active use** — the only confirmed terminology retirement (`Validation Framework` → retired, per commit `83cde16`) appears fully applied per that commit's own message ("synchronize repository architecture"); no residual usage was found this session, so this is not listed as an active risk. If a future search finds lingering references, add them here with citations.
