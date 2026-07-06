# ADR: Dual Intake and Review Paths

## Status
Accepted

## Context

The consistency review of `docs/source/projects/INNOVATION_STRUCTURE.md` (prior session turn) identified a Critical Finding: "Structured Hearing" and "Expert Review" appear in opposite order across two canonical documents —

- `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` §Framework: `Structured Hearing → ... → Expert Review`
- `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7 (Scientific Review, Levels 1–2): `Expert Review → Structured Hearing`

Both orderings were flagged as unresolved and explicitly not silently reconciled, per the reviewing instruction at the time.

The human architecture decision is: **this is not a contradiction.** The two documents describe two different, genuinely distinct entry paths into the ecosystem, each with its own internally consistent reason for its ordering. This ADR records that decision.

## Decision

Two valid workflows exist side by side, converging after Codex Validation:

### 1. Primary Lifecycle (Innovation / Fellowship Path)

```
Citizen Experience
  → AHIP Intake
  → Structured Hearing
  → Expert Review
  → Narrative Coding
  → Codex Validation
  → Responsibility Mapping Lab
  → Responsibility Dashboard
  → Responsibility Annexes
  → Civic Intelligence
  → Policy & Action Lab
  → Responsibility Observatory
```

A live citizen shares their account in full (Structured Hearing) before Expert Review substantiates and contextualizes what was heard. This is the ordering already stated in `01_HARM_OPERATING_SYSTEM.md` §Framework — **unchanged, and correct within its own context.**

### 2. Direct Annex Path (Evidence-Origin Path)

```
External Evidence / Direct Submission
  → AHIP Intake (if applicable)
  → Initial Expert Review
  → Structured Hearing
  → Narrative Coding
  → Codex Validation
  → Responsibility Annexes
```

Evidence arriving without a live citizen at its center (external documentation, direct submission) is triaged by an Initial Expert Review first, to determine whether convening a resource-intensive Structured Hearing is warranted at all, before one is scheduled. This is the ordering already stated in `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7 (Scientific Review Levels 1–2) — **unchanged, and correct within its own context.**

### Why the orders genuinely differ

- **Primary Lifecycle:** the Hearing *is* the evidence-gathering act — nothing substantive exists to review until it happens.
- **Direct Annex Path:** evidence already exists before any Hearing is considered — Expert Review's role is to determine whether a Hearing is warranted, not to substantiate one that already occurred.

These are two different operational realities, not one lifecycle described inconsistently.

### Convergence

Both paths converge after Codex Validation. From that point, the Primary Lifecycle continues into Responsibility Mapping Lab → Dashboard → Annexes → Civic Intelligence (and, where applicable, the proposed Policy & Action Lab / Responsibility Observatory extensions — see Note, below), while the Direct Annex Path converges directly into Responsibility Annexes, entering the same downstream Blockchain Annex Block / Civic Contribution Mapping flow described in `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §2.

**"Narrative Coding" in both paths above encompasses the full Level 3 of Scientific Review** (Narrative Coding + Normative Alignment + Comparative Analysis, per `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7) — named here at the same level of summary as the rest of both paths, not as a simplified or competing version of that Level's internal detail.

## Note on Innovation 6/7

The Primary Lifecycle path above names Policy & Action Lab and Responsibility Observatory for completeness, consistent with how `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_LAYER.md` already describes them. **Their inclusion here does not constitute formal adoption into the canonical 5-Innovation list** in `01_HARM_OPERATING_SYSTEM.md` — that remains a separate, still-open decision, per `ADR-019`'s Open Question 1. This ADR resolves the ordering conflict only; it does not resolve that separate open question.

## Existing Documents Remain Correct — Not Modified

- `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` — unchanged. Its ordering describes the Primary Lifecycle Path.
- `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` — unchanged. Its ordering describes the Direct Annex Path.
- No lifecycle ordering inside either document is altered by this ADR.

## Minimal Cross-References Added

- `docs/source/projects/INNOVATION_STRUCTURE.md`'s "Known Architecture Decision Needed" callout is updated to mark this conflict **RESOLVED**, pointing to this ADR, per repository convention (Version bump, not a content rewrite).
- `brain/DECISIONS.md`'s pending-ADR index gains one new row for this ADR.

No other document is modified. No LOCKED file is touched. No existing document is recreated.

## Consequences

- The Critical Finding from the prior consistency review is resolved: the ordering difference is now documented as intentional, not contradictory.
- Future work extending either path should reference this ADR rather than re-deriving the reasoning for either order.
- The two paths' convergence point (Codex Validation → Responsibility Annexes) is now the explicit, canonical join — any future divergence introduced after that point in either document would itself be a new inconsistency to flag.

## Alternatives Considered

- **Edit one document to match the other's order.** Rejected — both orders are independently justified once correctly understood as two distinct paths, not one lifecycle described twice; forcing one to match the other would destroy real information.
- **Merge the two paths into a single hybrid order.** Rejected — this would blur two genuinely different operational realities (live-citizen-first vs. evidence-first) into an order that fits neither well.
- **Leave the conflict flagged indefinitely without a decision.** Rejected — the prior review explicitly deferred this to a human architecture decision; this ADR is that decision.
