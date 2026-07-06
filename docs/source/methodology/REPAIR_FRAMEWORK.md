# Repair Framework

```
Type: Methodology (Core Module)
Status: Substantially specified — architecture only; implementation not started
Version: 1.0 (Annex 10 — Res Publica Governance Framework)
Extends/Reconciles with: docs/source/foundation/01_HARM_OPERATING_SYSTEM.md (H-A-R-M engine, "Repair"),
  brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md §13 (Transferable Civic Value,
  "repair value"), docs/source/methodology/RESPONSIBILITY_MAPPING.md, docs/source/methodology/RESPONSIBILITY_DASHBOARD.md,
  docs/source/methodology/AHIP.md
```

## Purpose

The Repair Framework establishes the standardized methodology for transforming validated harm into coordinated repair actions. It provides the governance processes, decision models, and operational mechanisms required to restore trust, strengthen institutions, improve public policies, and reduce future harm. It does not seek punishment as its primary objective — it prioritizes sustainable repair, institutional learning, and long-term governance improvement.

**Alias note:** referenced as "Grammar of Repair" in `EVIDENCE_MODEL.md`'s source specification — the same framework, not a second one.

**This is the full operational specification of two already-established but previously undetailed concepts:** the HARM Operating System's H-A-R-M analytical engine's **"R" (Repair)** letter (`01_HARM_OPERATING_SYSTEM.md` §Framework: "identifies what would remedy the harm, and whether repair has been attempted") and Transferable Civic Value's **repair value** (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §13: "supports remedy where harm is acknowledged"). This document does not introduce a new concept — it operationalizes two that already existed at a single-line level.

## Mission

To transform evidence-based understanding of harm into practical, measurable, and accountable repair strategies that strengthen society, institutions, and democratic governance.

## Objectives

Restore trust; reduce future harm; strengthen governance capacity; promote institutional learning; improve public policy; support accountability; encourage collaborative problem-solving; build long-term societal resilience.

## Scope

Applies to individual, community, institutional, structural, environmental, economic harms, public policy failures, governance failures, civic participation initiatives, and future HARM modules.

## Core Principles

1. **Repair Before Punishment** — priority is given to repairing harm rather than focusing exclusively on sanctions.
2. **Evidence-Based Repair** — repair actions are based on validated evidence and scientific analysis (i.e., a Validated Annex, per Scientific Review).
3. **Shared Responsibility** — repair is a collaborative process involving institutions, communities, experts, and affected stakeholders.
4. **Participation** — affected individuals and communities are meaningfully involved in designing repair strategies.
5. **Accountability** — repair actions clearly identify responsible actors and implementation responsibilities.
6. **Sustainability** — repair strengthens long-term governance capacity rather than providing only temporary solutions.

## Definitions

**Repair** (unqualified) means the full lifecycle below, not merely the H-A-R-M engine's single analytical judgment of "whether repair has been attempted" — that judgment is this framework's *trigger*, not a substitute for it.

**Types of Repair:**
- **Individual Repair** — support for affected individuals (access to services, mediation, capacity building, information support).
- **Community Repair** — strengthening communities (dialogue, community engagement, local partnerships, collaborative projects).
- **Institutional Repair** — improving organizational performance (policy revision, administrative reform, capacity development, governance improvement).
- **Structural Repair** — addressing systemic causes (regulatory reform, institutional redesign, cross-sector collaboration, long-term strategic planning).
- **Knowledge Repair** — improving evidence, research, and institutional learning (scientific studies, knowledge repositories, best-practice development, lessons learned).

## Framework

### Repair Lifecycle

```
Validated Harm (= a validated, Scientific-Review-approved Annex)
  ↓
Root Cause Analysis
  ↓
Responsibility Mapping (= consumes the existing Responsibility Map, does not re-run Responsibility Mapping Lab's own process)
  ↓
Repair Design
  ↓
Stakeholder Consultation
  ↓
Implementation Planning
  ↓
Resource Allocation
  ↓
Execution
  ↓
Monitoring
  ↓
Evaluation
  ↓
Continuous Improvement
```

This lifecycle begins downstream of, and does not alter, the existing Annex/Scientific Review lifecycle (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §2) — "Validated Harm" here is that lifecycle's Approved Annex, referenced not redefined. "Responsibility Mapping" (step 3) reuses the output already produced by **Responsibility Mapping Lab** (`RESPONSIBILITY_MAPPING.md`) — this framework does not run a second, competing mapping process.

**Root Cause Analysis identifies:** immediate causes, contributing factors, systemic drivers, institutional weaknesses, governance failures, external influences.

**Repair Planning defines:** objectives, expected outcomes, responsible actors, required resources, timeline, success indicators, monitoring methods, risks, dependencies.

**Decision Criteria** (for repair prioritization): severity of harm, number of people affected, governance impact, urgency, feasibility, available resources, long-term sustainability, evidence strength. This is a repair-specific prioritization, distinct from but consistent with the **Responsibility Dashboard's Priority Matrix** ("Prioritization Framework" in the source specification) — the Dashboard prioritizes which patterns get deepened into Annexes; this framework prioritizes which validated harms get repair resources. Neither redefines the other.

## Workflow

1. A validated Annex (Scientific-Review-approved) triggers Root Cause Analysis.
2. Responsibility Mapping output is consumed (not re-derived).
3. A Repair Plan is designed, per the Repair Planning fields above.
4. Stakeholder Consultation follows, per the Stakeholders list below.
5. Implementation Planning, Resource Allocation, and Execution proceed.
6. Monitoring and Evaluation run continuously, feeding Continuous Improvement.

## Roles

**Stakeholders:** affected communities, citizens, researchers, experts, public institutions, NGOs, civil society organizations, partner organizations, governance bodies.

**Governance Responsibilities** (Phase 2 appointment, not yet formal): Governance Committee, Repair Coordination Team, Researchers, Scientific Review Board (= Scientific Review Committee, per the reconciliation established in `ETHICS_CHARTER.md`/`EARLY_WARNING.md`), Community Representatives, Public Institutions, Partner Organizations, Platform Administration.

## Inputs

A validated Annex (Scientific Review output) and its associated Responsibility Map.

## Outputs

Repair Plans, Policy Recommendations, Institutional Improvement Plans, Community Action Plans, Governance Recommendations, Monitoring Reports, Evaluation Reports, Lessons Learned, Best Practice Documentation.

## Governance

**Relationship with Other Frameworks:** triggered only by a validated Annex — i.e., material that has passed the Scientific Review Governance Gate, the sole source of validation in this chain. AHIP and Structured Hearings contributed the underlying account and contextual reflections earlier in the lifecycle, but do not themselves validate; Harm Codex and Responsibility Mapping provide supporting context, not additional validation. Its outputs support the RPCS Program, Civic Intelligence, Monitoring & Evaluation, Early Warning Framework, Governance Dashboards, and Policy Development. None of these is redefined here.

**Quality Assurance:** repair plans should be evidence-based, feasible, transparent, inclusive, measurable, accountable, and periodically reviewed.

## AI Integration

Not specified beyond the general AI Governance boundary (`docs/source/governance/AI_POLICY.md`) — no repair decision is AI-originated; "AI-assisted repair planning" is named only as a Future Enhancement (below), not current scope.

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

AI-assisted repair planning, repair simulation models, cost-benefit analysis tools, cross-country repair benchmarking, collaborative implementation dashboards, impact forecasting, resource optimization models.

## MVP Status

**Current Role:** Core Operational Module. **Blocking Status:** MVP CRITICAL. **Implementation Priority:** Phase 1. **Current Requirement:** architecture now specified (this document); **implementation has not started** — no Repair Plan template, tracking system, or dashboard exists yet in this repository.

## TODO (implementation — not started)

- [ ] Develop standardized Repair Plan templates.
- [ ] Integrate with AHIP and Harm Codex (via the existing handoff points already documented in `AHIP.md`).
- [ ] Create stakeholder engagement workflows.
- [ ] Implement monitoring dashboards.
- [ ] Define repair success indicators (KPIs).
- [ ] Build evaluation and feedback mechanisms.
- [ ] Connect repair outcomes to the Early Warning Framework for continuous learning.

## References

`docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` (H-A-R-M engine); `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §13 (Transferable Civic Value)

## Related Documents

`../foundation/01_HARM_OPERATING_SYSTEM.md` · `../methodology/AHIP.md` · `../methodology/RESPONSIBILITY_MAPPING.md` · `../methodology/RESPONSIBILITY_DASHBOARD.md` · `../methodology/EVIDENCE_MODEL.md` · `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`
