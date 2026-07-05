# Governance

## Purpose
Defines how decisions are made, how conflicts are resolved, and how this documentation set itself may change.

## Background
Reused from the organization's existing Accountability Constitution and Brain governance rules — not a new governance model.

## Core Principles
Decision Hierarchy (Constitution vs. architecture decisions vs. index-layer documents); amendment-only discipline (nothing is silently rewritten); human approval required for every consequential decision.

## Definitions
- **Decision Hierarchy** — a rule is a conduct/accountability matter (governed by the Constitution) or an architecture/domain-model matter (governed by an ADR); a rule that is genuinely both requires both.
- **Human Approval Authority** — the standing role with authority to approve reviews, amendments, and escalated decisions; never an AI role.

## Framework
Constitution → ADRs (architecture matters) → this documentation tree (operating detail) → individual documents. A lower level never overrides a higher one.

## Workflow
1. A proposed change is drafted.
2. It is checked against the Decision Hierarchy for which authority governs it.
3. Human Approval Authority reviews and signs off.
4. The change is recorded, never silently substituted for the prior version.

## Roles
**Human Approval Authority** — approves. Any contributor may propose.

## Inputs
A proposed change, decision, or escalation.

## Outputs
An approved (or rejected) decision, recorded.

## Governance
This document describes governance; it is itself subject to the same process it describes.

## AI Integration
No AI role has approval authority under any circumstance (see `05_AI.md`).

## Examples
See the organization's existing Constitution for the full amendment process and ADR workflow this document summarizes.

## References
`brain/00_constitution/00_constitution.md` §§6, 13, 16, 17; `brain/GOVERNANCE/brain-governance-rules.md`

## Related Documents
`03_VALUES.md` · `05_AI.md` · `../governance/DECISION_MODEL.md` · `../governance/REVIEW_PROCESS.md`
