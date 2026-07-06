# ADR-023: MVP Phasing for Ethics Charter, DPIA, AI Governance, and Early Warning

## Status
Accepted

## Context

The user made an explicit architectural decision: Ethics Charter, DPIA, AI Governance, and Early Warning are not MVP implementation blockers. They are to be treated as governance-layer annexes and compliance/readiness modules, not prerequisites for basic platform implementation. The MVP should implement only lightweight placeholders and integration points for these four, while core platform work (HARM taxonomy, AHIP intake, Structured Hearings, Harm Codex, Evidence model, Platform services) proceeds without waiting on them.

Before acting, a duplication check found: Ethics Charter (`docs/source/governance/ETHICS_CHARTER.md`) and AI Governance (`docs/source/foundation/05_AI.md`, `docs/source/governance/AI_POLICY.md`, `brain/AI/AI_GOVERNANCE_HIERARCHY.md`) already exist as canonical documents. DPIA and Early Warning do not exist as documents anywhere in this repository — only as name references.

## Decision

**No implementation blocking.** Ethics Charter, DPIA, AI Governance, and Early Warning are formally classified as Phase 2 / governance-hardening components. Core platform work is not gated on their completion.

**No duplicate documents created for the two that already exist.** `ETHICS_CHARTER.md` and `AI_POLICY.md` each received an additive "MVP Status & Extension Points" section (Scope reaffirmed from existing content, Future Responsibilities, Interfaces with the core HARM system, TODO markers) — their existing Purpose/Core Principles/Framework content is unchanged.

**Two genuine new stub files created**, since no prior document existed for either:
- `docs/source/governance/DPIA.md`
- `docs/source/governance/EARLY_WARNING.md`

Both follow the required structure (Purpose, Scope, Future Responsibilities, Interfaces with the Core HARM System, TODO markers), explicitly marked `Status: Stub — Phase 2`, and invent no missing specification content — consistent with this session's standing discipline against fabricating institutional fact.

## Interfaces Reserved (not implemented)

- AHIP intake, Structured Hearings, Harm Codex, Annex publication — each reserves an Ethics Charter compliance-check extension point.
- Scientific Review's AI-assisted steps, Civic Intelligence's grounding role — each reserves an AI Governance check extension point.
- `ConsentRecord`/`AuditLog` (LOCKED Core Domain Model) — reserves the DPIA's future assessment point.
- The Scientific Review lifecycle's `published → signal_released` state — reserves the Early Warning integration point (already existed as of `ADR-017`; not newly added here).

None of these interfaces is implemented as working code in this ADR — all are documentation-level reservations, consistent with every other Annex-ecosystem concept remaining conceptual pending its own future work.

## No Duplication, No New Domain Entity

- No entity was added to `brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED).
- No existing canonical document's core content (Purpose, Core Principles, Framework, Workflow) was rewritten — only additive sections were appended.
- The pre-existing AI Governance fragmentation across 3 documents is flagged again (not newly discovered, not fixed here) as a future consolidation candidate.

## Consequences

- Core platform implementation (HARM taxonomy, AHIP intake, Structured Hearings, Harm Codex, Evidence model, Platform services) may proceed without waiting on Ethics Charter/DPIA/AI Governance/Early Warning completion.
- Each of the four now has an explicit, documented extension point rather than an implicit, undocumented gap.
- Production launch readiness (real personal data processing, real testimony) still requires these to be completed — this ADR defers architecture/documentation-blocking status only, not eventual compliance necessity.

## Addendum (same turn): Real Ethics Charter Content Integrated

After this ADR's original adoption, the user provided a substantially more detailed, real Ethics Charter specification ("Annex 14 — Res Publica Governance Framework": 12 core ethical principles, objectives, scope, ethical review process, risk categories, decision criteria, relationship map to other frameworks, governance/compliance detail, and its own explicit MVP-status/TODO sections). This superseded the thin "Version 1.0 proposal" content `ETHICS_CHARTER.md` held at this ADR's original adoption — the document was substantially rewritten to integrate it, while preserving the four specific rules from the prior draft (Consent renewal, Right to withdraw, Facilitator escalation, Reviewer conflict of interest), which remain more granular than anything in the new material and were not discarded.

**Terminology reconciled, not duplicated:** the new content's "Ethics Review Board" and "Scientific Review Board" are documented as the same bodies already named **Ethics Board** (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7) and **Scientific Review Committee** elsewhere — no second, competing governance body was created. "Governance Committee" and "Platform Administration" are new names not yet formally defined anywhere else in this repository; they are named but not further specified, consistent with Phase 2 status.

This remains classified as Phase 2 / Non-Blocking for MVP — the richer content does not change that status; it only makes the placeholder's eventual scope clearer.

## Addendum 2 (same turn): Real DPIA Content Integrated

The user subsequently provided a substantially more detailed, real DPIA specification ("Annex 15"): 9 core principles, data categories, processing activities, privacy risk assessment, mitigation measures, data subject rights, Privacy by Design integration points, governance responsibilities, and its own explicit MVP-status/TODO sections. `docs/source/governance/DPIA.md` was rewritten to integrate this, reconciling "Data Usage Policy" as the same document already named `DATA_POLICY.md`, "HARM Taxonomy" as the National Harm Taxonomy (`ADR-021`), "Validation Framework" as Scientific Review, and the specification's "Consent Management Framework" as future governance *over* the existing `ConsentRecord` entity (LOCKED Core Domain Model), not a new entity. Remains Phase 2 / Non-Blocking for MVP — still a placeholder, not a completed legal assessment.

## Addendum 3 (same turn): Real Early Warning Framework Content Integrated

The user subsequently provided a substantially more detailed, real Early Warning specification ("Annex 16"): 6 core principles, monitoring domains, indicators, 5 graduated Alert Levels, an Alert Workflow, detection sources/methods, risk assessment dimensions, and its own explicit MVP-status/TODO sections. `docs/source/governance/EARLY_WARNING.md` was rewritten to integrate this, reconciling the new Alert Levels/Alert Workflow as occurring *after* the already-established `published → signal_released` state transition (§7) rather than as a competing trigger mechanism, and reconciling "Detection Methods: Pattern Recognition" with the existing `compounds_into` Knowledge Graph edge and Civic Intelligence's Pattern Recognition step rather than introducing a second pattern-detection mechanism. "Scientific Review Board"/"Ethics Review Board" again mapped to the existing Scientific Review Committee/Ethics Board, consistent with the Ethics Charter and DPIA integrations above. Remains Phase 2 / Non-Blocking for MVP — the framework is explicitly advisory only and makes no autonomous governance decisions.

## Addendum 4 (same turn): Real AI Governance Framework Content Integrated

The user subsequently provided a substantially more detailed, real AI Governance specification ("Annex 17"): 10 core principles, an AI model lifecycle (Planning through Retirement), permitted/restricted AI functions, risk categories, validation/monitoring/documentation requirements, and its own explicit MVP-status/TODO sections. Unlike the other three annexes, AI Governance already had an existing canonical home — `docs/source/governance/AI_POLICY.md` — so this content was integrated there, not into a new file, preserving that document's existing stated relationship to `../foundation/05_AI.md` and `brain/AI/AI_GOVERNANCE_HIERARCHY.md` (reused, not redefined). "Scientific Review Board"/"Ethics Review Board" again mapped to the existing Scientific Review Committee/Ethics Board. The "Restricted AI Functions" list was reconciled as a restatement of the already-binding "AI never validates" rule (Scientific Review) and "advisory only" rule (Early Warning), not a new restriction layer.

**All four annexes (Ethics Charter, DPIA, Early Warning, AI Governance) are now substantially specified**, each remaining explicitly Phase 2 / Non-Blocking for MVP, each with documented extension points into the core HARM system, and none introducing a new domain entity, a parallel lifecycle, or a change to any LOCKED file.

## Alternatives Considered

- **Treat these four as full MVP blockers (status quo before this ADR).** Rejected per explicit human decision — this was the assumption implicitly carried by prior phase assessments; this ADR formally revises it.
- **Create new stub files for Ethics Charter and AI Governance too, alongside the existing documents.** Rejected — would duplicate existing canonical content, violating the repository's standing "one canonical document per concept" discipline.
- **Invent full specification content for DPIA and Early Warning to make the stubs more complete.** Rejected — no source material exists for either; a stub with honest gaps is more useful than a stub with fabricated content presented as real.
