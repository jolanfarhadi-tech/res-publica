# ADR-004: ECC Agent System

## Context

This session's own working method relied on ad hoc specialist agents (Product Strategist, Security Auditor, Software Architect, and others) dispatched per task. Ongoing development of Res Publica needs a persistent, named set of reviewers that enforce the platform's own standing principles — no gamification, AI-never-originates-institutional-positions, opt-in-only personalization, human-sign-off-required-before-publish — consistently, rather than depending on each engineer independently remembering all of them on every change.

## Decision

Define eight new specialized agent roles as a documented roster: Responsibility Agent, Eco Accountability Agent, Impact Agent, Plugin Architect Agent, Design System Agent, CLI Agent, Local Dev Agent, and Review & Validation Agent. Each has a defined trigger, input, and output (see Foundation Architecture, Section 3). This roster is conceptual at this stage — a specification for future agent definitions, not implemented `.claude/agents/*.md` files.

## Alternatives Considered

- **Rely on general-purpose code review only.** Rejected — general review has no reason to know that a progress bar is a gamification violation specific to this project's own stated principles; project-specific violations need a project-specific reviewer.
- **A single, do-everything "Governance Agent."** Rejected — an overloaded single agent has less clear trigger conditions and blurs genuinely distinct concerns (constitutional-principle compliance vs. cost/environmental proportionality vs. measurement-hook correctness) into one undifferentiated review pass.
- **Implement all eight as automated, blocking CI gates immediately.** Rejected as premature — this is real process overhead disproportionate to a 1–3 engineer team building the first module; the roster should be adopted incrementally as the team and codebase grow into needing that level of automation.

## Consequences

Real conceptual overlap exists between Responsibility Agent (constitutional-principle compliance) and Impact Agent (measurement-hook correctness) — both ultimately ask "did this feature do what the organization actually wants." This overlap must be kept deliberately distinct in practice by the dividing line stated in Foundation Architecture Section 3, or the two agents risk becoming redundant with each other.

## Future Impact

As the team grows toward the roadmap's projected 6–8 FTE by 2030, these eight roles are the natural seed for either genuine automated CI gates or dedicated human review responsibilities — whichever the team's size and risk tolerance justify at that point. The two agents recommended for earliest adoption (Responsibility Agent and Review & Validation Agent, per the Foundation Architecture's own risk notes) should be the first candidates evaluated for that transition, not all eight simultaneously.
