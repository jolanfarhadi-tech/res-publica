# AHIP (Accountability & Harm Identification Process)

```
Type: Methodology (Core Module)
Status: Substantially specified — architecture only; implementation not started
Version: 1.0 (Annex 02 — Res Publica Governance Framework)
Extends/Reconciles with: docs/source/foundation/01_HARM_OPERATING_SYSTEM.md,
  docs/source/methodology/STRUCTURED_HEARINGS.md, docs/source/methodology/RESPONSIBILITY_MAPPING.md,
  docs/source/methodology/RESPONSIBILITY_DASHBOARD.md, docs/source/methodology/HARM_CODEX.md,
  brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md §7 (Scientific Review)
```

## Purpose

AHIP is the standardized intake and assessment framework of the HARM ecosystem — the official entry point for all reported harms and accountability cases. It transforms unstructured reports, testimonies, observations, and evidence into structured, traceable, evidence-based harm cases suitable for governance analysis and repair. It is the initial, human-moderated intake process that receives a citizen's account with trauma-informed care — the first structured step after Citizen Experience in the HARM Lifecycle (unchanged from the prior canonical definition).

## Background

Previously a Version 1.0 reconstruction with only a 3-step workflow sketch. This document is now built from a real, detailed specification ("Annex 02 — AHIP, Res Publica Governance Framework"). **Reconciliation, not redefinition:** the new specification's "Harm Intake Workflow" describes the *full harm-case journey*, several stages of which are already owned by other canonical documents (see Workflow, below) — AHIP's own scope is Case Submission through Evidence Collection; later stages are handoffs, not new AHIP-owned processes.

## Mission

To transform unstructured reports, testimonies, observations, and evidence into structured, traceable, and evidence-based harm cases suitable for governance analysis and repair.

## Objectives

Identify harms systematically; standardize case intake; improve evidence quality; support accountability; enable comparable harm records; reduce reporting bias; prepare cases for scientific review; support policy learning; facilitate repair-oriented governance.

## Scope

Applies to individual, community, institutional, structural, environmental, economic, governance-failure, human-rights, and public-policy harms, and future categories defined in the Harm Codex. Intake sources: citizens, community organizations, NGOs, researchers, journalists, public institutions, academic projects, Structured Hearings, existing datasets, future API integrations.

## Core Principles

1. **Evidence Before Opinion** — every reported harm is supported by available evidence whenever possible.
2. **Accountability** — every case identifies responsible actors, affected stakeholders, or responsible institutions where appropriate.
3. **Neutral Documentation** — AHIP documents facts, observations, and evidence without making legal or political judgments.
4. **Traceability** — every submission receives a unique identifier and maintains a complete audit trail (extends `AuditLog`, LOCKED Core Domain Model — not a new logging mechanism).
5. **Transparency** — the intake process is understandable and reproducible.
6. **Repair Orientation** — the purpose of identifying harm is to support understanding, prevention, accountability, and repair.

Trauma-informed care first; no judgment of the account at intake; safety before documentation (retained from prior draft — unchanged).

## Definitions

AHIP receives a Citizen Experience account and prepares it for a Structured Hearing. It is intake and case registration, not evidence verification — no responsibility determination happens at this stage (retained). "Listening" (elsewhere) and "Case Submission" (here) refer to the same originating act.

## Framework

Position in the HARM Lifecycle: `Citizen Experience → **AHIP** → Structured Hearing` (unchanged).

**Minimum Required Information per case:** Case ID, date, location, Harm Category, description, affected individuals/communities, alleged responsible actors (where applicable), available evidence, source type, reporter information (if applicable), confidentiality level.

**Harm Classification dimensions** (applied downstream, not by AHIP itself — see Workflow): Harm Category, harm type, severity, scale, duration, geographic scope, population affected, governance dimension, root cause, repair potential. Classification follows the **National Harm Taxonomy** (`ADR-021`, `docs/source/methodology/HARM_CODEX.md`) — not a separate AHIP-specific taxonomy.

**Evidence Collection sources:** interviews, Structured Hearings, documents, official records, photographs, audio, video, scientific publications, administrative data, observational notes, expert opinions.

**Evidence Standards** (authenticity, reliability, validity, completeness, relevance, consistency, traceability) — the previously-flagged "Evidence Standards Annex" gap is now resolved by `docs/source/methodology/EVIDENCE_MODEL.md`'s Evidence Quality Assessment criteria (authenticity, reliability, relevance, completeness, consistency, traceability, plus timeliness, contextual integrity, corroboration).

**Accountability Mapping** (responsible institutions, organizations, processes, contributing factors, systemic drivers) — this is the same function already specified as **Responsibility Mapping Lab** (`docs/source/methodology/RESPONSIBILITY_MAPPING.md`), not a second, competing mapping process. AHIP documents accountability relationships without assigning legal liability, consistent with that document's existing evidence-grounded-linkage-only principle.

## Workflow

**AHIP's own scope** (Case Submission through Evidence Collection):
1. Case Submission — a citizen or other intake source shares an account or evidence.
2. Initial Registration — a unique Case ID and audit trail entry are created.
3. Basic Validation — the moderator assesses completeness and coherence, applying trauma-informed practice. Full specification: `docs/source/methodology/BASIC_VALIDATION_FRAMEWORK.md` (not duplicated here).
4. Evidence Collection — supporting material is gathered, per the sources listed above.

**Handoffs to already-canonical systems** (not AHIP-owned stages — reconciled, not duplicated):
5. Harm Classification → **National Harm Taxonomy** (`HARM_CODEX.md`, `ADR-021`), not a new AHIP classification system.
6. Severity Assessment, Stakeholder Mapping → **Responsibility Mapping Lab** (`RESPONSIBILITY_MAPPING.md`).
7. Priority Assessment → **Responsibility Dashboard**'s Priority Matrix (`RESPONSIBILITY_DASHBOARD.md`), not a second prioritization mechanism.
8. Scientific Review Queue → **Scientific Review** (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7).
9. Harm Codex Registration → **Harm Codex** (`HARM_CODEX.md`).
10. Repair Planning → **Repair Framework** (`docs/source/methodology/REPAIR_FRAMEWORK.md`, now specified).

No previous canonical document's workflow, ownership, or ordering is changed by this reconciliation — AHIP's own step 3 (Basic Validation) proceeds to Structured Hearing exactly as before; nothing here alters `ADR-020`'s Dual Intake and Review Paths.

## Roles

**Participant** (= "Case Reporter" in the new specification) — shares an account. **Moderator** (encompasses "Intake Coordinator") — receives and assesses the account. "Scientific Reviewer," "Governance Reviewer," "Platform Administrator" are named in the new specification as later-stage roles belonging to Scientific Review and governance processes already specified elsewhere — not new AHIP-specific roles.

## Inputs

A Citizen Experience account, or evidence from any of the Intake Sources listed above (Scope).

## Outputs

An account prepared for Structured Hearing, or a determination that a Structured Hearing is not appropriate at this time (retained). Case Metadata and an initial Evidence Package, per the Minimum Required Information above.

## Governance

Subject to Res Publica's trauma-informed language standard and data-protection requirements (`docs/source/governance/DATA_POLICY.md`, `docs/source/governance/DPIA.md`). **Quality Assurance** (at intake only — later stages have their own QA): completeness review, duplicate detection, evidence verification at the intake level, metadata validation, audit logging.

## AI Integration

AI does not perform intake moderation. Any AI assistance (e.g., language accessibility support, future "AI-assisted Intake" per Future Enhancements below) is advisory only to the human moderator, consistent with `docs/source/governance/AI_POLICY.md`. Where AHIP intake involves an extended conversational component, the **AI Hearing Facilitator** (`AI_HEARING_FACILITATOR.md`) may offer the same advisory support it provides at Structured Hearings — never conducting intake, validating anything, or replacing the Moderator.

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

AI-assisted intake, automated classification, duplicate case detection, multilingual intake, mobile reporting, geospatial mapping, risk scoring, API-based reporting, cross-institutional case exchange.

## MVP Status

**Current Role:** Core Operational Module. **Blocking Status:** MVP IMPLEMENTED (backend). **Implementation Priority:** Phase 1 delivered. **Current Requirement:** institution-scoped case persistence, protected intake/evidence APIs, role enforcement, session actor attribution, lifecycle transitions, and atomic append-only audit events are implemented. Operator UI and external integrations remain non-blocking follow-up work.

## Remaining implementation work (non-blocking)

- [ ] Implement standardized digital intake forms.
- [ ] Connect intake workflow to the Harm Codex (via the handoff points above, not a new integration).
- [ ] Develop evidence upload and metadata management.
- [ ] Integrate with Structured Hearings.
- [ ] Implement case tracking and status management.
- [ ] Develop dashboard reporting.
- [ ] Enable multilingual submissions.
- [ ] Prepare APIs for external integrations.
- [ ] Integrate Evidence Model's Evidence Quality Assessment criteria into the intake evidence-collection UI (gap resolved, `EVIDENCE_MODEL.md`).

## References

`docs/source/foundation/01_HARM_OPERATING_SYSTEM.md`; `.claude/skills/web-05-core-pages/SKILL.md`; `.claude/skills/web-07-forms/SKILL.md` (RPCS "AHIP Specialist" track)

## Related Documents

`../foundation/01_HARM_OPERATING_SYSTEM.md` · `../methodology/STRUCTURED_HEARINGS.md` · `../methodology/RESPONSIBILITY_MAPPING.md` · `../methodology/RESPONSIBILITY_DASHBOARD.md` · `../methodology/HARM_CODEX.md` · `../methodology/BASIC_VALIDATION_FRAMEWORK.md` · `../methodology/AI_HEARING_FACILITATOR.md` · `../methodology/EVIDENCE_MODEL.md` · `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` · `../academy/RPCS_PROGRAM.md`
