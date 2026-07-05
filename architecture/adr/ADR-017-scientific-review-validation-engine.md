# ADR-017: Scientific Review as the Ecosystem's Validation Engine

## Status
Accepted

## Context

Before this decision, `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` (ADR-014/015/016) named "Scientific Review Committee" and "Scientific Approval" as a single review step in the Annex lifecycle, without internal structure. Separately, `brain/GOVERNANCE/EXECUTION_ALIGNMENT.md` (item 32) had already flagged "Validation Engine" as a Future Proposal, not approved, explicitly requiring a new ADR before adoption, and explicitly noting it must be distinguished from the existing Review & Validation Agent role (`ADR-004`).

The user's Scientific Review specification asks to define this capability in full: a four-level pipeline (Raw Testimony → Expert Review → Structured Hearing → Narrative Coding → Normative Alignment → Comparative Analysis → Codex Validation → Governance Review Gates → Approved Annex → Blockchain Annex Block), an eight-criterion review model, a set of governance guardrails including a newly-introduced Ethics Board veto authority, and a lifecycle state machine (draft → expert_reviewed → hearing_validated → codex_validated → published → signal_released).

Review of existing documents (AHIP, Structured Hearings, HARM Operating System, Responsibility Annexes, the Annex/Blockchain architecture, Contribution & Impact Framework, Responsibility Dashboard, `EXECUTION_ALIGNMENT.md`, ADR-014/015/016, and RPCS) confirmed: no document already defines this four-level structure, the eight Review Criteria, or an Ethics Board. "Validation Engine" existed only as an explicitly-flagged future proposal. "Ethics Protocol," "DPIA," and "Early Warning" are referenced by name in `WEBSITE.md`/project material as real, expected documents, but their full content is not present in this repository — consistent with the established discipline, no content for them is invented here.

## Decision

**Extended `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` in place** (new §7, "Scientific Review: The Validation Engine"), rather than creating a separate document, since the Scientific Review Committee/Approval concepts already lived there:

- Defined Scientific Review as **the validation engine that transforms subjective testimony into governance-grade validated evidence**, validating mechanisms and evidence quality, never people.
- Detailed the full pipeline as a Mermaid flowchart, reconciled explicitly with the existing §2 lifecycle (this pipeline is the internal structure of the existing "Annex Deepening → Evidence Package → Scientific Review Committee" segment, not a competing lifecycle).
- Defined all four Review Levels (Expert Review, Structured Hearing, Narrative Coding + Normative Alignment, Governance Review Gates), each with purpose, inputs, outputs, decision criteria, roles, and gate conditions.
- Adopted the eight-criterion Review Criteria model verbatim (Clarity, Structural Accuracy, Analytical Depth, Internal Consistency, Normative Fit, Epistemic Condition, Ethical Compliance, Governance Applicability).
- Adopted all eight Governance Guardrails verbatim, including the new **Ethics Board** — defined as a standing body distinct from the Scientific Review Committee, with veto-only authority at Level 4, never originating approvals.
- Added the lifecycle state machine as a Mermaid `stateDiagram-v2`, explicitly reconciled as a more granular, complementary state machine sitting alongside (not replacing) the Responsibility Evidence Model's existing Created→Evidence Submitted→Human Verification→Accepted/Rejected workflow. `signal_released` is documented as an optional terminal state tied to Early Warning, referenced by name only.
- **This resolves `EXECUTION_ALIGNMENT.md` item 32.** "Validation Engine" is now formally Scientific Review itself, explicitly distinguished from the Review & Validation Agent (`ADR-004`), which remains an AI-assisted reviewer role, not this validation process.

**Updated in place, not duplicated:**
- §9 Entity Relationship Diagram numbering shifted (renumbered §8→9, §9→10, §10→11) to accommodate new §7; diagram content unchanged (already consistent with the new detail).
- §10 System Integration gained four new bullets: AHIP, Codex Research, Early Warning, Validation Engine — the six systems from ADR-015/016 were already covered and are unchanged.
- §11 Validation gained two new compatibility checks (against `EXECUTION_ALIGNMENT.md` and against AHIP/RPCS/Harm Codex).
- `docs/source/glossary/TERMS.md` gained three entries: Scientific Review, Ethics Board, Review Criteria.
- `docs/source/methodology/RESPONSIBILITY_ANNEXES.md`'s direct-path Workflow step 2 now cross-references the four-level detail rather than describing Scientific Review Committee review as a single opaque step.

Neither ADR-014 nor ADR-015 required amendment — unlike ADR-014's Dashboard-positioning error (corrected via ADR-016's appended amendment), nothing in either document was factually wrong; this is purely additive detail, structured the same way ADR-015 extended ADR-014 without needing to amend it.

## Consequences

- Scientific Review is now a fully specified, four-level validation engine, not a single opaque committee-review step.
- The Ethics Board is introduced as a new governance role (veto authority only) — not a new domain entity in the LOCKED Core Domain Model.
- `EXECUTION_ALIGNMENT.md` item 32 (Validation Engine, Future Proposal, new ADR required) is resolved by this ADR.
- No content was fabricated for Early Warning, Ethics Protocol, or DPIA — all three are referenced by name only, consistent with their status as real, named, but not-yet-documented-in-this-repository systems.

## Alternatives Considered

- **Create a new standalone "Scientific Review" or "Validation Engine" document.** Rejected — the user's own framing ("core architecture capability, not an isolated document") and requirement 1 ("do not create duplicate concepts... extend the canonical architecture instead") both pointed to extending `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`, where Scientific Review Committee/Approval already lived.
- **Treat the Ethics Board as the same body as the Scientific Review Committee.** Rejected — the user's guardrail list named it as a separate body with veto authority; conflating the two would have obscured the specific veto-only power structure the specification calls for.
- **Invent Early Warning / Ethics Protocol / DPIA content to fully round out the integration list.** Rejected — no source material exists for any of the three in this repository; inventing institutional-policy content for real, named-but-undocumented systems would violate this session's standing fabrication discipline.
