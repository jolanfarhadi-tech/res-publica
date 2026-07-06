# Early Warning Framework

```
Type: Governance (Placeholder, Phase 2)
Status: Placeholder (Phase 2) — Non-Blocking for MVP, per ADR-023
Version: 1.0 (Annex 16 — Res Publica Governance Framework)
Authorized by: ADR-023
Extends/Reconciles with: brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md §7,
  brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md,
  docs/source/methodology/CIVIC_INTELLIGENCE.md, docs/source/governance/ETHICS_CHARTER.md,
  docs/source/governance/AI_POLICY.md, docs/source/governance/DPIA.md
```

## Purpose

The Early Warning Framework establishes the strategic capability of the Res Publica ecosystem to identify emerging harms, governance failures, social risks, institutional vulnerabilities, and systemic threats before they escalate into larger crises. Rather than reacting to harm after it occurs, the framework supports proactive governance through continuous monitoring, risk assessment, and timely intervention.

## Background

Previously a minimal stub reserving only the `published → signal_released` state transition (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7) and the `compounds_into` Knowledge Graph edge. This document is now built from a real, detailed specification ("Annex 16 — Early Warning Framework, Res Publica Governance Framework"), superseding the prior stub's minimal content. **The framework is advisory and does not make autonomous governance decisions** — it does not replace either of those two existing architectural hooks; it specifies what happens once they fire.

## Objectives

Detect emerging patterns of harm; monitor governance risks; identify systemic vulnerabilities; support preventive decision-making; improve institutional resilience; strengthen governance capacity; reduce the long-term impact of harm; enable evidence-based preventive action.

## Scope

Applies to: HARM Taxonomy (National Harm Taxonomy, `ADR-021`), AHIP Intake, Structured Hearings, Harm Codex, the Evidence Repository (Responsibility Evidence / Annex records), Platform Analytics, AI-assisted monitoring, Governance Dashboards, Civic Intelligence, and future external data integrations. **The framework is advisory and does not make autonomous governance decisions.**

## Core Principles

1. **Prevention First** — prioritizes prevention over reaction whenever possible.
2. **Evidence-Based Monitoring** — alerts are supported by verifiable evidence, not assumptions.
3. **Human Oversight** — all significant alerts require human review before governance actions are taken.
4. **Transparency** — alert generation criteria are documented and explainable.
5. **Proportionality** — responses are proportionate to the assessed level of risk.
6. **Continuous Learning** — detection models improve through validated feedback and ongoing evaluation.

## Definitions

**Monitoring Domains:** Governance Risks, Institutional Capacity, Social Cohesion, Public Health, Environmental Risks, Civic Participation, Information Integrity, Economic Pressures, Human Rights Indicators, Digital Governance, AI System Performance, Platform Operations.

**Early Warning Indicators (examples):** rapid increase in reported harms, repeated harm patterns, geographic clustering, escalating severity scores, declining institutional trust indicators, repeated evidence inconsistencies, sudden participation changes, high-risk governance trends, emerging vulnerability clusters.

**Alert Levels** (graduated — these occur *after* the existing `signal_released` state fires, not as a competing mechanism):
- **Level 1 — Informational:** observation only, no action required.
- **Level 2 — Advisory:** potential concern; monitoring should increase.
- **Level 3 — Elevated Risk:** review by responsible governance actors recommended.
- **Level 4 — High Risk:** formal governance review should be initiated; preventive measures may be considered.
- **Level 5 — Critical:** immediate assessment by authorized governance bodies; potential coordinated intervention.

## Framework

**Detection Sources:** AHIP submissions, Structured Hearings, Harm Codex trends, the Evidence Repository, Platform Analytics, Research Findings, Expert Assessments, Public Reports, aggregated statistical indicators, future external data sources.

**Detection Methods:** statistical trend analysis, pattern recognition (reuses the existing `compounds_into` Knowledge Graph edge and Civic Intelligence's Pattern Recognition, not a new mechanism), threshold monitoring, risk scoring, temporal analysis, geographic analysis, network analysis, AI-assisted pattern detection, expert review.

**Risk Assessment dimensions:** severity, scale, geographic distribution, population affected, likelihood, urgency, confidence level, evidence strength, potential impact — consistent with the existing rule that confidence evaluates evidence quality and patterns, never people (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7 Governance Guardrail 3).

**Relationship with Other Frameworks:** the Early Warning Framework supports — not governs — HARM Taxonomy, AHIP, Structured Hearings, Harm Codex, the Scientific Review Governance Gate, Civic Intelligence, AI Governance Framework, Ethics Charter, and Platform Services. None of these is redefined here.

## Workflow

**Alert Workflow:** Signal Detected (= the existing `published → signal_released` transition) → Evidence Validation → Risk Assessment → Human Review → Priority Assignment → Governance Recommendation → Monitoring → Feedback and Learning.

## Roles

**Governance Responsibilities** (Phase 2, not yet formally appointed): Platform Administration, Governance Committee, Scientific Review Board (= Scientific Review Committee, per the reconciliation already established in `ETHICS_CHARTER.md`), Risk Assessment Team, Ethics Review Board (= Ethics Board, `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7), AI Governance Team.

## Inputs

Published Annexes (`signal_released` state) and the Detection Sources listed above.

## Outputs

Early Warning Alerts, Risk Bulletins, Trend Reports, Governance Dashboards, Escalation Notices, Preventive Recommendations, Monitoring Reports.

## Governance

**Human Oversight (binding, not advisory):** the Early Warning Framework provides recommendations only. It shall not: make final governance decisions; trigger automatic sanctions; replace expert judgement; replace scientific review. Final decisions remain the responsibility of authorized governance bodies. This is consistent with, and does not weaken, the existing "AI never validates" / human-in-the-loop-mandatory discipline already binding on Scientific Review and Civic Intelligence.

## AI Integration

AI-assisted pattern detection and anomaly detection are permitted as *inputs* to human review — never as an autonomous trigger for governance action, consistent with `../foundation/05_AI.md` and `AI_POLICY.md`.

## Examples

Reserved — pending approved case material.

## MVP Status & Extension Points

**Current Role:** Placeholder / Governance Extension. **Blocking Status:** NON-BLOCKING. **Implementation Priority:** Phase 2. **Current Requirement:** architecture placeholder only, consistent with `ADR-023`.

**Interfaces:** HARM Codex, AHIP, Structured Hearings, the Scientific Review Governance Gate, Platform Services, Civic Intelligence, AI Governance, Ethics Charter, Monitoring & Evaluation — each reserves an Early Warning extension point; none is enforced yet.

## Future Responsibilities (Phase 2)

The complete framework may include: Predictive Risk Models; Automated Trend Detection; Cross-Domain Risk Correlation; Geographic Risk Mapping; Institutional Risk Dashboards; Scenario Simulation (reconciles with, does not duplicate, Civic Intelligence's existing Scenario Thinking step); Preventive Policy Recommendations; External Data Integration; Machine Learning Models; Real-Time Monitoring Services.

## TODO (later expansion)

- [ ] Define quantitative early warning indicators.
- [ ] Establish risk scoring methodology.
- [ ] Design the alert validation workflow.
- [ ] Create governance escalation procedures.
- [ ] Develop monitoring dashboards.
- [ ] Integrate AI-assisted anomaly detection.
- [ ] Define notification channels.
- [ ] Build trend analysis modules.
- [ ] Connect to Platform Services and Analytics.
- [ ] Validate predictive models before production deployment.
- [ ] Locate or author the full `EARLY_WARNING_PROPOSAL.md` specification (retained from prior stub — no such document has been found anywhere accessible to this repository).

## References

`brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7; `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md`

## Related Documents

`../methodology/CIVIC_INTELLIGENCE.md` · `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` · `../governance/ETHICS_CHARTER.md` · `../governance/AI_POLICY.md` · `../governance/DPIA.md`
