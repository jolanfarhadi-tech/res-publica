# Res Publica — Glossary

*Canonical definitions. If a term appears in more than one document with slightly different phrasing, this is the version that governs.*

## Civic / mission terms

- **Bürgerdialog** — the org's structured citizen-dialogue format; produces concrete recommendations that are publicly followed up.
- **Civic effect** — the org's own measure of success: did a dialogue happen that wouldn't have otherwise; did a decision become better informed. Never attention or engagement. See `CONSTITUTION.md` §4.
- **Fellowship** — the top rung of the Community ladder: dialogue facilitators, research reviewers, and per-language community leads, human-gated and non-gamified. Not a badge or score.
- **Participation-per-subscriber** — the platform's primary growth KPI, tracked per language community, deliberately replacing engagement/attention metrics.

## Technical / architectural terms

- **Tier 1 / Static Core** — the unchanged, Git-committed MDX static rendering layer. Fast, SEO-strong, never blocked by Tier 2 or 3.
- **Tier 2 / AI Retrieval Layer** — the Knowledge Graph and AI Layer; a read/cache layer derived deterministically from Tier 1, never a second source of truth.
- **Tier 3 / Personalization & Identity Layer** — the platform's first stateful, privacy-sensitive layer; opt-in, introduced last.
- **Grounded RAG / citation-or-refuse** — the AI Layer's core discipline: every answer traces to a specific published source, or the system declines to answer.
- **Core Domain Model** — the five (now six, post-stabilization) canonical shared entities: `Person`, `ConsentRecord`, `Payment`, `Organization`, `Notification`, `AuditLog`. See `BLUEPRINTS/foundation-architecture.md` §2.
- **Plugin Architecture / module manifest** — the contract by which a module declares its domain-entity usage, tables, APIs, and Dashboard/AI Layer consumption, so Core Platform never needs module-specific code.
- **ECC Agent System** — the 8 specialized reviewer/tooling agents (Responsibility, Eco Accountability, Impact, Plugin Architect, Design System, CLI, Local Dev, Review & Validation) dedicated to this project. See `AGENTS/ecc-agent-system.md`.
- **Offline-first** — the platform-wide principle that every module defines degraded-but-functional behavior when its dependency is unavailable, not just its happy path.

## Process terms

- **ADR (Architecture Decision Record)** — a Context/Decision/Alternatives/Consequences/Future Impact document explaining why a major architectural choice was made. Ten exist, at `../architecture/adr/`, unchanged since approval.
- **Foundation Architecture** — the phase (and the document) covering the domain model, plugin/CLI architecture, agent roster, and module integration map, produced after the Master and MVP Blueprints to reconcile duplication between them.
- **Foundation Review / Foundation Review (Final)** — the Architecture Review Gate documents; the first found 6 real issues, the second confirmed all 10 checklist items closed and approved the Foundation.
- **RPDF (Res Publica Development Framework)** — the name given to this project's overall phased methodology (Foundation → Stabilization → Brain migration → Phase 1) as of the most recent session milestones.
- **Project Brain** — this `/brain` directory; the Single Source of Truth for the whole project, index layer plus detail layer.
