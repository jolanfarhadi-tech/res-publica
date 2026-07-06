# Structured Hearings

```
Type: Methodology (Core Module)
Status: Substantially specified — architecture only; implementation not started
Version: 1.0 (Annex 03 — Res Publica Governance Framework)
Extends/Reconciles with: docs/source/foundation/01_HARM_OPERATING_SYSTEM.md,
  docs/source/methodology/AHIP.md, docs/source/methodology/HARM_CODEX.md,
  brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md §7 (Scientific Review Level 2)
```

## Purpose

The Structured Hearings Framework establishes the standardized methodology for collecting, documenting, analyzing, and validating experiences, testimonies, expert knowledge, and stakeholder perspectives in a systematic, transparent, evidence-based manner. Unlike traditional public hearings, Structured Hearings generate comparable, high-quality evidence that can directly support governance, research, accountability, and societal repair. **Structured Hearings are not judicial proceedings and do not determine legal responsibility** — their purpose is knowledge generation, evidence collection, and informed governance. A Structured Hearing is the facilitated, prepared session where a citizen's account is explored in depth under explicit safety and quality conditions, following AHIP intake (retained, unchanged).

## Background

Previously a Version 1.0 reconstruction with a 4-step workflow sketch. This document is now built from a real, detailed specification ("Annex 03 — Structured Hearings, Res Publica Governance Framework").

## Mission

To transform individual experiences, expert knowledge, and stakeholder perspectives into structured, traceable, and scientifically usable evidence that strengthens governance, accountability, and collective learning.

## Objectives

Collect reliable evidence; standardize public participation; improve evidence quality; capture diverse perspectives; support scientific analysis; reduce information bias; strengthen accountability; inform policy development; enable repair-oriented governance.

## Scope

May be conducted for individual harm cases, community concerns, public policy evaluation, institutional performance, social conflict analysis, environmental issues, public health challenges, academic research, civic dialogue, and governance improvement initiatives.

**Hearing Types:** Individual, Community, Expert, Multi-Stakeholder, Institutional, Academic, Thematic, Policy, Digital, and Hybrid Hearings.

## Core Principles

1. **Evidence Before Opinion** — statements are supported by evidence whenever possible.
2. **Equal Opportunity to Participate** — participants have a fair opportunity to contribute.
3. **Respect** — every participant is treated respectfully regardless of perspective.
4. **Transparency** — the hearing process is documented and reproducible.
5. **Scientific Neutrality** — facilitators avoid influencing participant responses.
6. **Accountability** — every hearing has responsible facilitators and documented procedures.
7. **Repair Orientation** — hearings seek understanding and constructive solutions rather than confrontation.

Safety before disclosure depth; preparation before the session; no re-traumatization (retained).

## Definitions

Distinct from AHIP (intake) and Reflection (the pause immediately after). A Structured Hearing is the working session itself (retained, unchanged).

## Framework

Position in the HARM Lifecycle: `AHIP → **Structured Hearing** → Reflection` (unchanged). Also Level 2 of Scientific Review's own internal pipeline (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7) — this document does not alter that reconciliation (`ADR-020`, Dual Intake and Review Paths).

**Documentation Standards** (per hearing): Hearing ID, date, topic, participant list, facilitator, summary, key findings, evidence inventory, metadata, follow-up recommendations.

**Evidence Coding dimensions:** Harm Category, harm type, stakeholder group, root cause, responsibility area, geographic area, severity, evidence confidence. Coding follows the **National Harm Taxonomy** (`ADR-021`, `HARM_CODEX.md`) — the same taxonomy AHIP's Harm Classification uses, not a second one.

**Evidence Standards** (authenticity, reliability, etc.) — refers to the same "Evidence Standards Annex" already flagged as missing in `AHIP.md`; not duplicated here, not invented.

**Relationship with Other Frameworks:** provides evidence to AHIP, Scientific Review (the "Validation Framework"), Harm Codex, Responsibility Mapping, the Repair Framework (`REPAIR_FRAMEWORK.md`), Civic Intelligence, and Early Warning. Receives guidance from the Ethics Charter, Evidence Standards (unresolved gap), AI Governance Framework, and Platform Services. None of these is redefined here.

## Workflow

**Structured Hearings' own scope** (Topic Definition through Evidence Coding/internal Validation):
1. **Preparation** — Topic Definition, Participant Selection, defining objectives, preparing guiding questions, identifying relevant evidence, assigning facilitators, scheduling logistics, preparing documentation tools (retained and expanded).
2. **Moderation** — the session runs under trauma-informed facilitation practice, following the Hearing Structure below (retained).
3. **Evidence capture / Evidence Coding** — Documentation and Evidence Coding per the dimensions above (retained and expanded).
4. **Internal Validation** — the same shared gate as AHIP's "Basic Validation" step; full specification: `docs/source/methodology/BASIC_VALIDATION_FRAMEWORK.md` (not duplicated here). Distinct from, and feeding into, the full Scientific Review pipeline below — it does not replace Scientific Review's own Level 3/4 validation.
5. **Session Quality Review** — every completed hearing undergoes this internal review before Reflection handoff and before entering Scientific Review. Full detail below.
6. **Reflection handoff** — the account moves to the Reflection stage (retained, unchanged).

**Handoffs to already-canonical systems** (not Structured-Hearings-owned stages):
- **Scientific Review** (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7) — the actual next stage after this document's own internal Validation, exactly as already established.
- **Integration into AHIP** — the existing AHIP case record is enriched/updated with hearing findings; this is not a second intake (`AHIP.md`'s own scope, Case Submission through Evidence Collection, is unaffected).
- **Integration into Harm Codex** (`HARM_CODEX.md`) — occurs once a pattern is validated, per that document's existing Workflow; not a direct, unvalidated feed from Structured Hearings alone.

### Session Quality Review

**Internal to Structured Hearings — not a separate canonical methodology.** This subsection evaluates whether the hearing *process itself* was conducted properly (facilitation, preparation, participation, ethical compliance) — distinct from Basic Validation Framework (submission data-completeness, kept separate because it is genuinely cross-cutting across AHIP and Structured Hearings) and Scientific Review (evidentiary/methodological validity, kept separate because it is a distinct downstream validation engine with its own multi-level pipeline). Session Quality Review has no scope outside Structured Hearings, so it lives here rather than as its own document.

**Purpose:** evaluate whether each hearing session was conducted according to the required methodological, procedural, ethical, and documentation standards before its outputs become part of the official evidence base. It evaluates the quality of the hearing *process* — not the truthfulness of participants or the validity of the evidence itself.

**Scope:** every Hearing Type defined above (Individual, Community, Expert, Multi-Stakeholder, Institutional, Academic, Thematic, Policy, Digital, Hybrid). Every completed hearing undergoes this review before entering Scientific Review.

**Quality Criteria:**
- *Preparation:* clear objectives, appropriate participants, agenda prepared, supporting materials available.
- *Facilitation:* neutral moderation, equal participation opportunities, respectful communication, structured discussion, appropriate time management.
- *Documentation:* complete records, accurate summaries, metadata captured, evidence linked, decisions documented.
- *Evidence Collection* (process-level — distinct from Basic Validation Framework's data-level Evidence Inventory Check): relevant evidence gathered, sources documented, evidence organized, missing evidence identified.
- *Participation:* stakeholders represented, opportunity to contribute, respectful interaction, balanced discussion.
- *Technical Quality:* audio/video quality (if applicable), digital platform functionality, file integrity, accessibility.
- *Ethical Compliance:* informed participation, confidentiality respected, no coercion, appropriate conduct, compliance with the Ethics Charter.

**Scoring System:** Excellent (90–100), Good (75–89), Acceptable (60–74), Needs Improvement (40–59), Unsatisfactory (<40) — a session-process score, never a score of the participant or their account, consistent with Zero Gamification (Core Principle 2). **Review Outcomes:** Approved; Approved with Recommendations; Minor Improvements Required; Major Improvements Required; Re-Hearing Recommended.

**Sub-workflow:** Completed Hearing → Documentation Review → Facilitation Assessment → Evidence Completeness Check → Participation Assessment → Quality Scoring → Recommendations → Approval → feeds into Reflection handoff and the Scientific Review handoff, both above.

**Outputs:** Session Quality Report, Quality Score, Improvement Recommendations, Facilitation Feedback, Documentation Assessment, Readiness for Scientific Review.

**Downstream consumers:** Scientific Review (readiness gate), Harm Codex (pattern quality context), Monitoring & Evaluation (KPIs, below). Operates alongside the Ethics Charter, AI Governance Framework, and Evidence Standards (unresolved gap, already flagged above). None of these is redefined here.

**Key Performance Indicators:** average Session Quality Score, documentation completeness rate, facilitation compliance rate, re-hearing rate, participant satisfaction, review completion time, recommendation implementation rate — all process/session-level metrics, never per-person scores.

**Roles (Phase 2, not yet formally appointed):** Quality Reviewer, Hearing Coordinator, Scientific Coordinator, Platform Administrator, Governance Committee.

**Standard Hearing Structure:** 1. Opening, 2. Introduction of objectives, 3. Ethical briefing, 4. Participant introductions, 5. Evidence presentation, 6. Structured discussion, 7. Clarification questions, 8. Summary, 9. Closing remarks, 10. Documentation review.

**Version 1.0 proposal — preparation and safety detail, retained, unchanged:** preparation includes confirming the participant's availability and consent are current (not assumed from AHIP intake alone), reviewing any AHIP-flagged safety considerations, and confirming a Moderator is available for the session. Safety protocol: the participant may pause or end the session at any time without justification; no session proceeds without a Moderator present; session length is set by participant comfort, not a fixed duration. **This safety protocol is more specific than, and takes precedence over, the new specification's general Hearing Structure above where the two would conflict** (e.g., the participant's right to end the session at any point applies throughout all 10 structural steps, not only at "Closing remarks").

## Roles

**Facilitator** (= "Hearing Facilitator") — runs the session. **Participant** — shares the account in depth. **Moderator** — supports safety. **Research Coordinator, Scientific Reviewer, Documentation Officer, Platform Administrator** — named in the new specification as supporting/downstream roles. **Ethics Observer (future)** — a new, not-yet-formally-appointed role, distinct from the existing Ethics Board (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7) — not conflated with it here.

## Inputs

An AHIP-prepared account (retained).

## Outputs

A documented account, ready for Reflection (retained). Hearing Reports, Evidence Packages, Testimony Records, Harm Classifications, Stakeholder Maps, Scientific Inputs, Policy Insights, AHIP Case Inputs (enrichment, not new intake), Harm Codex Entries (once validated downstream).

## Governance

Subject to the organization's trauma-informed language standard; no session content is published without subsequent verification and human sign-off (retained). **Quality Assurance:** standardized procedures, facilitator training, documentation review, evidence verification, metadata consistency, independent review, audit logging.

## AI Integration

AI does not facilitate or moderate hearings. AI is not present as a decision-maker in the session itself (retained). "AI-assisted transcription" is named only as a Future Enhancement (below), not current scope.

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

AI-assisted transcription, multilingual hearings, real-time evidence coding, digital participation tools, stakeholder network analysis, sentiment and thematic analysis, interactive hearing dashboards, remote participation platforms.

## MVP Status

**Current Role:** Core Operational Module. **Blocking Status:** MVP CRITICAL. **Implementation Priority:** Phase 1. **Current Requirement:** architecture now substantially specified (this document); **implementation has not started** — no hearing template, participant registration workflow, or documentation tool exists yet in this repository.

## TODO (implementation — not started)

- [ ] Develop standardized hearing templates.
- [ ] Create facilitator guidelines.
- [ ] Build participant registration workflows.
- [ ] Integrate transcription and documentation tools.
- [ ] Connect outputs to AHIP and the Harm Codex (via the handoff points above, not a new integration).
- [ ] Implement evidence coding interfaces.
- [ ] Create reporting dashboards.
- [ ] Enable multilingual support.
- [ ] Author the referenced "Evidence Standards Annex" (same gap already flagged in `AHIP.md` — does not exist yet).
- [ ] Develop standardized Session Quality Review templates.
- [ ] Create facilitator evaluation criteria.
- [ ] Implement session scoring tools.
- [ ] Build Session Quality dashboards.
- [ ] Integrate participant feedback surveys.
- [ ] Connect Session Quality metrics with Monitoring & Evaluation.

## References

`.claude/skills/web-05-core-pages/SKILL.md`; `.claude/skills/web-01-sitemap/SKILL.md`; `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md`

## Related Documents

`../foundation/01_HARM_OPERATING_SYSTEM.md` · `../methodology/AHIP.md` · `../methodology/HARM_LIFECYCLE.md` · `../methodology/HARM_CODEX.md` · `../methodology/REPAIR_FRAMEWORK.md` · `../methodology/BASIC_VALIDATION_FRAMEWORK.md` · `../methodology/SCIENTIFIC_REVIEW.md` · `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`

**Note:** Session Quality Review is documented as an internal subsection of this document (above), not a separate file — see the "Session Quality Review" subsection under Workflow.
