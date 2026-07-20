# Module: Executive AI Office (EAO)

## Purpose

Repository-wide, read-only coordination/reporting tooling — health checks, documentation-intelligence pipelines, and a governance-registered "Chief Systems Officer" agent role that advises but never modifies files, commits, or approves architecture. Evidence: `architecture/adr/ADR-024-executive-ai-office.md`; this session's own system context, which describes the `program-orchestrator` agent as "Read Only + Suggest Only — never modifies files, never commits, never approves architecture."

## Canonical authority

- `architecture/adr/ADR-024-executive-ai-office.md` — establishes the EAO and its phased activation model. Accepted.
- `architecture/adr/ADR-025-eao-generation-2-constitutional-architecture-adoption.md` — adopts EAO Generation 2. Accepted.
- `brain/AI/EAO_*.md` (26 files, per prior session's directory listing) — detailed EAO architecture/governance/runtime specs, not individually read this session.

## Current implementation

`scripts/eao/{repository-health.mjs, broken-links.mjs, terminology-drift.mjs, dependency-map.mjs, project-health.mjs, project-health.test.mjs, roadmap.mjs, risk-analysis.mjs, adr-review.mjs, release-readiness.mjs, lib/{git.mjs, graph.mjs, markdown.mjs, registry.mjs}}` (directory listing this session). Wired to `package.json` scripts: `eao:repo-health`, `eao:broken-links`, `eao:terminology-drift`, `eao:dependency-map`, `eao:project-health`, `eao:roadmap`, `eao:risk-analysis`, `eao:adr-review`, `eao:release-readiness` (all confirmed in `package.json`, read in full this session).
Agent identity: `.claude/agents/program-orchestrator.md`, `.codex/agents/program-orchestrator.toml` — both confirmed to exist (directory listing, this session); **contents not read in full this session** — the "Read Only + Suggest Only" characterization comes from this session's own system-provided agent-roster context, not from reading the files directly.
Committed via `d8322a4` (EAO Documentation Intelligence pipelines), `42c8144` (Dependency Analysis Pipeline), `88f511a`→`51e98e0` (project-health, roadmap, risk-analysis, ADR-review, release-readiness pipelines), tag `eao-bootstrap-v1` at `e0b54c9` — all ≤ `origin/main` tip `7025e6f`.

## Data and persistence

None identified — these are analysis scripts operating on the repository's own files (git history, markdown docs, dependency graphs) at run time, not database-backed. Not exhaustively confirmed (script internals not read this session).

## Authorization and trust boundaries

Per this session's own system context (not independently verified against the agent definition files this session): the `program-orchestrator` agent has tool access limited to `Read, Grep, Bash, Glob` — no `Write`/`Edit` — consistent with "Read Only + Suggest Only."

## Public interfaces

CLI-invoked via `npm run eao:*` scripts, not HTTP routes.

## Verification

Test confirmed to exist: `scripts/eao/project-health.test.mjs`. **Not run this session.** No test files were found for the other eight `scripts/eao/*.mjs` pipelines in this session's test-file listing (`find src -name "*.test.ts"` covered `src/` only, not `scripts/` — a `scripts/eao/*.test.mjs` search beyond `project-health.test.mjs` was not separately performed this session, so absence of other test files is **not confirmed**, only that this one was found).

## Decisions and rejected approaches

Commit `831307b` ("Fix binary-encoding corruption in dependency-map.mjs") and `e0b54c9` ("Fix local CSO agent registration") indicate at least two prior bug-fixes in this tooling — evidence that early versions had defects since corrected; not evidence of any currently-open defect.

## Current status

**REMOTE_VERIFIED**, **IMPLEMENTED_NOT_REVERIFIED** for the nine pipeline scripts and their `package.json` wiring. **UNVERIFIED** for the precise current permission scope of the `program-orchestrator` agent definition files themselves (reported via this session's system context, not independently read from the `.md`/`.toml` files this session).

## Open work

None specifically evidenced as unfinished for this module this session.

## Do not redo

Do not re-implement any of the nine EAO pipelines — all exist, are committed, and are wired to npm scripts. Do not grant the `program-orchestrator`/CSO role write, commit, or architecture-approval capability without a new ADR — its read-only/suggest-only scope is a deliberate governance boundary (ADR-024/025), not an oversight.

## Evidence index

- `architecture/adr/ADR-024-executive-ai-office.md`, `ADR-025-eao-generation-2-constitutional-architecture-adoption.md`
- `scripts/eao/*` (directory listing, this session)
- `package.json` `scripts` section (full read, this session)
- `.claude/agents/program-orchestrator.md`, `.codex/agents/program-orchestrator.toml` (existence confirmed; content not read this session)
- commits `d8322a4`, `42c8144`, `88f511a`, `fdb6a93`, `a5024db`, `567f2ab`, `51e98e0`, `831307b`, `e0b54c9`
- tag `eao-bootstrap-v1`
- test: `project-health.test.mjs`
