# Agent Rules — Permanent Instructions for Every Future AI Agent

*These rules apply to any AI agent working in this repository — Claude Code, OpenAI Codex, GPT-based agents, or any other. They are permanent unless a future session explicitly revises this file with new evidence-backed justification (see Rule 10). This file itself does not summarize architecture or history — see `REPOSITORY_MEMORY.md` for that.*

---

## 1. Read `REPOSITORY_MEMORY.md` first

Before starting any non-trivial task, read `docs/AI/REPOSITORY_MEMORY.md`. It is the permanent record of what this repository is, how it evolved, what decisions were made and why, and what is known to be unfinished. Do not re-derive this from scratch — it already exists, and re-deriving it wastes effort and risks contradicting the established record.

## 2. Read `CURRENT_STATE.md` before coding

`docs/AI/REPOSITORY_MEMORY.md` is a point-in-time record and goes stale. Before writing or modifying any code, read `docs/AI/CURRENT_STATE.md` — and if it is more than a few commits old (check its own recorded HEAD against the actual current `git rev-parse HEAD`), **re-run the verification commands it documents rather than trusting its content**. A memory file that has not been re-verified against live git state is a starting hypothesis, not a fact.

## 3. Read related ADRs before modifying architecture

Before changing anything that touches module boundaries, authorization, persistence structure, or cross-module integration, check `docs/AI/ARCHITECTURE_INDEX.md` for the governing ADR(s), then read that ADR in full at `architecture/adr/`. Most things that look like an architectural gap are already a closed, deliberate decision with a stated rationale — re-read it before assuming it's missing or wrong. This mirrors the repository's own standing rule in `brain/GOVERNANCE/reading-order.md`: "Most of what looks like a gap is already a closed, approved decision with a stated rationale — re-read it before assuming it's missing."

## 4. Never duplicate existing work

Before implementing anything, search the repository (`Grep`/`Glob`, or equivalent) for an existing implementation. This repository already has: capability-based authorization (`src/auth/authorize.ts`, reused identically by `publishing` and `harm-governance` — do not invent a second authorization primitive); a Plugin/manifest module-registration system (`src/modules/{manifest,registry,bootstrap}.ts` — do not hand-wire a new module); a per-module `authority.ts` pattern for domain-specific permissions; an audit-logging helper pattern (write an `auditLog` row inside the same transaction as the state change). Check `docs/AI/MODULES/*.md` for the module you're touching — each has a "Do not redo" section listing what already exists and should not be reimplemented.

## 5. Never overwrite implemented features without evidence

Before modifying or removing code that appears to implement a feature, verify its current status in the relevant `docs/AI/MODULES/*.md` file and/or by reading the code directly. Do not assume something is unfinished or wrong because a comment, README, or memory file says so — cross-check against the actual current code first (see Rule 9 on documentation drift). Conversely, do not assume something is finished and safe to build on top of merely because an ADR says "Accepted" — an accepted ADR is not proof of implemented code (see `docs/AI/ARCHITECTURE_MEMORY.md`'s explicit ACCEPTED-vs-IMPLEMENTED distinction, which exists precisely to prevent this mistake).

## 6. Preserve architectural boundaries

Respect the boundaries this repository has explicitly documented: Civic Domain / Governance Domain / Shared Platform Services (ADR-026); Tier 1 (Static Core) must never be blocked by Tier 2 (AI Retrieval) or Tier 3 (Personalization/Identity) (ADR-001); the Member Profile is a read-only display layer that owns no business logic and must never merge its three visibility tiers into one queryable object (ADR-034, `docs/source/projects/MEMBER_PROFILE.md`); AI never originates an institutional position — every AI output must trace to a named human sign-off (`brain/PROJECT_MEMORY.md`); Zero Gamification — no points, ranks, leaderboards, or comparative scores anywhere, under any framing.

## 7. Never fabricate repository history

If information cannot be recovered from git history, commit messages, source code, ADRs, or existing documentation, say so explicitly — write "Not Recoverable from the available evidence" rather than guessing, inferring silently, or presenting a plausible-sounding narrative as fact. This repository's own standing charter (`docs/source/MASTER_SYSTEM.md`) states this same rule for its own contributors: "Never fabricate references. Never invent historical facts." Do not attribute a specific commit to "Claude" or "Codex" unless a commit message, file, or piece of session evidence actually states it — git author identity in this repository ("Jolan Farhadi" for all 91 commits as of this writing) does not distinguish tool involvement.

## 8. Never rewrite completed modules unless explicitly requested

A module marked "implemented" or "tested" in `docs/AI/MODULES/*.md` should not be rewritten, restructured, or "improved" as a side effect of an unrelated task. If a task requires touching a completed module, make the minimal change the task actually needs and leave the rest alone. Full rewrites of working modules require an explicit user request, not an agent's own initiative.

## 9. Watch for and flag documentation drift

A module's own README or a memory file can go stale within hours of being written, if the surrounding implementation changes afterward. A confirmed historical example in this repository was `src/modules/membership/README.md` stating "ADR-027 remains unresolved" after ADR-027 had been accepted and `src/auth/` implemented; that README was corrected on 2026-08-04. When a memory file or module README makes a claim about another module's state, verify it against that other module's actual current code before trusting it.

## 10. Record important architectural decisions

When you make or observe a significant architectural or implementation decision during a task, add it to `docs/AI/DECISION_LOG.md` following the existing entry format (Decision / Rationale / Evidence / Related commit / Related ADR / Rejected alternatives if any). Do not let a decision live only in a conversation that will not persist — this repository's own charter states the same principle: "Important knowledge must never remain only in: conversations, prompts, temporary notes... If knowledge matters: Integrate it into the repository" (`docs/source/MASTER_SYSTEM.md`).

## 11. Update repository memory after completing significant work

After finishing a non-trivial task (a new feature, a resolved bug with non-obvious cause, a completed migration, a commit decision on previously-uncommitted work), update the relevant files: `docs/AI/CURRENT_STATE.md` (re-run its verification commands, don't hand-edit stale values into it), the relevant `docs/AI/MODULES/*.md` file's "Current status" and "Open work" sections, and `docs/AI/DECISION_LOG.md` if a decision was made. Do not let these documents silently diverge from reality — a memory system that isn't kept current is worse than no memory system, because it actively misleads.

## 12. Distinguish Verified, Inferred, and Not Recoverable — always

When adding to any `docs/AI/` memory file, tag claims by confidence level, consistent with how the existing files are written: **Verified** (directly confirmed by reading code/git/tests/ADRs yourself, this session), **Inferred** (a reasonable reading of evidence, not a directly stated fact — say so), **Not Recoverable from the available evidence** (explicitly say this rather than guessing). Do not blend these into a single undifferentiated narrative.

## 13. This directory does not replace direct verification

No file under `docs/AI/` — including this one — outranks the actual repository. Per `docs/AI/INDEX.md`'s evidence hierarchy: current code > current git state/history > tests/CI > accepted ADRs > canonical `docs/source/` documents > `brain/` (historical) > `docs/AI/` memory documents > conversation claims. If a memory file conflicts with what you find in the actual code, the code wins — update the memory file, not the other way around.

## 14. Respect the operational boundaries these memory documents were built under

This memory system (`REPOSITORY_MEMORY.md`, `CURRENT_STATE.md`, `ARCHITECTURE_INDEX.md`, `DECISION_LOG.md`, this file, plus `INDEX.md`, `ARCHITECTURE_MEMORY.md`, `IMPLEMENTATION_MEMORY.md`, `PROJECT_TIMELINE.md`, `OPEN_WORK.md`, `WARNINGS_AND_DEBT.md`, `MODULES/*.md`) was built without running tests, builds, migrations, or any code-modifying command, and without committing or pushing. Treat "documented as implemented" as "source and tests exist," never as "verified passing," unless a specific entry states a test was actually run and what the result was.
