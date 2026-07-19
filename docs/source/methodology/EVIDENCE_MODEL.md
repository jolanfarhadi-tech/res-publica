# Evidence Model

```
Type: Methodology (Core Module, cross-cutting epistemic framework)
Status: Substantially specified — architecture only; implementation not started
Version: 1.0
Extends/Reconciles with: docs/source/methodology/AHIP.md, docs/source/methodology/BASIC_VALIDATION_FRAMEWORK.md,
  docs/source/methodology/STRUCTURED_HEARINGS.md, docs/source/methodology/DOCUMENTATION_QUALITY_REVIEW.md,
  docs/source/methodology/SCIENTIFIC_REVIEW.md, docs/source/methodology/HARM_CODEX.md,
  docs/source/methodology/REPAIR_FRAMEWORK.md
```

## Purpose

The Evidence Model establishes the epistemic foundation of the HARM ecosystem (the source specification for this document names the ecosystem "GGAP" — treated here as the same ecosystem already built throughout this repository, not a second, parallel system; "GGAP" is not used further). Its purpose is to define how observations, claims, testimonies, documents, and other information are transformed into accountable evidence through standardized processes of collection, documentation, evaluation, validation, confidence assessment, and traceability.

The Evidence Model does not determine whether a statement is absolutely true or false. Instead, it establishes whether sufficient evidence exists to responsibly support governance, scientific review, harm recognition, and repair. The Evidence Model provides the common evidential language used throughout the ecosystem.

**Disambiguation:** this is unrelated to `brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md`, which governs a different subject — verifying a *contributor's* volunteer/civic activity record (extending `AuditLog`). This document governs *harm-claim* evidence (testimony, documents, hearing records) moving toward Scientific Review. Same word, unrelated domains — neither redefines the other.

## Mission

To transform heterogeneous information into structured, transparent, traceable, and reviewable evidence that supports responsible governance and adaptive societal repair.

## Objectives

Establish a common evidence standard; distinguish information from evidence; improve evidence quality; increase transparency; support reproducibility; strengthen accountability; support scientific review; enable evidence-based governance; reduce unsupported decision-making.

## Scope

Applies to every piece of information entering the ecosystem: AHIP case submissions, Structured Hearings, interviews, witness testimony, expert opinions, institutional documentation, scientific publications, official records, multimedia, digital records, administrative datasets, AI-assisted analytical outputs.

## Core Question

"Is there sufficient, transparent, traceable, and reviewable evidence to support this claim?" It does not answer: Is someone guilty? Is a policy correct? How should society respond? Which repair strategy should be selected? Those questions belong to later governance modules (Repair Framework and beyond).

## Epistemic Philosophy

Within the ecosystem: **Information is not evidence. Evidence is not truth.** Evidence is structured information whose quality has been evaluated through transparent and reproducible procedures.

```
Observation → Claim → Evidence Collection → Evidence Assessment →
Confidence Assessment → Validated Evidence → Governance Knowledge
```

This separation prevents governance decisions from relying on assumptions or unsupported assertions.

## Core Principles

1. **Evidence Before Interpretation** — evidence is evaluated before conclusions are drawn.
2. **Transparency** — every evidential conclusion is explainable.
3. **Traceability** — every evidence item remains linked to its origin.
4. **Reproducibility** — independent reviewers can reproduce the reasoning process.
5. **Neutrality** — evidence evaluation is independent from political, ideological, or personal preferences.
6. **Accountability** — every evidential assessment identifies responsible reviewers and review history.
7. **Uncertainty** — uncertainty is documented rather than hidden.

## Definitions

**Evidence Lifecycle** (a cross-cutting, evidence-quality-focused *view* of stages already established — it does not add, remove, or reorder any stage of the canonical 12-stage HARM Lifecycle, `HARM_LIFECYCLE.md`):

```
Observation → Claim → AHIP Registration → Basic Validation → Evidence Collection →
Documentation → Documentation Quality Review → Evidence Assessment → Confidence Assessment →
Scientific Review (concluding in the Scientific Review Decision Gate) → Harm Codex → Governance Decision Support
```

"Observation" and "Claim" describe, from an epistemic angle, what the HARM Lifecycle's existing Citizen Experience / Responsibility Biography Lab stage already covers (`RESPONSIBILITY_BIOGRAPHY_LAB.md`) — not new stages preceding it. "Governance Decision Support" hands off to the HARM Lifecycle's existing Community Learning / Institutional Learning / Governance Improvement stages, not a new terminal endpoint. (This is a distinct term from the Scientific Review Decision Gate, below — "Governance Decision Support" is this lifecycle's terminal handoff; the Scientific Review Decision Gate is Scientific Review's own internal Level 4 checkpoint.)

**The Scientific Review Decision Gate is Scientific Review's own Level 4 (Governance Review Gates)** — the point at which methodological evaluation (Scientific Review's main work) concludes and governance-requirements are confirmed before Harm Codex entry. It is not a separate, additional framework alongside Scientific Review, and not a separate subsequent stage — it is depicted as part of the same box as Scientific Review in the diagrams above and below. **Terminology retirement:** "Validation Framework" is no longer used as an alias for Scientific Review anywhere in this repository — the repository's one canonical validation-named document is `BASIC_VALIDATION_FRAMEWORK.md`, an unrelated, submission-level gate. "Governance Validation" is likewise retired as an internal term — it has been fully replaced by **Scientific Review Decision Gate** throughout this document. Scientific Review is referred to as the **Scientific Review Governance Gate** (in cross-references from other documents) or the **Scientific Review Decision Gate** (for its own internal Level 4 decision point) — these are the only two canonical names; neither "the Validation Framework" nor "Governance Validation" is used.

**Confidence Assessment vs. Scientific Confidence Levels** — two distinct, sequential stages, not one. Full detail: see Confidence Architecture, below.

**"Grammar of Repair," referenced in the source specification, is an alias for the already-specified Repair Framework** (`REPAIR_FRAMEWORK.md`) — not a new stage. It operates only after sufficient evidential confidence has been established, consistent with Repair Framework's own trigger ("Validated Harm = a validated, Scientific-Review-approved Annex").

**Resolves a previously-flagged gap:** `AHIP.md` and `STRUCTURED_HEARINGS.md` both referenced an "Evidence Standards Annex" that did not exist anywhere in this repository. This document's Evidence Quality Assessment criteria (below) substantially fulfill that reference — authenticity, reliability, relevance, completeness, consistency, traceability all appear in both; this document additionally specifies timeliness, contextual integrity, and corroboration. `AHIP.md` and `STRUCTURED_HEARINGS.md` are updated to point here instead of continuing to flag the gap.

## Confidence Architecture

Two completely independent confidence systems exist across the pipeline. This subsection makes their relationship explicit.

### Evidence Confidence

Evidence Confidence measures the strength, quality, completeness, corroboration, traceability, and reliability of the available evidence. It is established by the Evidence Model after Evidence Assessment. Its purpose is to describe the evidential support available *before* Scientific Review. **It does NOT evaluate scientific quality.**

### Scientific Confidence

Scientific Confidence measures the confidence of scientific reviewers in their scientific assessment. It is established only during Scientific Review (`SCIENTIFIC_REVIEW.md`). It evaluates methodology, scientific rigor, reproducibility, analytical quality, and review consensus.

Scientific Confidence never replaces Evidence Confidence. Evidence Confidence never replaces Scientific Confidence. **Both confidence systems are sequential and independent.**

## Position within the Governance Pipeline

Evidence Confidence is established after:

```
Evidence Collection → Evidence Assessment
```

and before:

```
Scientific Review
```

The resulting Evidence Profile becomes part of the review package submitted to Scientific Review. Scientific Review may use the Evidence Profile but remains completely independent. **Scientific Review independently evaluates the submitted evidence. Scientific Review shall not modify, replace, or overwrite the original Evidence Assessment. Any disagreement shall be documented through the Scientific Review process.**

### Evidence Flow

```
Observation
    ↓
Evidence Collection
    ↓
Evidence Assessment
    ↓
Evidence Confidence
    ↓
Evidence Profile
    ↓
Basic Validation
    ↓
Documentation Quality Review
    ↓
Scientific Review (concluding in the Scientific Review Decision Gate)
    ↓
Harm Codex
    ↓
Repair Framework
```

This diagram represents the canonical evidence pipeline. It does not add, remove, or reorder any stage already established elsewhere — it is a focused, evidence-centric view of the same pipeline described in the Evidence Lifecycle (above) and the HARM Lifecycle (`HARM_LIFECYCLE.md`). **The Scientific Review Decision Gate is depicted as part of the same box as Scientific Review, not a separate subsequent stage** — it is Scientific Review's own Level 4, consistent with the Definitions above; it does not occur after Scientific Review completes.

### Architectural Constraint

Evidence Confidence and Scientific Confidence are distinct governance concepts. Evidence Confidence answers: *"How well is the claim supported by evidence?"* Scientific Confidence answers: *"How confident are scientific reviewers in their scientific evaluation?"* **These concepts shall never be merged, renamed, or used interchangeably.**

## Framework

**Evidence Sources:** Structured Community Hearings, Structured Expert Hearings, Institutional Hearings (these three are the already-canonical Hearing Types from `STRUCTURED_HEARINGS.md` — Community, Expert, Institutional — not new hearing types), interviews, witness testimony, official documents, scientific publications, administrative records, public records, multimedia, digital records, sensor data, AI-assisted analysis.

**Evidence Types:** Primary, Secondary, Documentary, Scientific, Expert, Witness, Institutional, Digital, Quantitative, Qualitative Evidence. This is a classification of evidence *form*, distinct from the National Harm Taxonomy's classification of *harm* (`HARM_CODEX.md`, `ADR-021`) — neither redefines the other.

**Evidence Quality Assessment criteria:** Authenticity, Reliability, Relevance, Completeness, Consistency, Traceability, Timeliness, Contextual Integrity, Corroboration. Independent evidence sources may strengthen confidence; **corroboration does not establish truth — it strengthens evidential support.**

**Contradiction Management.** Conflicting evidence is preserved — never removed simply because it contradicts another source. Recorded instead: contradictions, competing interpretations, confidence differences, unresolved questions. Human review determines the next step.

**Evidence Weighting** considers: source reliability, methodological quality, corroboration, independence, reproducibility, contextual relevance. Weighting supports expert judgment but never replaces it.

**Chain of Evidence** (the generic per-item template, distinct from but consistent with the fuller Evidence Lifecycle above): Collection → Registration → Documentation → Assessment → Review → Validation → Archiving → Future Reassessment. Every evidence item remains traceable throughout.

**Relationship with Other Frameworks:**
- **AHIP** — registers and structures incoming claims before evidence evaluation begins.
- **Basic Validation Framework** — ensures minimum documentation and metadata requirements are satisfied.
- **Structured Hearings** — generate observations, testimony, and contextual information that may become evidence (consistent with "Reflection ≠ Validation" — these are inputs, not already-validated conclusions).
- **Documentation Quality Review** — verifies documentation is complete, consistent, and suitable for evidence assessment.
- **Scientific Review** — evaluates the methodological validity of evidence generation.
- **Harm Codex** — uses validated evidence to determine whether a Harm Code can be assigned.
- **Repair Framework** ("Grammar of Repair") — operates only after sufficient evidential confidence has been established.

None of these is redefined here — this document supplies the epistemic vocabulary they all already implicitly relied on.

## Workflow

See Evidence Lifecycle (Definitions, above). This document's own operational step — Evidence Assessment / Confidence Assessment — sits between Documentation Quality Review and Scientific Review. No stage of the HARM Lifecycle, Structured Hearings' Workflow, or Scientific Review's four-level pipeline is added, removed, or reordered by this document.

## Roles

Evidence evaluation is performed by existing roles already defined elsewhere (Researcher, Reviewer, Scientific Review Committee) — this document does not introduce new role names.

## Inputs

Observations, claims, testimony, documents, records, and AI-assisted analytical outputs entering the ecosystem through AHIP, Structured Hearings, or other evidence sources.

## Outputs

Evidence Profiles, Confidence Scores (preliminary — see Definitions), Evidence Assessments, Corroboration Reports, Evidence Metadata, Chain of Evidence Records, Evidence Readiness Reports, Scientific Review Inputs.

## Governance

Every evidential assessment identifies responsible reviewers and review history (Core Principle 6). Contradiction Management ensures no evidence is silently discarded.

## Implementation Note

This document is a normative architecture specification, not merely descriptive documentation. When implementing this module: preserve the conceptual architecture exactly as defined; do not merge this module with Scientific Review, with Basic Validation Framework, or with Documentation Quality Review; do not move the Evidence Repository into this module — repositories belong to Platform Services, not the Evidence Model; maintain strict separation of responsibilities between all governance modules. Use this document as the authoritative specification for implementation.

**The Evidence Model is responsible for:** defining what qualifies as evidence; managing evidence metadata; assessing evidence quality; assessing evidence confidence (preliminary — see Definitions); managing corroboration; managing contradiction; managing evidence weighting; maintaining the Chain of Evidence; producing evidence profiles; defining evidence confidence levels (its own preliminary scale, not Scientific Review's); managing evidence provenance and traceability.

**The Evidence Model is NOT responsible for:** case intake (AHIP); Basic Validation; Documentation Quality Review (DQR); scientific peer review; governance approval processes; harm classification; repair planning; governance decisions; legal judgments; policy decisions; AI-assisted recommendations (the Evidence Model may *consume* AI assistance within its own scope, per AI Integration below, but does not own AI capability governance — that remains `docs/source/governance/AI_POLICY.md`'s responsibility).

## AI Integration

AI may support: evidence organization, metadata generation, document classification, similarity analysis, corroboration support, contradiction detection, evidence retrieval. **AI may assist in estimating preliminary Evidence Confidence using predefined assessment criteria. Final Evidence Confidence always requires human review. AI shall never assign Scientific Confidence. AI shall never replace scientific reviewers.** AI shall not: establish factual truth, replace scientific review, assign legal responsibility, determine accountability, override governance procedures. Human oversight remains mandatory — consistent with `docs/source/governance/AI_POLICY.md`'s Restricted AI Functions.

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

Not specified in the source material beyond what is already listed under AI Integration.

## MVP Status

**Current Role:** Core Operational Module, cross-cutting epistemic framework. **Blocking Status:** MVP IMPLEMENTED (backend). **Implementation Priority:** Phase 1 delivered. **Current Requirement:** evidence metadata, nine quality criteria, contradictions, corroboration references, preliminary human-confirmed Evidence Confidence, protected persistence, and atomic audit events are implemented. Automated detection and dashboards remain non-blocking; Scientific Confidence remains separate.

## Remaining implementation work (non-blocking)

- [ ] Design the Evidence Profile and Chain of Evidence data structures.
- [ ] Implement preliminary Confidence Assessment scoring, distinct from Scientific Review's own Confidence Levels.
- [ ] Build contradiction and corroboration detection tooling (AI-assisted, human-reviewed).
- [ ] Integrate Evidence Quality Assessment criteria into AHIP and Structured Hearings' existing evidence-collection steps.
- [ ] Connect Evidence Readiness Reports to Basic Validation Framework and Documentation Quality Review.

## References

`docs/source/methodology/AHIP.md`; `docs/source/methodology/STRUCTURED_HEARINGS.md`; `docs/source/methodology/SCIENTIFIC_REVIEW.md`

## Related Documents

`../methodology/AHIP.md` · `../methodology/BASIC_VALIDATION_FRAMEWORK.md` · `../methodology/STRUCTURED_HEARINGS.md` · `../methodology/DOCUMENTATION_QUALITY_REVIEW.md` · `../methodology/SCIENTIFIC_REVIEW.md` · `../methodology/HARM_CODEX.md` · `../methodology/REPAIR_FRAMEWORK.md`
