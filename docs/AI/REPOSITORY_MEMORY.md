# Res Publica — Repository Memory (Permanent)

*Permanent institutional/technical memory for this repository, for any future AI agent (Claude, Codex, GPT, or otherwise). Compiled 2026-07-19/20 across multiple Claude Code sessions, from repository evidence only. Every statement is tagged **Verified** (directly confirmed against code/git/tests/ADRs), **Inferred** (a reasonable reading of evidence, not a directly stated fact), or **Not Recoverable from the available evidence** (explicitly flagged, never guessed at). Do not mix these categories when reading or extending this document.*

**Conversation-history disclosure:** Previous agent conversation transcripts are not available in this workspace, beyond the current session's own context. This memory is built from current repository evidence, Git history, accessible session context, and existing files — not from any external record of what prior sessions discussed or intended.

**Navigation:** for day-to-day task work, start at `docs/AI/CURRENT_STATE.md` (live state) and the relevant `docs/AI/MODULES/*.md` file, not this document — see `docs/AI/INDEX.md` for the full navigation map and reading order. This document is the comprehensive permanent record; it is deliberately long and is not meant to be re-read start-to-end for every task.

---

# Repository Identity

**Verified.** Path: `c:\Users\alblo\Documents\Res-Publica` (also seen as `C:/Users/alblo/Documents/res-publica` via `git rev-parse --show-toplevel` — case-insensitive filesystem, same repository). Project name `res-publica`, version `0.1.0` (`package.json`). License: AGPL-3.0-only core, CLA required (not yet published), dual-licensing reserved — `LICENSE`, `README.md`, `CONTRIBUTING.md`, `architecture/adr/ADR-032-license-strategy.md`.

**Verified**, from `brain/PROJECT_MEMORY.md` (read in full): Res Publica is a real German civic organization for democracy, dialogue, research, and public participation. Trilingual (German primary, English, Persian/Farsi RTL). Nonprofit, grant-funded. Measures success by civic effect, never attention.

**Verified**, same source: it is becoming "an AI-first civic platform — not a website with a chatbot bolted on, but a platform where AI makes the organization's existing trustworthy, sourced content radically more reachable." **Verified, binding constraint** (`brain/PROJECT_MEMORY.md`): "AI never originates an institutional position; every AI output traces to a named human sign-off."

**Verified — the operating methodology.** The organization's central methodology is called **HARM** — a proper name, not an acronym (`docs/source/glossary/TERMS.md`, `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md`, both read in full). Twelve-stage lifecycle: Citizen Experience → AHIP → Structured Hearing → Reflection → Expert Review → Mechanism Identification → Responsibility Evidence → Knowledge Products → Harm Codex → Community Learning → Institutional Learning → Governance Improvement. Distinct four-part analytical lens: **H**arm, **A**ccountability, **R**epair, **M**obilization.

**Verified — stack.** Next.js 15.3 (App Router), React 19, TypeScript 5.6, Tailwind CSS v4, Framer Motion, `next-mdx-remote` v6 + `gray-matter` (MDX-in-Git content), Drizzle ORM 0.45 + `pg` (production Postgres) + `@electric-sql/pglite` (offline-first local dev), `openid-client` v6 (OIDC), `zod`, `vitest`. Deployed on Vercel. Evidence: `package.json` (read in full).

---

# Repository Evolution

## Milestones (git evolution)

**Verified**, from `git log --all --date=short --pretty=format:'%h|%ad|%an|%s'` (run twice, 2026-07-19 and 2026-07-20, identical results — 91 commits on `main`, all authored "Jolan Farhadi"):

1. **2026-07-04/05 — "Milestone" phase.** `cb509a4` Milestone 2 → `afb14e1` → `1ffb48a` → `bdd58ed` Milestone 4 → `7db13ed` Milestone 5 → `a528f0d` Milestone 6. **Not Recoverable from the available evidence:** what Milestones 1–6 individually covered beyond these bare commit subjects — no "Milestone 1" commit exists, and no document narrates their content.
2. **2026-07-05 — Structural cleanup.** `ba79018`/`13d421b` (remove duplicate app-router/components artifacts), `fd30137` (newsletter dictionary fix), `af64931` (next-mdx-remote v6 — **Verified**: this is the exact commit all five stale `worktree-agent-*` branches remain parked at).
3. **2026-07-05 — Foundation Architecture approved.** `2c2dedb`, tagged `foundation-v1.0`. **Verified**, per `brain/CHANGELOG.md`: preceded by eight phases (Engineering+Security Audit → Implementation Plan → Product Vision → Experience Blueprint → Operating System → Master Product Blueprint → MVP Module Blueprint → Foundation Architecture), each only a compressed summary in this repository now. **Not Recoverable:** the original, unabridged Audit report and Experience Blueprint text — `brain/PROJECT_BRAIN_STATUS.md` §3 confirms neither survives anywhere in this repository.
4. **2026-07-05 — Project Brain migration.** `1ae9931` (`project-brain-v1.0`) → `7d39c71` (`project-brain-v1.1`). **Verified**, `brain/PROJECT_BRAIN_STATUS.md`: index layer completed, 2 broken `§N` citations fixed, all markdown links validated, 4 missing detail folders backfilled as thin indices.
5. **2026-07-05 — Phase 0 / Constitution.** `00519d1` (`phase-0-gate`) → `97c1edd` Constitution v1.0 (`constitution-v1.0`) → `b90b418` ADR-012 (`adr-012-adopted`) → `eda2fdc` (four P0 fixes) → `d0a5eb7` (`phase-1-prep-architecture`). **Verified**: Constitution went draft → review (12 issue categories) → revision (19 sections, up from originally-specified 15) → re-review (zero critical findings) → approved.
6. **2026-07-06 — Governance/architecture documentation buildout (~25 commits, same day).** Canonical docs system (`5409cb9`), ADR-013 reconciliation (`458f656`), Annex/Blockchain architecture (`c05787f`→`ef42b6a`, ADR-014/015), Responsibility Dashboard (`fab2930`, ADR-016), Scientific Review (`d35c308`, ADR-017), RP Standard 001 (`06681ce`, ADR-018), Civic Intelligence Layer (`eae43a4`→`0231b18`, ADR-019/022), Dual Intake + Harm Taxonomy (`bc61508`, ADR-020/021), MVP Annex phasing (`e858ef6`, ADR-023), "Reflection not Validation" terminology retirement (`001546c`, `dda929c`, `83cde16`), member profile architecture (`c8a3d8e`, `ce3b501`), **Executive AI Office** establishment (`52773a1`→`627802c`, ADR-024), EAO pipeline implementation (`d8322a4`→`51e98e0`), tag `eao-bootstrap-v1` at `e0b54c9`. **Inferred:** this phase is almost entirely documentation/architecture work, not application code, based on file-path patterns in the commits sampled.
7. **2026-07-07 — Foundation Build Order execution.** `9f9ec5f` "Implement Foundation Build Order Steps 1-5: Core Domain Model + 9 MVP modules" — **Verified/Inferred**: this is the first commit introducing real `src/domain/`, `src/modules/`, `src/persistence/` code at depth, based on module READMEs (e.g. `src/modules/publishing/README.md`) self-describing as "Foundation Build Order Step 5." Then `a8fe95d` (lint fixes), `972942b` (middleware dot-escaping bug fix — **Verified** by the surviving inline comment in `middleware.ts`), `a6292ed`, `4ec2e78`/`0b4dfb9`/`bdfd5f5` (EAO Gen 2 work).
8. **2026-07-19 — Module sprint (M1–M4) + HARM governance + legal/licensing + member profile (dense same-day run).** `2194b7e` M1 persistence → `a9fac9c` M2 auth → `e31ca3c` OIDC flows → `fb2101d` UI wiring → `770857e` session controls → `7f1fb81` health checks → `444dc6e` event capacity hardening → `f31adb0`/`7ba7fd1` domain boundaries (M4) → `8b55778` constitutional domain architecture (ADR-026) → `ea21f79`→`11146fa` HARM governance core/review/repair/authority → `d8054cd`/`91684c1` HARM APIs/workflows → `b900597` AGPL (ADR-032) → `01ffac9` legal pages → `cdd57e7` German-locale redirect fix → `ed90c03`/`64330df` EAO fixes → `3b5fbe9` **"Snapshot Bevor Codex changes"** → `3a75efd` member-profile self-service (ADR-034) → `a31afef` trilingual profile → `bbb4199` homepage redesign → `9a270e9` profile status sync → `6a64254` HARM KG specialization → `7025e6f` ADR index sync → `5212636` civic editorial authority (ADR-036) — **current `main` tip**.
9. **Present — `integration/publishing-reconciliation` branch, uncommitted.** **Verified:** zero commits on this branch (`git log main..HEAD` empty, checked 2026-07-19 and 2026-07-20). All content beyond `main`'s `5212636` tip is uncommitted working-tree changes implementing ADR-036 at the code level (persistence, authority, API). Full detail: `docs/AI/MODULES/publishing.md`.

**Verified, notable fact about commit `3b5fbe9`:** its subject, "Snapshot Bevor Codex changes," is the *only* place in 91 commits where a commit message names "Codex." **Inferred, weakly:** this suggests a handoff point to Codex-assisted work around 2026-07-19. **Not Recoverable:** which specific commits before or after this point were produced by Codex vs. a human vs. Claude — no commit, file, or metadata in this repository states per-commit tool attribution. Git author is "Jolan Farhadi" for all 91 commits, which does not distinguish tool involvement.

**Verified, remote state (checked 2026-07-19 and re-checked 2026-07-20, identical):** `origin/main` is at `7025e6f` ("docs: synchronize ADR decision index") — **one commit behind** local `main`'s tip `5212636`. `git log origin/main..main` → `5212636` only; `git log main..origin/main` → empty.

## Architecture evolution

**Verified.** Three documentation layers exist, one now superseded: `architecture/adr/` (ADRs, never superseded as a location — 34 numbered records `001`–`034` plus `036`, `035` reserved); `brain/` (~90 files, the original "Project Brain," canonical from `foundation-v1.0` until superseded); `docs/source/` (~52 files + a new `communication/` subfolder, built later, now canonical). **Verified supersession**, `docs/source/DECISION_LOG.md` item 6: *"`docs/source/` is now canonical; `brain/` is retained as historical source material, not deleted."* `docs/source/COMPATIBILITY_MAP.md` cross-references every `docs/source/` document to its `brain/` origin and confirms no contradiction was found during the migration.

**Verified**, domain-architecture evolution specifically: constitutional domain separation (Civic Domain / Governance Domain / Shared Platform Services) accepted via ADR-026, commit `8b55778`, preceded by `f31adb0` ("Resolve cross-domain architecture boundaries") and `7ba7fd1` ("Enforce M4 domain boundaries") — i.e., the boundary work preceded the formal ADR acceptance, not the reverse.

## Frontend evolution

**Verified.** Single App Router tree at `src/app/[locale]/`, enforced by `scripts/check-structure.mjs` (`predev`/`prebuild` guard against duplicate `app/`/`content/` roots). Locale middleware (`middleware.ts`) redirects to `Accept-Language`-preferred locale (German fallback), with a **directly-verified, documented non-obvious bug-fix**: the path matcher uses `[.]` (character class) instead of `\.` because, per the surviving inline comment, "a backslash-escaped dot is silently unescaped by this project's path-to-regexp-based matcher compiler... Verified directly against this build's own `tryToParsePath` compiler, not assumed." Corresponds to commits `972942b`/`cdd57e7`. Trilingual i18n (`de`/`en`/`fa`, Persian RTL) via `src/i18n/dictionaries/{de,en,fa}.json`, TypeScript-enforced identical key structure. Member Profile UI (`src/app/[locale]/profile/page.tsx`) added via `3a75efd`/`a31afef`. Homepage redesigned via `bbb4199`.

## Backend evolution

**Verified.** Domain model (ADR-002) → Plugin/module architecture (ADR-003, `src/modules/{manifest,registry,bootstrap}.ts`) → per-module implementation in a dense 2026-07-07 commit (`9f9ec5f`) covering 9 MVP modules → auth/identity (ADR-027, commits `a9fac9c`/`e31ca3c`/`770857e`, 2026-07-19) → HARM governance workflow (`ea21f79`→`91684c1`) → civic editorial/publishing-authority (ADR-036, accepted `5212636`, code **still uncommitted** as of this compilation). Persistence: two Drizzle schema files (`src/persistence/schema.ts` — 10 core tables; `src/persistence/module-schema.ts` — ~40 per-module tables), 12 migrations (`0000`–`0011`, the last uncommitted).

---

# Architecture

## Domain model

**Verified**, ADR-002 (`architecture/adr/ADR-002-domain-model.md`), amended to add `Notification` as a sixth canonical entity. **Verified in code**: `people`, `consentRecords`, `payments`, `organizations`, `notifications`, `auditLog` all exist as `pgTable`s in `src/persistence/schema.ts` (grepped directly). Domain-layer wrappers: `src/domain/{person,consent,payment,organization,notification,audit-log}/`.

## Modules

**Verified**, from `find src/modules -type f`: `ai-layer`, `analytics`, `community`, `crm`, `dashboard`, `events`, `harm-governance`, `knowledge-graph`, `membership`, `publishing` — each with its own `manifest.ts` (Plugin Architecture, ADR-003), most with a `README.md` and `*.test.ts`. Shared registration: `src/modules/{manifest,registry,bootstrap}.ts` (+ their own tests). Detailed per-module memory: `docs/AI/MODULES/{identity-auth,member-profile,harm-governance,publishing,events,membership,knowledge-graph,ai-runtime,persistence,frontend-i18n,eao}.md`. **Not individually detailed** in the `MODULES/` set (out of scope for that pass, not evidence-absent): `community`, `crm`, `dashboard`, `analytics` — all confirmed to have real source + tests.

## Boundaries

**Verified**, ADR-026: Civic Domain / Governance Domain / Shared Platform Services. ADR-028: generic graph mechanism → Shared Platform Services, graph semantics → owning domains. ADR-029: append-only audit boundary (**Verified implemented** — `auditLog` table, written transactionally by every mutating action inspected) + domain-event bus (**Not Recoverable/Unverified** — no message-queue dependency or `event-bus`-named file found; may be realized differently or not yet built, genuinely undetermined by this compilation). ADR-030: shared AI runtime mechanism, domain decisions stay domain-owned. ADR-031: project ownership/cross-domain collaboration (**Unverified** — no `Project` entity found in either schema file; implementation status genuinely undetermined).

## ADR summary

Full ADR-by-ADR index with status, purpose, and implementation evidence: **`docs/AI/ARCHITECTURE_INDEX.md`** (companion document to this one — not duplicated here). Authoritative source index: `brain/DECISIONS.md`.

---

# Technical Decisions

Full decision-by-decision detail with rationale and evidence: **`docs/AI/DECISION_LOG.md`** (companion document — condensed here to the highest-level facts only, to avoid duplication).

## Accepted

Three-tier platform architecture (ADR-001); canonical domain model (ADR-002); plugin/manifest architecture (ADR-003); offline-first (ADR-010); constitutional domain separation (ADR-026); identity/auth boundary (ADR-027, **Verified Accepted** — "explicitly approved by the Founder on 2026-07-19," per the ADR's own `## Status` line, read directly); AGPL-3.0-only licensing (ADR-032); civic editorial delegation of authority (ADR-036, accepted, code uncommitted). Full list: `docs/AI/ARCHITECTURE_INDEX.md`.

## Rejected

**Verified**, from ADR-001's own Alternatives section and `docs/source/DECISION_LOG.md`: a full CMS/dynamic-framework rewrite of the static core; AI embedded directly in Tier 1's render path; introducing the personalization database before the AI layer; treating the website's "8 steps" and the 12-stage HARM Lifecycle as two competing versions (resolved as one canonical cycle); inventing expansions for unresolved acronyms (AHIP, RPCS, SMHC — left explicitly unresolved instead); regenerating the lost Audit report or Experience Blueprint from scratch and presenting it as the migrated original (`brain/PROJECT_BRAIN_STATUS.md` §3, explicit); merging "Responsibility Dashboard" (methodology) with the product "Dashboard" module; Member Profile defining its own Contribution Record Lifecycle; treating six named systems (AI Mentor, Skill Graph, etc.) as real, buildable modules without their own future ADR.

## Superseded

**Verified**: "Validation Framework" terminology (commit `83cde16`, "Retire Validation Framework terminology"; `dda929c`, "Reinforce Reflection not Validation principle"; `d20c562`, `hearing_validated` → `hearing_documented`). `brain/` superseded as the canonical documentation location by `docs/source/` (documents/ADRs themselves not superseded, only the "which tree is canonical" designation).

---

# Implementation History

## Features completed (source + tests exist, committed to `main`, ≤ `origin/main` tip `7025e6f` — i.e., pushed)

**Verified** (existence of source + test files; **tests not executed by any session that produced this document** — "completed" here means "implemented and committed," not "currently passing"): Identity/Auth (OIDC, sessions, capability-based authorization); Domain model + persistence (10 core + ~40 module tables); Plugin/module registry; Knowledge Graph (deterministic extraction, `kg_entities`/`kg_relationships`); AI Layer local provider (deterministic keyword search, zero-cost); Events (registration, waitlist, capacity, scoped Q&A, outcomes); Membership (full lifecycle, pledges, institutional profiles, benefit grants); Publishing domain logic (intake, moderation, draft-authoring, translation, sign-off, publish-readiness — persistence/API layer separate, see below); HARM Governance (workflow core, review, repair, authority delegation, intake/validation APIs); Member Profile first slice (ADR-034: session-derived self-authorization, protected read-only API, trilingual UI); EAO tooling (9 pipeline scripts + agent registration).

## Features partially completed

**Verified**: AI Layer external provider — README direct quote: "Real external provider (grounded RAG, embeddings, LLM calls) is separate, later, infrastructure-dependent work — not started." Member Profile — spec's own TODO checklist has multiple unchecked items (Codex Potential/Hearing Candidate disclosure workflow, remaining Identity/Community/Application/Payments/Notifications views). Knowledge Graph HTTP API — manifest declares three routes (`/api/knowledge-graph/{lookup,related,search}`) not found under `src/app/api/` in this session's directory listing — **Unverified** whether unbuilt or consumed in-process only.

## Unfinished work

**Verified, most significant finding of this compilation:** the Publishing-authority implementation (persistence migration `0011`, `src/modules/publishing/authority.ts`, `src/application/publishing.ts`/`publishing-authority.ts`, `src/app/api/publishing/{grants,workflow}/`) exists **entirely as uncommitted working-tree changes** on branch `integration/publishing-reconciliation` — not on any commit, local or remote. Full detail: `docs/AI/MODULES/publishing.md`, `docs/AI/OPEN_WORK.md` OPEN-001.

**Verified:** ADR-035 is reserved (Innovations 6/7, operational Governance/status/retention/withdrawal/deletion rules) — no ADR file exists, explicitly pending per ADR-019 and `brain/DECISIONS.md`.

**Verified**, `brain/ROADMAP.md`: V2/V3 modules not yet detailed to build-ready depth — Fellowship System, Academy, Speech Academy, Writing Academy, News Analysis Lab, Research Lab, Store, full Admin Portal (V2); Public API (V3).

---

# Current Architecture

This section intentionally stays brief — live, re-verified state belongs in **`docs/AI/CURRENT_STATE.md`**, not here (this document is a point-in-time permanent record; `CURRENT_STATE.md` is the one meant to be re-run and re-trusted). As of this compilation: `main` tip `5212636`; current branch `integration/publishing-reconciliation` (zero commits of its own, entirely uncommitted-worktree content on top of `main`); `origin/main` one commit behind local `main`. See `CURRENT_STATE.md` for the authoritative, freshly-verified snapshot.

---

# Technical Debt

**Verified:** two Foundation-era documentation artifacts (Engineering/Security Audit report, 9-stage Experience Blueprint) have no surviving original text anywhere in this repository — only compressed summaries (`brain/PROJECT_BRAIN_STATUS.md` §3). Several `docs/source/` documents are self-labeled "Version 1.0 proposal, pending approval" with only fragmentary source evidence (`BUSINESS.md`, `CURRICULUM.md`, `RPCS_CERTIFICATION.md`, most of `BRAND_GUIDE.md`, `ETHICS_CHARTER.md`, `AHIP.md`, `STRUCTURED_HEARINGS.md`, `HARM_CODEX.md` procedural detail). `AHIP`, `RPCS`, `SMHC` remain unresolved acronyms. CLA text not yet published. Five stale `worktree-agent-*` branches (zero unique commits each, verified twice). `src/modules/membership/README.md` contains a stale claim that ADR-027 "remains unresolved" — ADR-027 is now Accepted and `src/auth/` has committed implementation; this is documentation drift, not a code defect.

# Known Risks

**Verified:** the entire publishing-authority implementation (see Unfinished Work, above) risks silent loss if any destructive git operation (`checkout --`, `clean -f`, `reset --hard`, branch switch) is run without first committing or deliberately discarding it. The uncommitted migration `0011_publishing-authority.sql` has never been checked via `db:check`/`db:check:fresh` (CI only runs these on push/PR; this migration has never been pushed). `docs/source/communication/{brand-identity,pitch-arsenal}.md` are untracked and unexplained — risk of accidentally bundling unrelated work into a future commit. Full risk register with severity/handling/resolution-condition per item: `docs/AI/WARNINGS_AND_DEBT.md`.

---

# Future Roadmap

**Verified**, `brain/ROADMAP.md` (read in full): Phase 0 (Foundation hardening, ~0.5 FTE) → MVP "Grounded Civic Copilot" (~1–2 FTE) → V2 "Structured Participation & Personalized Civic Pathways" (~3–5 FTE) → V3 "Civic Infrastructure Platform" (~6–8 FTE). Ratified MVP build order: Knowledge Graph → AI Layer → Publishing → Community → Membership System → Events → Dashboard → CRM → Analytics. **Inferred**, cross-checked against actual code this session: all nine MVP modules have real source + tests, though Dashboard/CRM/Analytics implementation depth was not individually assessed. V2/V3 modules explicitly not yet at build-ready depth (see Technical Debt).

---

# Lessons Learned

**Verified**, `brain/PROJECT_MEMORY.md` §"Why three separate reconciliation passes happened, and why that's a good sign": each major synthesis document in this project's history was produced by parallel specialist teams from a shared brief, which repeatedly caught the same real-world concept independently defined more than once — the Master Product Blueprint's reconciliation caught a circular module dependency and a phase-order conflict; the Foundation Architecture's domain-model unification caught five duplicated entities; a dedicated Foundation Review caught six further issues. The document's own framing: "This pattern — each pass catching what the last one missed — is the process working as intended, not evidence of instability."

**Inferred, from this compilation's own findings (2026-07-19/20):** the same pattern recurs at the code level, not just the documentation level — `src/modules/membership/README.md`'s auth-boundary claim went stale the moment `src/auth/` was actually implemented three commits later, and nothing updated it. **Lesson for future agents:** a module's own README self-description can lag real implementation state by hours within the same day's commit sequence; always cross-check a specific claim (e.g., "X is unimplemented") against the actual current code before trusting it, even when the README was written by the same effort that's supposedly current.

**Verified, evidence-discipline lesson, `docs/source/MASTER_SYSTEM.md`** (the repository's own standing charter, read in full): "Repository First... Do not rely on memory. Do not rely on previous conversations. Do not rely on assumptions... If no evidence exists: Create a clearly labeled 'Proposed v1.0' section. Do not present proposals as established facts." This document and its companions follow that same discipline.

---

# Important Constraints

**Verified, binding, repeated throughout the documentation tree:**
- **Zero Gamification** — no points, ranks, leaderboards, comparative scores, anywhere, under any framing (`RESPONSIBILITY_EVIDENCE_MODEL.md` §9's explicit "Forbidden Concepts" list; Constitution Core Principle 2; restated in `docs/source/projects/MEMBER_PROFILE.md` four separate times as an "Architectural Rule").
- **AI never originates an institutional position** — every AI output must trace to a named human sign-off (`brain/PROJECT_MEMORY.md`).
- **Member Profile is not a governance decision interface** — read-only, tri-tier visibility enforced at the data-access layer, not the UI (`docs/source/projects/MEMBER_PROFILE.md`).
- **"Do not rewrite history" applies to documentation itself** — ADR amendments are append-only; the `docs/source/` migration did not alter `brain/`'s frozen content; Version 1.0 proposals are explicitly labeled, never presented as fact.
- **Documentation-architecture discipline** (`docs/source/MASTER_SYSTEM.md`): one document owns each concept; never fabricate references or historical facts; never contradict existing canonical documents.
- **Single App Router / content tree** — `scripts/check-structure.mjs` fails the build on any duplicate root `app/`/`content/` folder; this has caused real incidents before (per `README.md`'s own stated rationale: "causes silent 404s/empty pages").
- **AGPL-3.0-only core license, CLA required** for contributions (`ADR-032`, `CONTRIBUTING.md`) — CLA text not yet published; do not accept or draft contribution legal terms as an engineering task.

---

# Knowledge That Must Never Be Lost

1. **`docs/source/` is canonical; `brain/` is historical only** (`docs/source/DECISION_LOG.md` item 6). Losing this fact risks a future agent treating a stale `brain/` document as authoritative over a newer, conflicting `docs/source/` document.
2. **The Publishing-authority implementation is real, apparently complete, and entirely uncommitted** as of this compilation (branch `integration/publishing-reconciliation`, zero commits, all work in the working tree). This is the single highest-value, highest-risk fact in this repository's current state — losing it risks the work being silently discarded by a routine git operation.
3. **ADR-035 is reserved but does not exist.** Any future work on Innovations 6/7 or the reserved operational Governance rules must write and accept ADR-035 first — this is a governance requirement, not a formality (`brain/DECISIONS.md`, `docs/source/DECISION_LOG.md`'s own precedence rules).
4. **Two Foundation-era artifacts (the original Audit report, the original Experience Blueprint) are permanently lost** from this repository — only summaries survive. Do not regenerate and present as original.
5. **The five `worktree-agent-*` branches contain zero unique work** (verified twice, 2026-07-19 and cross-checked) — safe to disregard, not safe to assume they hold anything.
6. **`origin/main` lags local `main` by one commit and lags the working tree's uncommitted branch entirely.** A fresh clone from `origin` will not reflect everything described in this memory set.
7. **The `tatus` root file is harmless debris** (stray `git log` output, likely a shell redirection accident) — not part of any tracked feature, not to be deleted without owner confirmation, not to be mistaken for meaningful project state.
8. **The `[.]` vs `\.` middleware-matcher fix in `middleware.ts` is load-bearing** — reverting it silently reintroduces a bug where the locale-redirect matcher matches nearly every path.

---

*Companion documents: `docs/AI/CURRENT_STATE.md` (live state), `docs/AI/ARCHITECTURE_INDEX.md` (full ADR table), `docs/AI/DECISION_LOG.md` (decision-by-decision detail), `docs/AI/AGENT_RULES.md` (permanent agent instructions), `docs/AI/INDEX.md` (navigation), `docs/AI/MODULES/*.md` (per-module operational memory), `docs/AI/OPEN_WORK.md` / `docs/AI/WARNINGS_AND_DEBT.md` (living registers). This document does not duplicate their content in full — it summarizes and links.*
