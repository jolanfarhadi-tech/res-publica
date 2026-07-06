# Scientific Review

```
Type: Methodology (Core Module)
Status: Substantially specified — architecture only; implementation not started
Version: 1.0 (Annex 04 — Res Publica Governance Framework)
Extends/Reconciles with: brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md §7
  (the canonical 4-level pipeline, 8 Review Criteria, 8 Governance Guardrails, and lifecycle state
  machine — NOT redefined here), docs/source/methodology/BASIC_VALIDATION_FRAMEWORK.md,
  docs/source/methodology/HARM_CODEX.md
```

## Purpose

The Scientific Review Framework establishes the formal scientific evaluation process for all validated cases, evidence packages, research outputs, and analytical findings within the HARM ecosystem. Its purpose is to ensure that every conclusion entering the HARM knowledge base is evidence-based, methodologically sound, transparent, reproducible, and scientifically defensible. **Scientific Review is not a political review, legal review, or ethical approval process** — it is an independent quality assurance mechanism for scientific rigor.

**Relationship to `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7 — read this first:** that document remains the canonical source for Scientific Review's four-level pipeline (Expert Review, Structured Hearing, Narrative Coding + Normative Alignment, Governance Review Gates), its 8 formal Review Criteria, its 8 Governance Guardrails, and its lifecycle state machine — **none of that is redefined here.** This document specifies the *internal working process* a reviewer follows once material reaches Level 4 (Governance Review Gates) — operational detail that sits inside, not alongside, that existing pipeline.

## Mission

To transform validated evidence into scientifically reliable knowledge that supports accountability, governance improvement, policy development, and societal repair.

## Objectives

Ensure scientific quality; evaluate methodological rigor; verify evidence consistency; reduce bias; increase transparency; promote reproducibility; improve research credibility; strengthen governance decisions through science; support continuous learning.

## Scope

Applies to AHIP Cases, Structured Hearings, Evidence Packages, Harm Assessments, Harm Codex Entries, Research Reports, Governance Analyses, Policy Assessments, indicators, and future research modules.

## Core Principles

1. **Scientific Integrity** — conclusions are based on transparent methods and verifiable evidence.
2. **Independence** — reviewers remain independent from political, institutional, and personal influence.
3. **Evidence-Based Assessment** — conclusions rely on available evidence rather than opinion.
4. **Reproducibility** — another qualified reviewer can understand and reproduce the reasoning process.
5. **Transparency** — assumptions, methods, limitations, and uncertainties are documented.
6. **Objectivity** — reviewers evaluate methodology and evidence, not ideology or personal belief.

## Definitions

**Reconciling the two criteria sets, explicitly, not silently:** `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7 already defines 8 formal Review Criteria (Clarity, Structural Accuracy, Analytical Depth, Internal Consistency, Normative Fit, Epistemic Condition, Ethical Compliance, Governance Applicability) — these are the Scientific Review Committee's **formal decision criteria** at Level 4. This document's more granular **working rubric** (16 items across 4 categories, below) is what an individual reviewer applies *before* that formal decision — the working rubric informs the 8 formal criteria; it does not replace or compete with them.

**Scientific Confidence Levels** (1–5: Preliminary, Limited Evidence, Moderate Confidence, Strong Evidence, High Scientific Confidence) — this is an additional field carried on the existing **Scientific Approval** record (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §3: "the reviewing members, the decision, the date, and any conditions attached"). It is not a new lifecycle state and does not replace the existing `draft → expert_reviewed → hearing_validated → codex_validated → published → signal_released` state machine.

**Scientific Outputs** (Accepted, Accepted with Minor Revisions, Major Revision Required, Insufficient Evidence, Rejected for Scientific Reasons) — this is the granular vocabulary for the existing binary "approve / return for revision" decision at Level 4 Governance Review Gates, not a new decision authority.

## Framework

**Review Components** (the working rubric): Research Question, Methodology, Data Quality, Evidence Quality, Consistency, Logical Reasoning, Transparency, Limitations, Confidence Level, Replicability.

**Working Rubric, grouped:**
- **Evidence:** reliability, validity, sufficiency, authenticity.
- **Methodology:** appropriate methods, clear procedures, documented assumptions, scientific consistency.
- **Data:** completeness, quality, metadata, traceability.
- **Analysis:** logical coherence, internal consistency, appropriate interpretation, recognition of uncertainty.

**Relationship with Other Frameworks:** receives validated inputs from AHIP, Basic Validation (`BASIC_VALIDATION_FRAMEWORK.md`), Structured Hearings, and Evidence Standards (unresolved gap, already flagged elsewhere). Provides outputs to the Validation Framework (itself), Harm Codex, Responsibility Mapping, the Prioritization Framework (= Responsibility Dashboard's Priority Matrix), the Repair Framework, Civic Intelligence, and Early Warning. Operates alongside the Ethics Charter, AI Governance Framework, and DPIA. None of these is redefined here.

## Workflow

Validated Case (= output of Basic Validation Framework) → Scientific Assignment → Methodology Review → Evidence Review → Data Quality Assessment → Consistency Assessment → Scientific Findings → Reviewer Recommendations → Scientific Approval → Transfer to Harm Codex.

This workflow is the internal detail of `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7's Level 4 (Governance Review Gates) specifically — it does not add a fifth level, reorder the existing four, or bypass Levels 1–3.

**What Scientific Review does NOT do:** determine legal responsibility; verify historical truth in an absolute sense; judge political claims; make governance decisions; assess ethical acceptability (that is the Ethics Charter's and Ethics Board's role, unchanged).

## Roles

**Scientific Review Board** (= Scientific Review Committee, per the established reconciliation), Subject Matter Experts, Research Coordinators, External Reviewers, Platform Administration. **Reviewer Responsibilities:** evaluate evidence objectively; assess methodology; identify weaknesses; document limitations; declare conflicts of interest (per the existing Reviewer ≠ Contributor rule, `RESPONSIBILITY_EVIDENCE_MODEL.md`); maintain confidentiality; provide constructive recommendations.

## Inputs

A Validated Case (Basic Validation Framework output).

## Outputs

**Review Documentation** (per review): Scientific Review ID, reviewer(s), date, methodology assessment, evidence assessment, findings, confidence level, recommendations, decision, version. Scientific Review Reports, Evidence Assessments, Methodological Reviews, Confidence Ratings, Scientific Recommendations, Knowledge Validation, Governance Evidence Packages.

## Governance

**Quality Assurance:** independent review, peer review where appropriate, methodological consistency, documentation standards, audit logging, version control — consistent with, not additional to, the existing 8 Governance Guardrails in `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7.

## AI Integration

Consistent with the existing rule: AI never validates. "AI-assisted literature support" and "automated consistency analysis" are named only as Future Enhancements (below), not current scope.

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

Double-blind peer review, AI-assisted literature support, automated consistency analysis, cross-disciplinary review panels, reviewer accreditation, citation tracking, replication studies, scientific quality dashboards.

## MVP Status

**Current Role:** Core Operational Module. **Blocking Status:** MVP CRITICAL. **Implementation Priority:** Phase 1. **Current Requirement:** architecture now specified at the operational level (this document, reconciled with the existing pipeline-level specification); **implementation has not started** — no reviewer assignment system, review template, or confidence-scoring tool exists yet in this repository.

## TODO (implementation — not started)

- [ ] Establish the Scientific Review Board (= Scientific Review Committee) formally.
- [ ] Develop reviewer guidelines.
- [ ] Create standardized review templates.
- [ ] Define scientific confidence scoring mechanics.
- [ ] Build reviewer assignment workflows.
- [ ] Integrate with the Harm Codex.
- [ ] Implement review dashboards.
- [ ] Maintain reviewer conflict-of-interest declarations.

## References

`brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7; `docs/source/methodology/BASIC_VALIDATION_FRAMEWORK.md`

## Related Documents

`brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` · `../methodology/BASIC_VALIDATION_FRAMEWORK.md` · `../methodology/AHIP.md` · `../methodology/STRUCTURED_HEARINGS.md` · `../methodology/HARM_CODEX.md` · `../methodology/REPAIR_FRAMEWORK.md`
