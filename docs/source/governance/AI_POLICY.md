# AI Policy (AI Governance Framework)

```
Type: Governance (Placeholder, Phase 2, operational-process detail)
Status: Placeholder (Phase 2) — Non-Blocking for MVP, per ADR-023
Version: 1.0 (Annex 17 — Res Publica Governance Framework)
Authorized by: ADR-023
Extends/Reconciles with: docs/source/foundation/05_AI.md, brain/AI/AI_GOVERNANCE_HIERARCHY.md,
  brain/AI/AGENT_ACTIVATION_ROADMAP.md, docs/source/governance/ETHICS_CHARTER.md,
  docs/source/governance/DPIA.md, docs/source/governance/EARLY_WARNING.md
```

## Purpose

The AI Governance Framework establishes the principles, policies, responsibilities, and operational controls governing the design, development, deployment, monitoring, and oversight of Artificial Intelligence systems within the Res Publica ecosystem. Its purpose is to ensure that AI supports human decision-making without replacing human accountability, scientific judgment, or ethical responsibility. It promotes trustworthy, transparent, explainable, and human-centered AI throughout the HARM platform.

## Background

Previously reused `../foundation/05_AI.md` and `brain/AI/AI_GOVERNANCE_HIERARCHY.md` directly without adding independent content. This document is now built from a real, detailed specification ("Annex 17 — AI Governance Framework, Res Publica Governance Framework"), which supplies the operational-process detail this document always intended to hold, still without redefining the foundational statement in `05_AI.md` or the Executive/Operational layering in `AI_GOVERNANCE_HIERARCHY.md`.

## Objectives

Ensure responsible use of AI; protect human rights; maintain meaningful human oversight; prevent algorithmic harm; improve transparency and explainability; reduce algorithmic bias; support evidence-based governance; strengthen accountability; ensure regulatory readiness; promote continuous monitoring and improvement.

## Scope

Applies to: AI-assisted analysis, machine learning models, Large Language Models (LLMs), Natural Language Processing, classification systems, recommendation systems, pattern recognition, risk scoring assistance, predictive analytics, AI-enabled platform services — whether developed internally or integrated from third-party providers.

## Core Principles

1. **Human-Centered AI** — AI exists to support people, not replace them.
2. **Human Oversight** — every significant AI-generated recommendation remains subject to human review.
3. **Accountability** — a clearly identifiable person or governance body remains responsible for every decision supported by AI.
4. **Transparency** — users understand when AI has been used and what role it played.
5. **Explainability** — where reasonably possible, AI outputs are interpretable and understandable.
6. **Fairness** — AI systems are regularly evaluated for unfair bias and discriminatory outcomes.
7. **Privacy** — AI respects privacy requirements and applicable data protection standards (`DPIA.md`).
8. **Reliability** — AI systems operate consistently and predictably.
9. **Safety** — AI minimizes foreseeable harm and operates within defined governance boundaries.
10. **Continuous Improvement** — AI performance is continuously monitored and improved.

These reconcile with, and do not replace, `../foundation/05_AI.md`'s existing "AI retrieves, translates, connects, drafts — never originates" principle (Constitution Core Principle 1) — this is that principle's operational elaboration, not a competing principle set.

## Definitions

**AI Lifecycle:** Planning → Data Collection → Model Development → Testing → Validation → Deployment → Monitoring → Periodic Review → Retirement. This is the lifecycle of an AI *model/component itself* — distinct from the HARM Lifecycle or the Annex lifecycle, which govern civic evidence, not AI systems.

**Permitted AI Functions:** text summarization, translation, document classification, harm coding, pattern detection, topic clustering, evidence organization, similarity analysis, knowledge retrieval, dashboard generation, draft recommendations, workflow automation, reporting assistance.

**Restricted AI Functions — AI shall not independently:** make governance decisions; determine legal responsibility; replace scientific peer review; replace ethical review; approve policy decisions; issue sanctions; make judicial determinations; decide human rights questions; override human reviewers. This restates, and does not weaken, the "AI never validates" rule already binding on Scientific Review (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7) and the "advisory only, no autonomous governance decisions" rule already binding on Early Warning (`EARLY_WARNING.md`).

## Framework

**AI Risk Categories:** hallucinations, bias, privacy violations, inaccurate recommendations, lack of explainability, automation bias, model drift, security vulnerabilities, adversarial manipulation, over-reliance on AI.

**Risk Mitigation Measures:** human review, model validation, bias testing, security assessments, audit logging, confidence scoring, version control, continuous monitoring, incident reporting, regular retraining.

**AI Validation:** technical validation, functional testing, scientific review, ethical review, bias evaluation, security testing, performance monitoring.

**AI Monitoring:** accuracy, precision, recall, error rates, drift detection, user feedback, incident reporting, performance trends.

**AI Documentation** (per component): purpose, model description, training data sources, limitations, intended use, prohibited use, known risks, performance metrics, version history.

**Relationship with Other Frameworks:** the AI Governance Framework supports — not governs — HARM Taxonomy, AHIP, Structured Hearings, Scientific Review (the "Validation Framework"), Harm Codex, Ethics Charter, DPIA, Early Warning Framework, and Platform Services. None of these is redefined here.

## Workflow

Same Executive → Operational → Skills → Plugins → MCP Tools → Execution layering as `../foundation/05_AI.md` (unchanged). Any new AI capability proposal is reviewed against this policy before activation, following the Agent Activation Roadmap discipline (`brain/AI/AGENT_ACTIVATION_ROADMAP.md`).

**AI Incident Management:** potential incidents (incorrect outputs, harmful recommendations, security breaches, bias detection, unexpected behavior, privacy incidents) are each logged, investigated, reviewed, corrected, and documented.

## Roles

**Human-in-the-Loop:** every high-impact AI output is reviewed by an authorized human before implementation. Human reviewers remain responsible for validation, approval, interpretation, final decision, and accountability. Human Approval Authority approves all AI capability activations (retained).

**Governance Responsibilities** (Phase 2, not yet formally appointed): Platform Administration, AI Governance Board (future), Scientific Review Board (= Scientific Review Committee), Ethics Review Board (= Ethics Board), Security Team, Developers, Researchers, System Administrators.

## Inputs

A proposed AI capability or activation request (retained).

## Outputs

An approval, rejection, or "not yet approved — requires new ADR" determination (retained). **Deliverables** (new): AI Risk Assessments, Model Documentation, AI Audit Reports, Bias Assessment Reports, Explainability Reports, AI Performance Dashboards, Governance Recommendations.

## Governance

This is a governance-process document; it does not itself grant any AI capability new authority (retained).

## AI Integration

Self-referential — this document is itself part of what an AI capability proposal is checked against (retained).

## Examples

See `brain/AI/AGENT_ACTIVATION_ROADMAP.md` for a worked example of this review process applied to specific agents (retained).

## MVP Status & Extension Points

**Current Role:** Placeholder / Governance Extension. **Blocking Status:** NON-BLOCKING. **Implementation Priority:** Phase 2. **Current Requirement:** architecture placeholder only, consistent with `ADR-023`.

**Interfaces:** Ethics Charter, DPIA, Platform Services, Scientific Review, the Validation Framework, Early Warning Framework, HARM Codex, AHIP, Structured Hearings, Monitoring & Evaluation — each reserves an AI Governance check extension point; none is enforced yet.

## Future Responsibilities (Phase 2)

The complete framework may include: AI Model Registry; AI Approval Workflow; AI Ethics Assessment; Automated Bias Monitoring; Explainability Framework; AI Compliance Dashboard; Model Lifecycle Management; AI Audit Procedures; Third-Party AI Assessment; AI Certification Process.

## TODO (later expansion)

- [ ] Establish an AI Governance Board.
- [ ] Define AI approval and review workflows (implementing the automated version of `AGENT_ACTIVATION_ROADMAP.md`'s discipline).
- [ ] Create AI model documentation templates.
- [ ] Implement bias testing procedures.
- [ ] Develop explainability standards.
- [ ] Build AI audit mechanisms.
- [ ] Integrate AI risk monitoring into dashboards.
- [ ] Define AI incident response procedures.
- [ ] Maintain an AI model inventory.
- [ ] Align the framework with the EU AI Act before production deployment.
- [ ] Consolidate this policy with `../foundation/05_AI.md` and `brain/AI/AI_GOVERNANCE_HIERARCHY.md` into one canonical owner, per `standards/RP_STANDARD_001_DOCUMENTATION_ARCHITECTURE.md` §3 (flagged, not performed here).

## References

`../foundation/05_AI.md`; `brain/AI/AI_GOVERNANCE_HIERARCHY.md`; `brain/AI/AGENT_ACTIVATION_ROADMAP.md`

## Related Documents

`../foundation/05_AI.md` · `DECISION_MODEL.md` · `REVIEW_PROCESS.md` · `ETHICS_CHARTER.md` · `DPIA.md` · `EARLY_WARNING.md`
