# Documentation Quality Review (DQR)

```
Type: Methodology (Core Module, reusable governance capability)
Status: Substantially specified — architecture only; implementation not started
Version: 1.0 (Annex 06 — Res Publica Governance Framework)
Extends/Reconciles with: docs/source/methodology/BASIC_VALIDATION_FRAMEWORK.md (boundary split,
  see Definitions below), docs/source/methodology/AHIP.md, docs/source/methodology/STRUCTURED_HEARINGS.md,
  docs/source/methodology/SCIENTIFIC_REVIEW.md, docs/source/methodology/HARM_CODEX.md
```

## Purpose

The Documentation Quality Review (DQR) establishes the quality assurance process for **document artifacts** produced anywhere in the HARM ecosystem — reports, hearing records, evidence packages, metadata files, transcripts, and supporting documentation. Its purpose is to verify that a document artifact is complete, well-structured, consistent, traceable, and suitable for scientific review. **DQR evaluates documentation quality — not the truthfulness of evidence, the scientific validity of findings, or governance decisions.**

**Architecture decision — boundary split with Basic Validation Framework, not a duplicate.** DQR's checklist and outcome vocabulary closely resemble `BASIC_VALIDATION_FRAMEWORK.md`'s. Rather than merge or duplicate, the boundary is drawn explicitly: **Basic Validation Framework** is the intake-time gate on a *submission* (does the case have required fields, is it a duplicate, is evidence attached) — it runs once, at AHIP/Structured-Hearings intake, before the Scientific Review queue. **DQR** is an ecosystem-wide check on a *document artifact itself* (does this specific report/transcript/record follow its template, is it structurally sound, is it technically accessible and well-written) — it applies to any document produced anywhere in the ecosystem, not only at intake, and can recur whenever a new document artifact is produced (a later Research Document, an updated Case File, Meeting Minutes). See Definitions for the precise line between the two.

## Mission

To ensure that every document entering the HARM knowledge ecosystem satisfies the minimum standards of documentation quality, completeness, and traceability, regardless of when in the lifecycle it is produced.

## Objectives

Verify documentation completeness; ensure metadata quality; improve consistency; detect missing information; standardize documentation; support Scientific Review; improve long-term knowledge management.

## Scope

Applies to AHIP Case Files, Structured Hearing Reports, Interview Records, Evidence Packages, Transcripts, Meeting Minutes, Research Documentation, Case Metadata, Attachments, and Supporting Documents — **not limited to intake-time submissions**, unlike Basic Validation Framework. Any document artifact produced at any point in the HARM lifecycle is in scope.

## Core Principles

1. **Completeness** — required information is present in the document.
2. **Accuracy** — documentation accurately represents collected information.
3. **Traceability** — every document is traceable to its source.
4. **Consistency** — documentation follows approved standards.
5. **Transparency** — review findings are documented.
6. **Standardization** — documentation follows common templates and formats.

## Definitions

**The Basic Validation / DQR boundary, precisely:**
- **Basic Validation Framework** asks: *does this submission have the required data to proceed?* (Case Information, Required Fields, Duplicate Detection, evidence-existence, taxonomy mapping.) It runs once, at intake, gating entry to the Scientific Review queue. Its "Metadata" and "Evidence" checks are about the *submission record* — do the required fields and evidence exist at all.
- **DQR** asks: *is this document artifact itself well-formed?* (Document Structure/template compliance, technical file quality, content/editorial quality, cross-reference correctness as an authoring concern.) It runs on any document artifact, at any point documents are produced in the ecosystem — not solely at intake.
- Where both examine metadata or evidence linkage, they do so from different angles: Basic Validation checks *existence* (is evidence attached at all); DQR checks *authoring quality* (is the document's presentation of that evidence well-structured, legible, and correctly cross-referenced). Neither redefines the other.

**Quality Outcomes** (DQR's own, distinct from Basic Validation's Validation Status — these evaluate a document artifact, not a submission): Approved; Approved with Minor Corrections; Revision Required; Incomplete Documentation; Rejected.

## Framework

**Review Criteria:**
- **Document Structure:** correct template, required sections completed, version information, author identified.
- **Metadata** (of the document artifact itself): Case ID, date, location, participants, classification, references.
- **Evidence References** (authoring-quality check, not existence check): evidence linked, sources identified, attachments complete, cross-references valid.
- **Content Quality:** clear language, logical organization, internal consistency, missing information identified.
- **Technical Quality:** readable files, correct formats, accessible documents, complete attachments.

**Relationship with Other Frameworks:** receives inputs from AHIP, Structured Hearings, and Platform Services. Provides outputs to the Scientific Review Governance Gate, Harm Codex, and the Knowledge Repository. Operates downstream of, and distinctly from, Basic Validation Framework (see Definitions). None of these is redefined here.

## Workflow

Documentation Submitted → Template Compliance Check → Metadata Review → Completeness Review → Evidence Link Verification → Consistency Review → Quality Assessment → Approval → Scientific Review.

This workflow evaluates a document artifact and can run independently of, and in addition to, Basic Validation Framework's own submission-level workflow — the two gates are not sequential steps of a single pipeline but two distinct checks that may both apply to material passing through AHIP or Structured Hearings.

## Roles

**Documentation Reviewer, Research Coordinator, Case Manager, Platform Administrator** — Phase 2, not yet formally appointed.

## Inputs

Any document artifact produced within the HARM ecosystem.

## Outputs

Documentation Review Report, Documentation Quality Score, Metadata Assessment, Missing Information Report, Scientific Review Readiness Status.

## Governance

**Deliverables:** Documentation Quality Reports, Metadata Validation Reports, Readiness Certification, Documentation Improvement Recommendations.

## AI Integration

Consistent with the general AI Governance boundary (`docs/source/governance/AI_POLICY.md`). "AI-assisted document quality checks" is named only as a Future Enhancement (below), not current scope.

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

Enable AI-assisted document quality checks; automated template compliance validation; document version control integration.

## MVP Status

**Current Role:** Core Operational Module, reusable governance capability. **Blocking Status:** MVP IMPLEMENTED (backend). **Implementation Priority:** Phase 1 delivered. **Current Requirement:** protected, institution-scoped human DQR outcomes, findings, persistence, role enforcement, and atomic audit events are implemented separately from Basic Validation. Templates and dashboards remain non-blocking follow-up work.

## Remaining implementation work (non-blocking)

- [ ] Develop documentation templates.
- [ ] Create metadata validation rules.
- [ ] Implement document quality scoring.
- [ ] Build review dashboards.
- [ ] Integrate document version control.
- [ ] Enable AI-assisted document quality checks.

## References

`docs/source/methodology/BASIC_VALIDATION_FRAMEWORK.md`; `docs/source/methodology/AHIP.md`; `docs/source/methodology/STRUCTURED_HEARINGS.md`

## Related Documents

`../methodology/BASIC_VALIDATION_FRAMEWORK.md` · `../methodology/AHIP.md` · `../methodology/STRUCTURED_HEARINGS.md` · `../methodology/SCIENTIFIC_REVIEW.md` · `../methodology/HARM_CODEX.md` · `../methodology/HEARING_QUALITY_CHECK.md`
