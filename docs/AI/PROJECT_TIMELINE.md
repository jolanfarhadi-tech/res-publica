# Project Timeline — Evidence-Based Chronology

*Source: `git log --all --date=short --pretty=format:'%h|%ad|%an|%s'`, run this session and the prior compilation session; 91 commits on `main` as of `main`'s tip `5212636`. All commits are authored by "Jolan Farhadi" per `git log` author field — **Git author/committer identity does not distinguish human-typed vs. AI-assisted commits**; this compilation does not claim any specific commit was produced by Claude, Codex, or a human unless a commit message itself names one (see the `3b5fbe9` entry below, the only such case found).*

**Legend:** **[FACT]** = directly stated by the commit subject/hash/date, no interpretation. **[INTERPRETATION]** = this compilation's inference from commit message + known changed-file groupings (from prior sessions' direct reads), clearly separable from the fact above it. **[UNVERIFIED]** = named in a document but not independently confirmed against code this session.

---

## Phase 1 — 2026-07-04 / 2026-07-05: "Milestone" build-out

| Date | Commit | Subject **[FACT]** | Interpretation **[INTERPRETATION]** |
|---|---|---|---|
| 2026-07-04 | `cb509a4` | Milestone 2 | Earliest commit in `git log --oneline main` (reverse order) — likely the earliest point captured in this repository's own history, not necessarily the project's absolute start (no "Milestone 1" commit found). |
| 2026-07-04 | `afb14e1` | Milestone 2 update | — |
| 2026-07-04 | `1ffb48a` | Fix project structure and milestone 3 | — |
| 2026-07-04 | `bdd58ed` | Complete milestone 4 | — |
| 2026-07-05 | `7db13ed` | Milestone 5 completed | — |
| 2026-07-05 | `a528f0d` | Milestone 6 completed | — |

**[UNVERIFIED]:** no document found this session or the prior one that narrates what "Milestone 1–6" individually covered beyond these commit subjects themselves.

## Phase 2 — 2026-07-05: Structural cleanup

| Date | Commit | Subject **[FACT]** | Interpretation **[INTERPRETATION]** |
|---|---|---|---|
| 2026-07-05 | `ba79018` | Remove old app router backup | Consistent with the "single App Router tree" rule `README.md` documents and `scripts/check-structure.mjs` now enforces. |
| 2026-07-05 | `13d421b` | Remove obsolete root components folder | Same rationale as above. |
| 2026-07-05 | `fd30137` | Fix newsletter dictionary keys | Relates to `src/i18n/dictionaries/*.json`. |
| 2026-07-05 | `af64931` | Update next-mdx-remote to v6 | **[FACT]** This is the exact commit all five `worktree-agent-*` branches are still parked at (`git log main..<branch>` empty for all five, verified this session) — see `WARNINGS_AND_DEBT.md`. |

## Phase 3 — 2026-07-05: Foundation Architecture approved

| Date | Commit | Subject **[FACT]** | Interpretation |
|---|---|---|---|
| 2026-07-05 | `2c2dedb` | Approve Foundation Architecture v1.0 | **[FACT]** Tagged `foundation-v1.0`. **[UNVERIFIED]** per `brain/CHANGELOG.md`, preceded by eight phases (Audit → Implementation Plan → Product Vision → Experience Blueprint → Operating System → Master Product Blueprint → MVP Module Blueprint → Foundation Architecture) whose original artifacts are only compressed summaries in this repository — the Audit report and Experience Blueprint originals do not survive anywhere (`brain/PROJECT_BRAIN_STATUS.md` §3). |

## Phase 4 — 2026-07-05: Project Brain migration

| Date | Commit | Subject **[FACT]** | Interpretation |
|---|---|---|---|
| 2026-07-05 | `1ae9931` | Project Brain v1.0 | Tagged `project-brain-v1.0`. |
| 2026-07-05 | `7d39c71` | Finalize Project Brain v1.1 | Tagged `project-brain-v1.1`. Per `brain/PROJECT_BRAIN_STATUS.md` (read in full, prior session): index layer completed, 2 broken `§N` citations fixed, all markdown links validated, 4 missing detail folders backfilled. |

## Phase 5 — 2026-07-05: Phase 0 / Constitution

| Date | Commit | Subject **[FACT]** | Interpretation |
|---|---|---|---|
| 2026-07-05 | `00519d1` | Register ADR-011 Phase 0 Gate | Tagged `phase-0-gate`. |
| 2026-07-05 | `97c1edd` | Approve Res Publica Accountability Constitution v1.0 | Tagged `constitution-v1.0`. Per `brain/PROJECT_BRAIN_STATUS.md` §6: draft → review (12 issue categories found) → revision (19 sections, up from 15) → re-review (zero critical findings) → approved. |
| 2026-07-05 | `b90b418` | Adopt ADR-012: Phase 0 Foundation Build Order correction | Tagged `adr-012-adopted`. |
| 2026-07-05 | `eda2fdc` | Phase 0: apply four P0 fixes per ADR-012 | — |
| 2026-07-05 | `d0a5eb7` | docs: lock phase 1 preparation architecture | Tagged `phase-1-prep-architecture`. |

## Phase 6 — 2026-07-06: Governance/architecture documentation buildout (~25 commits)

**[FACT]** Dense same-day run adding, in order: canonical documentation system (`5409cb9`), ADR-013 reconciliation (`458f656`), Annex/Blockchain architecture (`c05787f` → `ef42b6a`, ADR-014/015), Responsibility Dashboard spec (`fab2930`, ADR-016), Scientific Review (`d35c308`, ADR-017), RP Standard 001 (`06681ce`, ADR-018), Civic Intelligence Layer (`eae43a4` → `0231b18`, ADR-019/022), Dual Intake + National Harm Taxonomy (`bc61508`, ADR-020/021), MVP Annex phasing (`e858ef6`, ADR-023), AI Hearing Facilitator + "Reflection not Validation" terminology fix (`001546c`, `dda929c`, `83cde16`), member profile architecture (`c8a3d8e`, `ce3b501`), Executive AI Office establishment (`52773a1` → `627802c`, ADR-024), EAO documentation-intelligence + dependency-analysis pipelines (`d8322a4` → `42c8144`), EAO pipeline suite (`88f511a` → `51e98e0`: project-health, roadmap, risk-analysis, ADR-review, release-readiness). Tag `eao-bootstrap-v1` at `e0b54c9` "Fix local CSO agent registration."

**[INTERPRETATION]:** this phase is almost entirely documentation/architecture work — `architecture/adr/`, `brain/`, `docs/source/` — not application `src/` code, consistent with `9f9ec5f` (Phase 7 below) being the first commit that visibly introduces application code.

## Phase 7 — 2026-07-07: Foundation Build Order execution

| Date | Commit | Subject **[FACT]** | Interpretation |
|---|---|---|---|
| 2026-07-07 | `9f9ec5f` | Implement Foundation Build Order Steps 1-5: Core Domain Model + 9 MVP modules | **[INTERPRETATION]**, supported by direct inspection: this is the commit that introduces `src/domain/`, `src/modules/`, `src/persistence/` at meaningful depth — the first commit writing real application code in this history, based on `src/modules/publishing/README.md`'s self-description ("Foundation Build Order Step 5, MVP module #3") matching this commit's subject. |
| 2026-07-07 | `a8fe95d` | Fix production build lint errors | — |
| 2026-07-07 | `972942b` | Fix middleware matcher dot-escaping bug | **[FACT]** — corresponds directly to the inline comment still present in `middleware.ts` (read in full), explaining the `[.]` vs `\.` matcher issue. |
| 2026-07-07 | `a6292ed` | Add Platform Foundation section to homepage | — |
| 2026-07-07 | `4ec2e78` | EAO: persist Generation 2 constitutional architecture | Corresponds to ADR-025. |
| 2026-07-07 | `0b4dfb9` | EAO: centralize category registry and schema versioning | — |
| 2026-07-07 | `bdfd5f5` | EAO: derive action counts from evidence | — |

## Phase 8 — 2026-07-19: Module sprint (M1–M4) + HARM governance + legal/licensing + member profile

**[FACT]**, dense same-day commit sequence: `2194b7e` M1 persistence foundation → `a9fac9c` M2 module bootstrap + auth foundation → `e31ca3c` OIDC membership/event flows → `fb2101d` connect membership/events to UI → `770857e` authenticated session controls → `7f1fb81` operational health checks → `444dc6e` event capacity hardening → `f31adb0` resolve cross-domain architecture boundaries → `7ba7fd1` enforce M4 domain boundaries → `8b55778` accept constitutional domain architecture (ADR-026) → `ea21f79` HARM governance workflow core → `5750337` HARM review and repair workflow → `11146fa` protect governance authority delegation → `d8054cd` scoped HARM intake and validation APIs → `91684c1` complete HARM governance methodology workflows → `b900597` docs: accept AGPL license strategy (ADR-032) → `01ffac9` feat: publish legal pages → `cdd57e7` fix: redirect production root to German locale → `ed90c03` docs: normalize EAO reference formatting → `64330df` fix: scope EAO TODO detection → `3b5fbe9` "Snapshot Bevor Codex changes" → `3a75efd` feat: add protected member profile self-service (ADR-034) → `a31afef` feat: add trilingual member profile interface → `bbb4199` feat: redesign civic institutional homepage → `9a270e9` docs: synchronize member profile implementation status → `6a64254` docs: accept HARM knowledge graph specialization → `7025e6f` docs: synchronize ADR decision index → `5212636` docs: accept civic editorial authority model (ADR-036, current `main` tip).

**[FACT, notable]:** commit `3b5fbe9`'s own subject is "Snapshot Bevor Codex changes" — this is the one place in the entire commit history where a commit message itself names "Codex." This compilation treats this as a **fact about the commit message text**, not as proof of which commits before or after it were or weren't produced with Codex's involvement — no other commit message, file, or metadata in this repository states which specific commits were authored by which tool. Do not infer more than the message states.

**[FACT]:** `origin/main` (the remote) is at `7025e6f` as of this compilation — **one commit behind** local `main`'s tip `5212636` (verified this session: `git log origin/main..main` → `5212636` only; `git log main..origin/main` → empty). See `CURRENT_STATE.md`.

## Phase 9 — 2026-07-24: Publishing Authority backend

**[FACT]:** commit `09c160b` completes the Publishing Authority backend on
`integration/publishing-reconciliation`. Full detail:
`MODULES/publishing.md` and `CURRENT_STATE.md`.

## Phase 10 — 2026-07-24: Public narrative transformation

**[VERIFIED RELEASE CANDIDATE]:** a separate frontend transformation adds the
WHY / HOW / WHAT / JOIN public narrative, localized Method and Offerings,
source-grounded Mission/Vision/About content, product maturity, accessible
star/constellation symbolism, provenance-gated collections, truthful
contact/newsletter states, and non-ADR website architecture documentation.
It is committed at `afa2207` and pushed to
`origin/integration/publishing-reconciliation`. Production deployment was not
attempted because the existing Vercel project lacks required database and OIDC
production configuration.

---

## What this timeline does not cover

- The exact scope of any individual Claude Code or Codex session's work within a given day's commit run — **[UNVERIFIED]**, no session transcripts exist in this repository (see `INDEX.md` conversation-history disclosure).
- Whether every commit listed actually passed CI at the time it was made — **[UNVERIFIED]**, this compilation did not query GitHub Actions run history.
- Commits on the five stale `worktree-agent-*` branches beyond `af64931` — **[FACT, negative]:** none exist; all five branches have zero commits ahead of `main` (verified this session, `git log main..<branch>` empty for all five).
