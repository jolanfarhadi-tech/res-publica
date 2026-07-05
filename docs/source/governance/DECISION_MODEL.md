# Decision Model

## Purpose
States precisely how a decision's governing authority is determined — which body or process decides what.

## Background
Reused directly from `../foundation/04_GOVERNANCE.md`'s Decision Hierarchy — this document applies that hierarchy operationally rather than restating its definition.

## Core Principles
Every decision has exactly one governing authority; no decision is made by an entity without standing authority over that decision type.

## Definitions
See `../foundation/04_GOVERNANCE.md` for the Decision Hierarchy's definition — not restated here.

## Framework
Conduct/accountability matters → Constitution. Architecture/domain-model matters → ADR. Operating detail → this documentation tree, under Human Approval Authority sign-off.

## Workflow
1. Classify the decision (conduct vs. architecture vs. operating detail).
2. Route to the correct governing authority.
3. Record the decision and its authority explicitly — never leave a decision's authority ambiguous.

## Roles
**Human Approval Authority** — decides or delegates, per classification.

## Inputs
A pending decision requiring classification.

## Outputs
A decision, with its governing authority explicitly recorded.

## Governance
Misclassifying a decision's authority (e.g., treating an architecture matter as mere operating detail) is itself a governance violation, per `../foundation/04_GOVERNANCE.md`.

## AI Integration
No AI role classifies or makes a decision under this model; it may only propose a classification for human confirmation.

## Examples
See `brain/00_constitution/00_constitution.md` §6 for the original, fully-worked Decision Hierarchy this model operationalizes.

## References
`../foundation/04_GOVERNANCE.md`; `brain/00_constitution/00_constitution.md` §6

## Related Documents
`REVIEW_PROCESS.md` · `../foundation/04_GOVERNANCE.md`
