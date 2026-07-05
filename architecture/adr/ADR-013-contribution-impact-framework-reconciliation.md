# ADR-013: Contribution & Impact Framework Reconciliation

## Status
Accepted

## Context

Two documents defined the Contribution & Impact Framework:

1. `brain/FOUNDATION/02_CONTRIBUTION_AND_IMPACT_FRAMEWORK.md` — created during Phase 1 preparation, structured as 9 sections (Contribution, Impact, Trust, Verification, Responsibility Evidence, Framework Relationships, Principles, Out of Scope, Validation).
2. `brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md` — created later in the same session from a detailed, explicit 14-section specification (Executive Summary, Philosophy, Core Principles, Contribution Lifecycle, Contribution Types, Responsibility Evidence, Verification, Trust, Impact, Recognition, AI Relationship, Governance, Explicitly Forbidden, Validation).

Both files sit in the same directory with near-identical, one-word-different filenames. Both cover Contribution, Impact, Trust, Verification, and Responsibility Evidence. Neither contradicted the other on any Constitutional principle (both are strictly Zero Gamification, both treat Trust as qualitative-never-numeric, both reuse the same locked Core Domain Model and Responsibility Evidence Model). This is a duplicate-document problem, not a substantive disagreement — exactly the "one concept, one canonical document" violation the organization's own governance principles (Constitution §6 Decision Hierarchy; the user-authored `docs/source/MASTER_SYSTEM.md`) require be resolved by merging rather than left standing.

One genuine structural difference was found: the two documents sequenced Trust differently relative to the Contribution lifecycle. Document 1's "Framework Relationships" placed Trust explicitly between Verification and Impact (`Contribution → Responsibility Evidence → Verification → Trust → Impact`). Document 2's "Contribution Lifecycle" omitted Trust from its 9-stage sequence entirely, describing it only as a property that accrues from verified Contribution. This was not a contradiction, but it was an inconsistency requiring an explicit resolution rather than a silent pick.

## Decision

**`brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md` is the sole canonical Contribution & Impact Framework.**

Reasoning:
- It was produced from the more detailed, more recently and more explicitly given specification (14 sections vs. 9), consistent with the precedence this session has already established for resolving near-duplicate source material (most detailed, most recent, most explicit wins, per `docs/source/DECISION_LOG.md` item 3).
- It has broader definitional and structural completeness: an Executive Summary, a fuller Philosophy section (Participation, Collective Responsibility, Learning, Transparency, Accountability — terms Document 1 did not define), an explicit Recognition section, an explicit AI Relationship section, and an explicit Governance section — none of which Document 1 had as standalone treatment.
- Document 1's genuinely unique, valuable content had no reason to be lost, so it was merged rather than discarded (see Migration below).

**Trust sequencing resolution:** Trust is now positioned in the canonical Contribution Lifecycle diagram between Verification and Knowledge Assets. This reconciles both documents' logic — Document 1's explicit sequencing of Trust as a stage, and Document 2's description of Trust as the accrued property that follows verification and precedes durable knowledge treatment. Trust is documented as the property that makes downstream stages (Knowledge Assets, Community Learning, Institutional Learning, Societal Impact) meaningful, not as a gate that blocks any single Contribution from being recorded.

## Migration

Content merged from the superseded document into the canonical document:
- The Verification method table (Method / Strength / Limitation, 8 methods) — merged into canonical §7 (Verification).
- The more granular Contribution category list (Knowledge, Community, Events, Governance, Financial, Technical, Documentation) — merged into canonical §5 (Contribution Types), deduplicated against the categories already present there.
- The Environmental Impact Platform "Future Proposal, not approved" caveat — merged into canonical §9 (Impact).

No content from the superseded document was discarded without being reviewed for inclusion.

## References Updated

- `docs/source/COMPATIBILITY_MAP.md` — `projects/IMPACT.md` row now points to the canonical filename.
- `docs/source/MIGRATION_LOG.md` — `projects/` section now cites the canonical filename and this ADR.
- `docs/source/projects/IMPACT.md` — Background, Definitions, Examples, and References sections all updated to the canonical filename; the Definitions section reference table updated from Document 1's taxonomy names to Document 2's final taxonomy names (Individual→Personal, Long-term→Policy added, per canonical §9).

## Archival

`brain/FOUNDATION/02_CONTRIBUTION_AND_IMPACT_FRAMEWORK.md` is retained as a redirect stub (not deleted), pointing to the canonical document and this ADR. It is preserved rather than removed so that git history and any existing external links resolve to an explanation rather than a broken reference. It carries no independent content and must not be extended.

## Consequences

- Exactly one canonical Contribution & Impact Framework document now exists.
- No architectural drift was introduced: no new entity, service, or governance mechanism was created during reconciliation — only merging, redirecting, and one sequencing clarification (Trust's position in the lifecycle diagram).
- Future edits to the Contribution & Impact Framework must be made to `brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md` only.

## Alternatives Considered

- **Keep both as distinct documents with different scope.** Rejected — both covered the same concepts (Contribution, Impact, Trust, Verification) with no genuine scope separation; keeping both would perpetuate exactly the duplicate-definition risk this ADR exists to close.
- **Make Document 1 canonical, discard Document 2.** Rejected — Document 2 was more complete and more recently, explicitly specified; discarding it would lose the Executive Summary, Recognition, and explicit AI Relationship/Governance sections it uniquely provides.
- **Hard-delete the superseded file instead of a redirect stub.** Rejected — a stub is safer and fully reversible, preserves git blame history, and satisfies "redirect all references to the canonical document" without an irreversible deletion.
