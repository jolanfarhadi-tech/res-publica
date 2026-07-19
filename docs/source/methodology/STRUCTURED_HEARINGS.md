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

The Structured Hearings Framework establishes the standardized methodology for collecting, documenting, analyzing, and contextualizing experiences, testimonies, expert knowledge, and stakeholder perspectives in a systematic, transparent, evidence-based manner. Unlike traditional public hearings, Structured Hearings generate comparable, high-quality evidence that can directly support governance, research, accountability, and societal repair. **Structured Hearings are not judicial proceedings and do not determine legal responsibility** — their purpose is knowledge generation, evidence collection, and informed governance. A Structured Hearing is the facilitated, prepared session where a citizen's account is explored in depth under explicit safety and quality conditions, following AHIP intake (retained, unchanged).

**Reflection ≠ Validation — architecture clarification.** Where a hearing involves Expert, Community, Institutional, Multi-Stakeholder, or Policy participants (per Hearing Type, below), their role is to contribute **contextual reflections** — a professional or civic perspective that enriches understanding of the reported harm — **not** to validate, verify, fact-check, or approve/reject the account or its evidence. Experts explain what they observe from their professional knowledge; community representatives explain community impact; institutional representatives explain institutional implications; policy participants explain policy relevance. None of this constitutes Scientific Review, fact-checking, or evidence validation — Observation ≠ Verification, Professional Perspective ≠ Scientific Review, Community Input ≠ Evidence Validation, Institutional Perspective ≠ Approval. The hearing is a democratic knowledge-building process; its output is a richer, multi-perspective understanding of the reported harm, not a validated conclusion. Formal validation begins downstream, at Scientific Review (`SCIENTIFIC_REVIEW.md`) — the first formal validation process in the HARM lifecycle.

**Expert Contributions — architecture clarification.** Expert contributors do not produce scientific findings. Expert contributions must always distinguish between professional observation, professional interpretation, documented evidence, assumptions, and uncertainty. Professional opinion must never be presented as validated evidence — that distinction is preserved through Documentation Standards and Evidence Coding (below), and resolved only by Scientific Review.

**What a Structured Hearing is — architecture clarification.** A Structured Hearing is not a therapy session, not a political debate, and not an open storytelling space. It is an evidence-oriented hearing whose purpose is to identify and document signals that help reconstruct harm mechanisms, responsibility pathways, institutional interactions, systemic vulnerabilities, governance effects, and repair opportunities. Full detail on how this is supported: `AI_HEARING_FACILITATOR.md`.

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

**Supplementary definition (architecture patch — supplements, does not replace, the definition above):** "A Structured Hearing is a facilitated deliberative process designed to document and contextualize reported harms through multiple informed perspectives under explicit procedural safeguards. Its purpose is knowledge generation, contextual understanding, and evidence enrichment. It does not establish factual truth, determine legal responsibility, or perform scientific validation."

## Framework

Position in the HARM Lifecycle: `AHIP → **Structured Hearing** → Reflection` (unchanged). Also Level 2 of Scientific Review's own internal pipeline (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7) — this document does not alter that reconciliation (`ADR-020`, Dual Intake and Review Paths).

**Documentation Standards** (per hearing): Hearing ID, date, topic, participant list, facilitator, summary, key findings, evidence inventory, metadata, follow-up recommendations.

**Evidence Coding dimensions:** Harm Category, harm type, stakeholder group, root cause, responsibility area, geographic area, severity, evidence confidence. Coding follows the **National Harm Taxonomy** (`ADR-021`, `HARM_CODEX.md`) — the same taxonomy AHIP's Harm Classification uses, not a second one.

**Evidence Standards** (authenticity, reliability, etc.) — the previously-flagged gap (also noted in `AHIP.md`) is now resolved by `docs/source/methodology/EVIDENCE_MODEL.md`'s Evidence Quality Assessment criteria.

**Relationship with Other Frameworks:** provides evidence to AHIP, the Scientific Review Governance Gate, Harm Codex, Responsibility Mapping, the Repair Framework (`REPAIR_FRAMEWORK.md`), Civic Intelligence, and Early Warning. Receives guidance from the Ethics Charter, Evidence Standards (unresolved gap), AI Governance Framework, and Platform Services. None of these is redefined here.

## Workflow

**Structured Hearings' own scope** (Topic Definition through Evidence Coding/internal Validation):
1. **Preparation** — Topic Definition, Participant Selection, defining objectives, preparing guiding questions, identifying relevant evidence, assigning facilitators, scheduling logistics, preparing documentation tools (retained and expanded).
2. **Moderation** — the session runs under trauma-informed facilitation practice, following the Hearing Structure below (retained).
3. **Evidence capture / Evidence Coding** — Documentation and Evidence Coding per the dimensions above (retained and expanded).
4. **Internal Validation** — the same shared gate as AHIP's "Basic Validation" step; full specification: `docs/source/methodology/BASIC_VALIDATION_FRAMEWORK.md` (not duplicated here). Distinct from, and feeding into, the full Scientific Review pipeline below — it does not replace Scientific Review's own Level 3/4 validation.
5. **HQC (Hearing Quality Check)** — every completed hearing undergoes this review before Reflection handoff and before entering Scientific Review. **HQC is a standalone, reusable canonical methodology** (`docs/source/methodology/HEARING_QUALITY_CHECK.md`), not owned by or internal to Structured Hearings — it is the shared quality-check framework for every hearing-based methodology in the ecosystem. Not duplicated here.
6. **Reflection handoff** — the account moves to the Reflection stage (retained, unchanged).

**Handoffs to already-canonical systems** (not Structured-Hearings-owned stages):
- **HQC** (`docs/source/methodology/HEARING_QUALITY_CHECK.md`) — the reusable hearing quality assurance framework, applicable to Structured Hearings and any other hearing-based methodology.
- **Scientific Review** (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7) — the actual next stage after HQC and this document's own internal Validation, exactly as already established.
- **Integration into AHIP** — the existing AHIP case record is enriched/updated with hearing findings; this is not a second intake (`AHIP.md`'s own scope, Case Submission through Evidence Collection, is unaffected).
- **Integration into Harm Codex** (`HARM_CODEX.md`) — occurs once a pattern is validated, per that document's existing Workflow; not a direct, unvalidated feed from Structured Hearings alone.

**Standard Hearing Structure:** 1. Opening, 2. Introduction of objectives, 3. Ethical briefing, 4. Participant introductions, 5. Evidence presentation, 6. Structured discussion, 7. Clarification questions, 8. Summary, 9. Closing remarks, 10. Documentation review.

**Version 1.0 proposal — preparation and safety detail, retained, unchanged:** preparation includes confirming the participant's availability and consent are current (not assumed from AHIP intake alone), reviewing any AHIP-flagged safety considerations, and confirming a Moderator is available for the session. Safety protocol: the participant may pause or end the session at any time without justification; no session proceeds without a Moderator present; session length is set by participant comfort, not a fixed duration. **This safety protocol is more specific than, and takes precedence over, the new specification's general Hearing Structure above where the two would conflict** (e.g., the participant's right to end the session at any point applies throughout all 10 structural steps, not only at "Closing remarks").

## Roles

**Facilitator** (= "Hearing Facilitator") — runs the session. **Participant** — shares the account in depth. **Moderator** — improves the clarity and completeness of the hearing. Examples: asking neutral follow-up questions, identifying timeline gaps, requesting clarification, encouraging specificity, identifying missing context, ensuring participant understanding, preventing leading questions, preventing intimidation, maintaining procedural neutrality; also supports safety (retained). The Moderator never: validates evidence, judges credibility, determines responsibility, performs scientific review, or performs legal assessment. **Expert, Community, Institutional, Multi-Stakeholder, and Policy contributors** (per Hearing Type) — provide contextual reflections from their professional or civic perspective; per the architecture clarification above, they do not validate, verify, fact-check, or approve/reject the account or evidence. **Research Coordinator, Documentation Officer, Platform Administrator** — supporting roles. **Scientific Reviewer** — a downstream role belonging to Scientific Review, not a participant in the hearing itself; named in the source specification as a later-stage role. **Ethics Observer (future)** — a new, not-yet-formally-appointed role, distinct from the existing Ethics Board (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7) — not conflated with it here.

## Inputs

An AHIP-prepared account (retained).

## Outputs

A documented, multi-perspective account — not a validated conclusion — ready for Reflection (retained). Hearing Reports, Evidence Packages, Testimony Records, Harm Classifications (descriptive tagging per the National Harm Taxonomy, not a truth judgment), Stakeholder Maps, contextual reflections from Expert/Community/Institutional/Policy contributors where applicable (raw material for Scientific Review, not already-validated findings), AHIP Case Inputs (enrichment, not new intake), Harm Codex Entries (once validated downstream, by Scientific Review — not by this document's own process).

## Governance

Subject to the organization's trauma-informed language standard; no session content is published without subsequent verification and human sign-off (retained). **Quality Assurance:** standardized procedures, facilitator training, documentation review, evidence verification, metadata consistency, independent review, audit logging.

## AI Integration

AI does not facilitate or moderate hearings. AI is not present as a decision-maker in the session itself (retained). Where AI assistance is used, it takes the form of the **AI Hearing Facilitator** (`AI_HEARING_FACILITATOR.md`) — a reusable, advisory-only capability that supports the human Facilitator and Moderator (signal clarification prompts, chronology-gap identification, documentation checklists) without conducting the hearing, validating anything, or replacing human moderation. "AI-assisted transcription" is named only as a Future Enhancement (below), not current scope.

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

AI-assisted transcription, multilingual hearings, real-time evidence coding, digital participation tools, stakeholder network analysis, sentiment and thematic analysis, interactive hearing dashboards, remote participation platforms.

## MVP Status

**Current Role:** Core Operational Module. **Blocking Status:** MVP IMPLEMENTED (backend). **Implementation Priority:** Phase 1 delivered. **Current Requirement:** protected hearing documentation, current-consent timestamp, session-derived moderator, report reference, lifecycle transition, persistence, HQC handoff, and atomic audit events are implemented. Scheduling, participant registration, and operator UI remain non-blocking follow-up work.

## Remaining implementation work (non-blocking)

- [ ] Develop standardized hearing templates.
- [ ] Create facilitator guidelines.
- [ ] Build participant registration workflows.
- [ ] Integrate transcription and documentation tools.
- [ ] Connect outputs to AHIP and the Harm Codex (via the handoff points above, not a new integration).
- [ ] Implement evidence coding interfaces.
- [ ] Create reporting dashboards.
- [ ] Enable multilingual support.
- [ ] Integrate Evidence Model's Evidence Quality Assessment criteria into hearing evidence coding (gap resolved, `EVIDENCE_MODEL.md`).

## References

`.claude/skills/web-05-core-pages/SKILL.md`; `.claude/skills/web-01-sitemap/SKILL.md`; `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md`

## Related Documents

`../foundation/01_HARM_OPERATING_SYSTEM.md` · `../methodology/AHIP.md` · `../methodology/HARM_LIFECYCLE.md` · `../methodology/HARM_CODEX.md` · `../methodology/REPAIR_FRAMEWORK.md` · `../methodology/BASIC_VALIDATION_FRAMEWORK.md` · `../methodology/HEARING_QUALITY_CHECK.md` · `../methodology/SCIENTIFIC_REVIEW.md` · `../methodology/AI_HEARING_FACILITATOR.md` · `../methodology/EVIDENCE_MODEL.md` · `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`

**Note:** HQC (Hearing Quality Check) is a standalone, reusable canonical methodology (`HEARING_QUALITY_CHECK.md`) — not internal to this document. Per explicit architecture decision, it was briefly folded in as a subsection and has since been re-established standalone, since its scope extends to every hearing-based methodology in the ecosystem, not solely Structured Hearings.
