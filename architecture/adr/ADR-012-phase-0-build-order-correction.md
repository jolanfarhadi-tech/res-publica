# ADR-012: Phase 0 Foundation Build Order Correction

**Status: ADOPTED — approved by the Human Approval Authority (Constitution §16/§17 rule 2), indexed in `DECISIONS.md` in this same commit, per §17 rule 3.**

## Context

Phase 0 began from the frozen Project Brain v1.1 baseline, per `ADR-011-phase-0-start.md`. The Foundation Build Order (`brain/BLUEPRINTS/foundation-architecture.md` §9) names Step 0 as applying the original Engineering/Security Audit P0 fixes to the live repository, ahead of any Core Domain Model work. `brain/BLUEPRINTS/implementation-plan.md` is the more granular, effort-estimated, file-level breakdown of the same 5-specialist review's 21 total findings into P0–P3 priority tiers. Both documents are frozen, approved Project Brain v1.1 content. Before defining Phase 0's next implementation command, a comparison of the two documents' P0/Step-0 scope was performed (session analysis, comparison table delivered prior to this ADR).

## Problem

`foundation-architecture.md` §9's Step 0 list and `implementation-plan.md`'s own P0 tier disagree on what "Phase 0's critical fixes" actually are. Only 2 of 4 items match across both (delete `proxy.ts`; add newsletter rate limiting). §9 additionally lists "add content-read caching" as P0; `implementation-plan.md` tiers that same item as **P1** ("High priority," not "Critical, fix immediately") and instead lists "escape JSON-LD `dangerouslySetInnerHTML` output" as P0 — an XSS-hardening item §9 never mentions at all. Left unresolved, Phase 0's next command has no single authoritative scope to build against, and following §9 literally would mean skipping a flagged P0 security item while spending critical-path effort on an item the same review deliberately tiered lower.

## Decision

Adopt `implementation-plan.md`'s P0 tier as the authoritative, binding definition of Foundation Build Order Step 0's scope: (1) delete broken/dead `proxy.ts`; (2) validate `slug` before filesystem access / harden path traversal; (3) add rate limiting to `/api/newsletter`; (4) escape JSON-LD `dangerouslySetInnerHTML` output. Content-read caching (`implementation-plan.md` P1, item 5) is explicitly retained as the immediate next priority once Step 0 closes — not dropped, just correctly sequenced as high-priority-but-not-blocking, matching the original review's own deliberate tiering.

This ADR does not edit `foundation-architecture.md`. Per Constitution §6 (Decision Hierarchy) and `ADR-011`'s no-silent-edit rule, this ADR is the authoritative operational correction to Step 0's scope, adopted alongside the frozen Foundation Architecture document rather than rewriting it. `foundation-architecture.md` §9 remains historically intact, unedited, and accurate to what was understood at its own drafting time; a reader consulting §9 directly should be pointed to this ADR for the operationally-corrected scope.

### Alternatives Considered

- **Edit `foundation-architecture.md` §9 directly to match `implementation-plan.md`.** Rejected — it is frozen, approved Project Brain v1.1 content; a direct edit would violate the "do not change Project Brain" / "do not redesign the Foundation" discipline maintained throughout this Phase 0 process, and would contradict ADR-011's explicit no-silent-edit rule. An ADR is the correct mechanism to record a correction without altering frozen text.
- **Amend ADR-001 instead of creating a new ADR.** Rejected, per explicit instruction. ADR-001's existing Amendment confirms only 2 of the 4 items (`proxy.ts`, newsletter rate limiting) by direct repository inspection; it never asserted caching was P0. The discrepancy does not originate in ADR-001's own text — it originates in `foundation-architecture.md` §9's summary bullet — so a standalone ADR keeps this correction traceable to its own specific decision rather than folding an unrelated §9 correction into ADR-001's inspection-focused amendment.
- **Adopt `foundation-architecture.md` §9's list as-is, treating Implementation Plan as outdated.** Rejected — Implementation Plan is the more granular, effort-estimated, file-level output of the same review that produced the original audit findings, reflecting a later and more careful tiering pass than §9's own high-level summary. Dropping its explicitly-flagged P0 XSS item in favor of a P1 item would be a real scope regression, not a neutral editorial choice.

## Consequences

Phase 0's next implementation command is now unambiguously scoped to `implementation-plan.md`'s 4 P0 items. Content-read caching remains real, tracked work — the first P1 item to pick up once Step 0 closes — not silently dropped. `foundation-architecture.md` §9's text is unedited and remains a historically accurate record of Foundation Architecture's own drafting-time understanding; this ADR is the record of the correction, not a replacement for that history. Future Foundation Build Order-adjacent work should check both `foundation-architecture.md` §9 and `implementation-plan.md`'s tiering before assuming either is unilaterally authoritative — this is the second time in this project's history that two independently-produced planning documents have needed reconciliation (the first being the Master Product Blueprint's own dependency-map correction during Foundation Review), and it is exactly the kind of gap the Review Gate discipline exists to catch, in this case one that slipped past the original Foundation Review Gate's own scope.

## Future Impact

If `implementation-plan.md` is ever revised (new findings, re-estimated effort, re-tiering), any resulting change to what counts as "Phase 0 Step 0" should be handled the same way this ADR was — a new ADR or an amendment to this one, adopted through the Constitution's ADR Governance Workflow (§17) — never a silent edit to either `foundation-architecture.md` or `implementation-plan.md`'s tier assignments without a corresponding ADR.

## References

- `ADR-001-core-platform.md` (Amendment section — establishes the Step 0 re-sequencing concept this ADR corrects the item list for; not itself amended by this ADR)
- `ADR-011-phase-0-start.md` (Phase 0's frozen baseline and no-silent-edit rule, which this ADR complies with rather than circumvents)
- `brain/00_constitution/00_constitution.md` §6 (Decision Hierarchy — this is an architecture/domain-model matter, correctly resolved via ADR rather than Constitutional amendment) and §17 (ADR Governance Workflow — this is the first ADR proposed under that workflow; it has no authority until Human Approval Authority sign-off is recorded, and must be indexed in `DECISIONS.md` in the same commit that adopts it)
- `brain/BLUEPRINTS/foundation-architecture.md` §9 (Foundation Build Order — the document whose Step 0 item list this ADR operationally corrects, without editing it)
- `brain/BLUEPRINTS/implementation-plan.md` P0 tier (the adopted, authoritative source for Step 0's actual scope)
