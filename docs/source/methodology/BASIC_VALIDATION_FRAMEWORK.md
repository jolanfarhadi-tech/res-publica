# Basic Validation Framework

```
Type: Methodology (Core Module)
Status: Substantially specified — architecture only; implementation not started
Version: 1.0 (Annex 05 — Res Publica Governance Framework)
Extends/Reconciles with: docs/source/methodology/AHIP.md (Workflow step 3, "Basic Validation"),
  docs/source/methodology/STRUCTURED_HEARINGS.md (Workflow step 4, "Internal Validation"),
  brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md §7 (Scientific Review)
```

## Purpose

The Basic Validation Framework establishes the minimum quality control process that every submitted case, evidence package, and Structured Hearing must pass before entering the HARM ecosystem's Scientific Review queue. **Its purpose is not to determine whether a claim is true or false**, but to ensure that submitted information is complete, structured, traceable, and suitable for further scientific and governance review. Basic Validation is the first quality gate of the HARM platform.

**This is the full specification of a concept already named, but not yet detailed, in two other canonical documents:** `AHIP.md`'s Workflow step 3 ("Basic Validation — the moderator assesses completeness and coherence") and `STRUCTURED_HEARINGS.md`'s Workflow step 4 ("Internal Validation"). Both are the same gate — this document is now its single canonical owner; both source documents are updated to reference it rather than independently describe it.

## Mission

To ensure that every incoming case meets the minimum documentation, evidence, and metadata requirements before entering the scientific validation process.

## Objectives

Improve data quality; detect incomplete submissions; reduce duplicate cases; standardize case documentation; ensure traceability; verify required metadata; prepare cases for Scientific Review; improve consistency across the platform.

## Scope

Applies to AHIP submissions, Structured Hearings, evidence packages, documents, multimedia evidence, case metadata, harm classifications, community submissions, and institutional reports.

## Core Principles

1. **Completeness** — every submission contains the minimum required information.
2. **Consistency** — submitted information contains no obvious internal contradictions.
3. **Traceability** — every document, file, and evidence item is traceable to its source.
4. **Neutrality** — validation checks documentation quality, not the political, legal, or moral validity of the content.
5. **Transparency** — validation criteria are documented and applied consistently.
6. **Reproducibility** — different reviewers applying the same criteria reach similar validation outcomes.

## Definitions

**Validation Status** (this gate's own status field — distinct from, and prior to, Scientific Review's `draft → expert_reviewed → hearing_documented → codex_validated → published → signal_released` state machine, `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7 — the Level 2 state is named `hearing_documented`, not `hearing_validated`, since Structured Hearings document, not validate). A submission reaches Scientific Review's `draft` state only after passing this gate:
- **Valid** — ready for Scientific Review.
- **Valid with Minor Issues** — accepted with recommendations for correction.
- **Incomplete** — additional information required.
- **Duplicate** — merged with an existing case after review.
- **Invalid Submission** — rejected due to missing minimum requirements.

**What Basic Validation does NOT do:** determine legal responsibility; verify historical truth; judge political claims; conduct scientific peer review; make governance decisions; assess ethical acceptability. Those functions belong to Scientific Review and later stages — explicitly not redefined or preempted here.

**Boundary with Documentation Quality Review (DQR), `docs/source/methodology/DOCUMENTATION_QUALITY_REVIEW.md`:** Basic Validation checks whether a *submission* has the required data to proceed (existence of fields, evidence, and metadata) — a one-time intake gate. DQR checks whether a *document artifact itself* is well-formed (template compliance, structure, technical/editorial quality) — an ecosystem-wide, recurring check, not limited to intake. Where both examine metadata or evidence, Basic Validation asks whether it exists; DQR asks whether it is well-authored. Neither redefines the other.

## Framework

**Validation Checklist:**
- **Case Information:** Case ID, date, location, Harm Category, description, reporter type.
- **Metadata:** complete metadata, file references, source identifiers, timestamps, version information.
- **Evidence:** evidence attached, evidence descriptions, evidence source documented, file readability, accepted formats.
- **Documentation:** legible, complete, structured, consistent.
- **Classification:** correct Harm Category, correct taxonomy mapping (National Harm Taxonomy, `ADR-021` — not a separate taxonomy), appropriate severity level, geographic assignment, stakeholder assignment.

**Relationship with Other Frameworks:** receives data from AHIP, Structured Hearings, and Platform Services. Provides validated inputs to the Scientific Review Governance Gate, Harm Codex, Responsibility Mapping, and the Repair Framework. None of these is redefined here.

## Workflow

Submission → Metadata Check → Required Fields Check → Duplicate Detection → Evidence Inventory Check → File Integrity Check → Classification Review → Validation Status → Scientific Review Queue.

This workflow occurs **after** AHIP's Evidence Collection (step 4) and Structured Hearings' Evidence Coding (step 3), and **before** Scientific Review Level 1 (Expert Review) — it is the single, shared gate both upstream documents hand off to, not two separate gates.

## Roles

**Intake Coordinator, Validation Officer, Research Assistant, Platform Administrator** — Phase 2, not yet formally appointed. **Scientific Reviewer** — the next stage, not this gate's own role.

## Inputs

A submission from AHIP or a Structured Hearing.

## Outputs

Validation Status, Validation Report, Metadata Report, Missing Information List, Duplicate Alerts, Scientific Review Request.

## Governance

**Quality Controls:** required field verification, metadata verification, duplicate detection, file integrity checks, format validation, taxonomy consistency checks, audit logging (extends `AuditLog`, LOCKED Core Domain Model — not a new logging mechanism).

**Quality Assurance indicators:** completeness rate, duplicate detection rate, validation time, metadata accuracy, classification consistency, submission quality.

## AI Integration

Not specified beyond the general AI Governance boundary (`docs/source/governance/AI_POLICY.md`). Where a hearing used the **AI Hearing Facilitator** (`AI_HEARING_FACILITATOR.md`), its Documentation Gap List and Evidence Collection Checklist outputs may help a submission arrive more complete — advisory input only; the completeness determination itself remains this framework's own. "AI-assisted metadata validation," "automated duplicate detection," and "smart taxonomy suggestions" are named only as Future Enhancements (below), not current scope — no validation decision is AI-originated.

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

AI-assisted metadata validation, automated duplicate detection, file integrity automation, smart taxonomy suggestions, OCR validation, multilingual validation support, real-time quality scoring.

## MVP Status

**Current Role:** Core Operational Module. **Blocking Status:** MVP CRITICAL. **Implementation Priority:** Phase 1. **Current Requirement:** architecture now specified (this document); **implementation has not started** — no validation rule engine, dashboard, or duplicate-detection service exists yet in this repository.

## TODO (implementation — not started)

- [ ] Implement automated validation rules.
- [ ] Create validation dashboards.
- [ ] Build duplicate detection services.
- [ ] Integrate taxonomy validation (against the National Harm Taxonomy, not a new one).
- [ ] Add multilingual validation support.
- [ ] Connect with the Scientific Review workflow.
- [ ] Develop validation analytics.

## References

`docs/source/methodology/AHIP.md`; `docs/source/methodology/STRUCTURED_HEARINGS.md`; `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7

## Related Documents

`../methodology/AHIP.md` · `../methodology/STRUCTURED_HEARINGS.md` · `../methodology/HARM_CODEX.md` · `../methodology/DOCUMENTATION_QUALITY_REVIEW.md` · `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`
