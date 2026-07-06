# Hearing Quality Check (HQC)

```
Type: Methodology (Core Module, reusable governance capability)
Status: Substantially specified — architecture only; implementation not started
Version: 1.1 (Annex 06 — Res Publica Governance Framework; renamed and re-established as standalone per architecture decision)
Extends/Reconciles with: docs/source/methodology/STRUCTURED_HEARINGS.md,
  docs/source/methodology/BASIC_VALIDATION_FRAMEWORK.md, docs/source/methodology/SCIENTIFIC_REVIEW.md
```

## Purpose

**HQC is the canonical hearing quality assurance framework of the Res Publica ecosystem and is reused by all hearing-based methodologies.** Its purpose is to evaluate whether a hearing session was conducted according to the required methodological, procedural, ethical, and documentation standards before its outputs become part of the official evidence base. **HQC evaluates the quality of the hearing process — not the truthfulness of participants or the validity of the evidence itself.**

**Architecture decision — HQC is a reusable governance capability, not an internal subsection of Structured Hearings.** It was briefly folded into `STRUCTURED_HEARINGS.md` as an internal subsection; this is reversed by explicit architecture decision, because HQC's actual scope was never exclusive to Structured Hearings — it is intended as the shared quality-check framework for every hearing-based methodology in the ecosystem, including but not limited to: Structured Hearings, Community Hearings, Expert Hearings, Institutional Hearings, Multi-Stakeholder Hearings, Public Policy Hearings, Digital Hearings, Hybrid Hearings, and future hearing-based methodologies. This is the same cross-cutting-scope test already used to justify keeping `BASIC_VALIDATION_FRAMEWORK.md` separate (shared across AHIP and Structured Hearings) — applied consistently, HQC's ecosystem-wide reuse meets that same bar.

**Distinct from, not overlapping with, two other reviews:** `BASIC_VALIDATION_FRAMEWORK.md` checks whether a *submission* is complete and well-formed (data quality). `SCIENTIFIC_REVIEW.md` checks whether the *evidence and methodology* are scientifically sound (content quality). HQC checks whether the *hearing session itself* was conducted properly — a third, distinct dimension, applicable to any hearing-based methodology, not solely Structured Hearings.

## Mission

To ensure that every hearing — regardless of which hearing-based methodology it belongs to — produces reliable, consistent, transparent, and reproducible evidence suitable for scientific review and governance analysis.

## Objectives

Verify hearing quality; improve facilitation standards; ensure methodological consistency across all hearing types; detect procedural weaknesses; improve documentation quality; increase evidence reliability; support continuous improvement; maintain trust in the hearing process ecosystem-wide.

## Scope

Applies to every hearing-based methodology in the Res Publica ecosystem: Structured Hearings, Community Hearings, Expert Hearings, Institutional Hearings, Multi-Stakeholder Hearings, Public Policy Hearings, Digital Hearings, Hybrid Hearings, and future hearing-based methodologies. Currently, Structured Hearings is the only fully specified hearing-based methodology in this repository; the others are named here as intended future consumers of this same reusable framework, not yet independently specified.

Every completed hearing, of any type, undergoes an HQC review before entering Scientific Review.

## Core Principles

1. **Process Integrity** — the review evaluates whether the hearing followed its methodology's approved process.
2. **Neutrality** — the review assesses facilitation and documentation quality, not participant opinions.
3. **Transparency** — review findings are documented and traceable.
4. **Consistency** — the same quality standards apply across all hearing types, not just one.
5. **Continuous Improvement** — quality findings improve future hearings across the ecosystem.

## Definitions

**Evidence Completeness Check** (HQC) evaluates whether the hearing *process* adequately gathered relevant evidence during the session — distinct from `BASIC_VALIDATION_FRAMEWORK.md`'s "Evidence Inventory Check," which evaluates whether the resulting *submission's* evidence files are attached and well-formed. Both may examine the same evidence, from different angles; neither redefines the other.

**Quality Scoring bands:** Excellent (90–100), Good (75–89), Acceptable (60–74), Needs Improvement (40–59), Unsatisfactory (<40). This score evaluates the *session's process quality* — it is never a score of the participant or their account, consistent with Zero Gamification (Core Principle 2).

## Framework

**Review Components:** Preparation, Facilitation, Documentation, Evidence Collection, Participant Engagement, Time Management, Neutrality, Technical Quality, Ethical Compliance, Overall Session Quality.

**Quality Criteria:**
- **Preparation:** clear objectives, appropriate participants, agenda prepared, supporting materials available.
- **Facilitation:** neutral moderation, equal participation opportunities, respectful communication, structured discussion, appropriate time management.
- **Documentation:** complete records, accurate summaries, metadata captured, evidence linked, decisions documented.
- **Evidence Collection:** relevant evidence gathered, sources documented, evidence organized, missing evidence identified.
- **Participation:** stakeholders represented, opportunity to contribute, respectful interaction, balanced discussion.
- **Technical Quality:** audio/video quality (if applicable), digital platform functionality, file integrity, accessibility.
- **Ethical Compliance:** informed participation, confidentiality respected, no coercion, appropriate conduct, compliance with the Ethics Charter.

**Relationship with Other Frameworks:** receives inputs from any hearing-based methodology (currently: Structured Hearings) and Platform Services. Provides outputs to the Scientific Review Governance Gate, Harm Codex, and Monitoring & Evaluation. Operates alongside the Ethics Charter, AI Governance Framework, and Evidence Standards (unresolved gap, already flagged elsewhere). None of these is redefined here.

## Workflow

**Unchanged, per explicit instruction:** Completed Hearing → Documentation Review → Facilitation Assessment → Evidence Completeness Check → Participation Assessment → Quality Scoring → Recommendations → Approval → Scientific Review.

This runs after the originating hearing methodology's own internal steps complete (for Structured Hearings: Preparation, Moderation, Evidence Coding, Internal Validation/Basic Validation Framework), and alongside — not necessarily before or after — that methodology's own Reflection-equivalent step, where one exists.

**Review Outcomes:** Approved; Approved with Recommendations; Minor Improvements Required; Major Improvements Required; Re-Hearing Recommended.

## Roles

**Quality Reviewer, Hearing Coordinator, Scientific Coordinator, Platform Administrator, Governance Committee** — Phase 2, not yet formally appointed. These roles are shared across all hearing-based methodologies HQC serves, not specific to Structured Hearings.

## Inputs

A completed hearing session record, from any hearing-based methodology.

## Outputs

Session Quality Report, Quality Score, Improvement Recommendations, Facilitation Feedback, Documentation Assessment, Readiness for Scientific Review.

## Governance

**Key Performance Indicators:** average Session Quality Score, documentation completeness rate, facilitation compliance rate, re-hearing rate, participant satisfaction, review completion time, recommendation implementation rate. None of these is a per-person score — all are process/session-level metrics, consistent with Zero Gamification. KPIs may be tracked per hearing-based methodology as well as ecosystem-wide, once more than one such methodology exists.

## AI Integration

Consistent with the general AI Governance boundary (`docs/source/governance/AI_POLICY.md`). Where a hearing used the **AI Hearing Facilitator** (`AI_HEARING_FACILITATOR.md`), its Hearing Summary Draft and Documentation Gap List outputs may inform this review's Documentation Review and Facilitation Assessment steps — as advisory input only, never as a substitute for human review. "AI-assisted transcript quality analysis" and "automated documentation checks" are named only as Future Enhancements (below), not current scope.

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

AI-assisted transcript quality analysis, automated documentation checks, facilitator performance analytics, participant feedback dashboards, benchmarking across hearing types, continuous quality monitoring.

## MVP Status

**Current Role:** Core Operational Module, reusable governance capability. **Blocking Status:** MVP CRITICAL. **Implementation Priority:** Phase 1. **Current Requirement:** architecture now specified (this document); **implementation has not started** — no scoring tool, quality dashboard, or feedback survey exists yet in this repository.

## TODO (implementation — not started)

- [ ] Develop standardized quality review templates, generic across hearing-based methodologies.
- [ ] Create facilitator evaluation criteria.
- [ ] Implement session scoring tools.
- [ ] Build quality dashboards.
- [ ] Integrate participant feedback surveys.
- [ ] Connect quality metrics with Monitoring & Evaluation.
- [ ] Support AI-assisted quality analysis in future versions.
- [ ] As future hearing-based methodologies (Community, Expert, Institutional, Multi-Stakeholder, Public Policy, Digital, Hybrid Hearings) are specified, integrate each with HQC explicitly, rather than assuming reuse without confirmation.

## References

`docs/source/methodology/STRUCTURED_HEARINGS.md`; `docs/source/methodology/BASIC_VALIDATION_FRAMEWORK.md`; `docs/source/methodology/SCIENTIFIC_REVIEW.md`

## Related Documents

`../methodology/STRUCTURED_HEARINGS.md` · `../methodology/BASIC_VALIDATION_FRAMEWORK.md` · `../methodology/SCIENTIFIC_REVIEW.md` · `../methodology/AI_HEARING_FACILITATOR.md` · `../governance/ETHICS_CHARTER.md`
