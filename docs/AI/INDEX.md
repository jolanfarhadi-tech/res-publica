# docs/AI/ — Navigation Index

*Compact map of this directory. This file navigates; it does not restate content owned elsewhere. If something here conflicts with an ADR, a `docs/source/` document, or the current code, the ADR/`docs/source`/code wins — see the Evidence hierarchy below.*

**Conversation-history disclosure (applies to every file in this directory):** Previous agent conversation transcripts are not available in this workspace. This memory is reconstructed only from current repository evidence, Git history, accessible session context, and existing files.

---

## Evidence hierarchy (highest wins)

1. Current repository code
2. Current Git state and Git history
3. Automated tests and CI configuration
4. Accepted ADRs (`architecture/adr/`)
5. Canonical `docs/source/` documents
6. `brain/` documents (historical rationale only — superseded as canonical, see `docs/source/DECISION_LOG.md` item 6)
7. Existing `docs/AI/` memory documents (this directory)
8. Conversation claims (lowest — do not trust an unsourced claim from any chat history over any of the above)

**No document in this directory outranks a higher source.** Every file below is a memory aid, not an authority. Verify against code/Git/tests/ADRs before acting on anything read here.

---

## What each file contains

| File | Type | Contains | Do not use it for |
|---|---|---|---|
| `INDEX.md` (this file) | Navigation | Where to look, reading order | Any factual claim about the repo itself |
| `REPOSITORY_MEMORY.md` | **Snapshot**, point-in-time (2026-07-19) | The original, comprehensive evidence compilation — architecture, decisions, full ADR index, milestone history, module inventory, gaps | Current git/branch/worktree state (may be stale by the time you read it — see `CURRENT_STATE.md` instead) |
| `CLAUDE_SESSION_HANDOFF.md` | **Snapshot**, point-in-time | Handoff notes from one specific earlier session turn (documents that no substantive task preceded it in that turn) | General repository knowledge — it is narrow and session-specific, not a repository overview |
| `ARCHITECTURE_MEMORY.md` | **Cross-cutting summary**, current-as-of-compilation | Constitutional/domain/authority/identity/audit/knowledge-graph/AI-runtime/persistence/EAO architecture, with explicit ACCEPTED / IMPLEMENTED / PARTIALLY IMPLEMENTED / PROPOSED / SUPERSEDED / RESERVED / UNVERIFIED status per claim | Module-specific implementation detail — see `MODULES/*.md` |
| `IMPLEMENTATION_MEMORY.md` | **Cross-cutting summary**, current-as-of-compilation | Stack, conventions, route organization, layering, CI/tooling — the "how the code is shaped" view | Architectural rationale (see `ARCHITECTURE_MEMORY.md`) or module-specific detail (see `MODULES/*.md`) |
| `PROJECT_TIMELINE.md` | **Historical**, chronological | Evidence-based commit-by-commit evolution, with facts vs. interpretation separated | Current state — a commit landing does not mean it is still true today; cross-check `CURRENT_STATE.md` |
| `CURRENT_STATE.md` | **Live operational status** | Freshly-run git state, per-module status labels, always re-verified, never copied from an older document | Historical rationale (see `PROJECT_TIMELINE.md`, `ARCHITECTURE_MEMORY.md`) |
| `OPEN_WORK.md` | **Unfinished-work register** | Only explicitly evidenced unfinished items, each with evidence/prerequisite/blocker/next-action | Aspirational roadmap ideas or reserved ADRs treated as active tasks — those are marked separately within this file, not conflated with active work |
| `WARNINGS_AND_DEBT.md` | **Risk register** | Verified risks only, each with evidence/impact/severity/handling instruction | Anything merely "incomplete" without a specific, evidenced risk |
| `MODULES/*.md` | **Module-specific operational memory** | Per-module purpose, canonical authority, implementation paths, data model, auth boundaries, interfaces, tests, decisions, status, open work | Cross-cutting architecture (put that in `ARCHITECTURE_MEMORY.md` instead, link from here) |

## Which documents are snapshots vs. live vs. historical

- **Point-in-time snapshots** (do not assume still accurate; re-verify): `REPOSITORY_MEMORY.md`, `CLAUDE_SESSION_HANDOFF.md`, `ARCHITECTURE_MEMORY.md`, `IMPLEMENTATION_MEMORY.md`, `MODULES/*.md`.
- **Live, meant to be re-run and re-verified before trusting**: `CURRENT_STATE.md` — it documents the exact commands used to produce it; re-run them.
- **Historical, chronological, not meant to change**: `PROJECT_TIMELINE.md`.
- **Living registers, update as facts change**: `OPEN_WORK.md`, `WARNINGS_AND_DEBT.md`.

## Canonical sources that must be consulted before implementation (never substitute this directory for these)

- `architecture/adr/` — the actual Architecture Decision Records.
- `docs/source/` — the canonical documentation tree (`docs/source/DECISION_LOG.md` item 6: canonical over `brain/`).
- `brain/` — historical rationale only, where `docs/source/` doesn't yet cover a topic.
- The actual source code under `src/`, `drizzle/`, `scripts/`.
- Actual test results (`npm test`) and actual CI runs (`.github/workflows/ci.yml`) — no file in `docs/AI/` has run these; it reports which tests *exist*, not that they *pass*, unless explicitly stated with an evidence citation for a specific run.

## Required reading path

**Always, for any task:**
1. `INDEX.md` (this file).
2. `CURRENT_STATE.md` — fresh git/branch/worktree state and per-module status.

**Then, task-sensitive:**
3. The relevant file(s) under `MODULES/` for the specific module(s) the task touches. If the task is cross-cutting (touches architecture broadly, not one module), read `ARCHITECTURE_MEMORY.md` and/or `IMPLEMENTATION_MEMORY.md` instead.
4. If the task involves unfinished work, also read `OPEN_WORK.md`; if it involves risk assessment or cleanup, also read `WARNINGS_AND_DEBT.md`.

**Then, always — this directory is never sufficient on its own:**
5. Inspect the actual code, tests, ADRs, and canonical `docs/source`/`brain` documents the module file points to. **Do not trust any memory file in this directory without verifying against the repository itself** — every file here can go stale the moment the next commit lands, and several were compiled without running tests or builds.

## Module coverage

`MODULES/` contains one file per module for which this compilation found direct code/test/doc evidence: `identity-auth`, `member-profile`, `harm-governance`, `publishing`, `events`, `membership`, `knowledge-graph`, `ai-runtime`, `persistence`, `frontend-i18n`, `eao`, `dashboard`, `notifications`, `academy`, and `fellowship`. The repository also contains implemented modules with their own tests that are **not** covered by a `MODULES/` file in this pass — `community`, `crm`, `analytics` (all confirmed to exist at `src/modules/{community,crm,analytics}/` with manifests, source files, and `*.test.ts` files) — because they were outside the module list this restructuring pass was scoped to, not because evidence is missing. A future pass should add module files for these if they become a task focus.
