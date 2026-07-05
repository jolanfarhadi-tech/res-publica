# Responsibility Dashboard

## Purpose
The Responsibility Dashboard is the ecosystem's **prioritization instrument** — not merely a visualization or reporting layer. Its job is to answer, from the accumulated Responsibility Maps, which issues, regions, or communities most warrant the deeper, resource-intensive work of Annex Deepening. It is the third Innovation, positioned deliberately *before* Annex generation in the primary lifecycle. Canonical name: **Responsibility Dashboard** (UI label: "Dashboard"). Short formula for the first three Innovations: **Listen. Map. Measure. Act.**

## Background
Specified in `brain/FOUNDATION/01_HARM_OPERATING_SYSTEM.md` (Innovation 3) and in the corrected lifecycle of `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` (see `architecture/adr/ADR-016-responsibility-dashboard-specification.md` for the correction record). **Naming note:** this is a knowledge product, distinct from any product-engineering "Dashboard" UI module elsewhere in the organization's technical architecture — related in kind (both aggregate, read-only views) but not the same artifact.

**Architecture correction:** an earlier draft of the Annex/Blockchain architecture (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`, pre-ADR-016) described the Dashboard primarily as a downstream consumer of Impact Framework output. That characterization is corrected here: the Dashboard's **primary** process position is upstream, Innovation 3, before Annex generation — it identifies which patterns should be deepened into Annexes. It **secondarily**, and later, may also consume validated Impact Framework results to refresh its aggregate view. Both roles are real; only the primary/secondary emphasis was wrong before.

## Core Principles
Aggregate and pattern-level only; never an individually-scored or ranked view; prioritization by collective human judgment, not automated scoring; human-in-the-loop is mandatory at every stage that touches the Dashboard.

## Definitions
The Responsibility Dashboard is a structured prioritization view, aggregating Responsibility Maps and Observer input to identify which issues, regions, or communities warrant Annex Deepening — the collective act of measuring, not merely displaying.

## Framework

### Four components

**a) Responsibility Observer Panel** — a standing group of Observers (existing role, `brain/FOUNDATION/01_HARM_OPERATING_SYSTEM.md` §Roles) who contribute structured reflections on recurring patterns they notice across Hearings and Maps. Reflections are **role-attributed only** (e.g., "an Observer noted...") — never name-attributed. The Panel's role is to surface candidate patterns for prioritization, not to approve or finalize anything.

**b) HARM Lens** — the analytical filter applying the existing H-A-R-M engine (Harm, Accountability, Repair, Mobilization — `01_HARM_OPERATING_SYSTEM.md` §Framework) to aggregated Responsibility Map data, so that prioritization is grounded in the same four-part analysis used throughout the methodology, not a separate or competing framework.

**c) Responsibility Priority Matrix** — the structured, collective-judgment process that ranks candidate patterns (never people) by severity, recurrence, and civic urgency, producing a Top Priority Selection. The Matrix itself does not "score" — it organizes qualitative human deliberation into a comparable, transparent form.

**d) Visualizations & Metrics** — read-only aggregate views (charts, maps, trend lines) of pattern concentration across issues, regions, communities, or society. Never a per-person or per-Organization view (see Governance).

### Data Model (conceptual, not a schema)
The Dashboard operates over: the accumulated Responsibility Map set (input); Observer Panel reflections (role-attributed); the Responsibility Priority Matrix's collective-judgment output; and, secondarily, validated Impact Records once available (`brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §3). No new domain entity is introduced here — this remains a view over existing Responsibility Evidence and `AuditLog`-derived data, consistent with the Core Domain Model (LOCKED); any future concrete data representation requires its own ADR against that locked document.

### Civic Responsibility Index
Where an aggregate index is produced, it **must always show its scope explicitly** (issue, region, community, or society) and **must never use a "person" scope** — an index without a stated non-person scope is not a valid Dashboard output.

## Workflow
1. **Listen** — Responsibility Maps accumulate from Structured Hearings and Mapping (`../methodology/RESPONSIBILITY_MAPPING.md`).
2. **Map** — patterns are aggregated across Maps.
3. **Measure** — the Responsibility Observer Panel and HARM Lens inform the Responsibility Priority Matrix; the Matrix produces a Top Priority Selection through collective human judgment.
4. **Act** — the Top Priority Selection feeds Annex Deepening (`../methodology/RESPONSIBILITY_ANNEXES.md`, `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`).
5. *(Secondary, later)* — once Impact Records exist for prior Civic Contributions, the Dashboard's Visualizations & Metrics may incorporate them to refresh the aggregate view. This does not change step 1–4's primary flow.

## Roles
**Researcher** — performs aggregation and pattern analysis. **Observer** — contributes role-attributed reflections via the Observer Panel; may also review for process integrity. **Fellowship participants** — see Fellowship Session 3, below.

## Inputs
The accumulated Responsibility Map set; Observer Panel reflections; (secondarily) validated Impact Records.

## Outputs
A Top Priority Selection, feeding Annex Deepening; aggregate Visualizations & Metrics; where applicable, a scoped Civic Responsibility Index.

## Governance

**Zero-Gamification Guardrails (binding, not advisory):**
- Metrics apply to issues, regions, communities, or society — **never individual persons**.
- No personal scoring, ranking, leaderboard, or gamification of any kind.
- Observer reflections are role-attributed only, never name-attributed.
- A Civic Responsibility Index must always show its scope and must never use "person" scope.
- Scores/priorities are produced by collective human judgment (the Priority Matrix process), never by automated AI scoring.
- Human-in-the-loop is mandatory — no Dashboard output is finalized without human review.

## AI Integration
AI may assist in identifying candidate patterns for human review and in preparing aggregate visualizations; it does not set priority, does not score, and does not publish a Top Priority Selection without human sign-off — consistent with `docs/source/foundation/05_AI.md`.

## Website vs. Platform Distinction
The public **Website** (`docs/source/projects/WEBSITE.md`) may describe the Dashboard's purpose and show illustrative, non-sensitive aggregate examples, consistent with its "explanation only" pattern already established for the Harm Codex (`../methodology/HARM_CODEX.md`). The **Platform** (the internal HARM operating system itself) is where the actual Responsibility Observer Panel, HARM Lens, and Responsibility Priority Matrix operate on real data. The Website never exposes live prioritization data or in-progress Matrix deliberations.

## Fellowship Session 3
Within the Responsibility Community Fellowship (`docs/source/projects/COMMUNITY.md`), Session 3 is where Fellows engage directly with the Responsibility Dashboard's current Top Priority Selection — reviewing it, contributing Observer-role reflections, and helping validate that the Priority Matrix's output reflects genuine community concern. This is a participation point, not an approval authority — final prioritization remains a collective human-judgment process bounded by the Priority Matrix, not a Fellowship vote.

## Examples
Reserved — pending approved case material.

## References
`brain/FOUNDATION/01_HARM_OPERATING_SYSTEM.md`; `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`; `architecture/adr/ADR-016-responsibility-dashboard-specification.md`; `brain/APPLICATION/APPLICATION_ARCHITECTURE.md` (product Dashboard, distinct artifact)

## Related Documents
`../methodology/RESPONSIBILITY_MAPPING.md` · `../methodology/RESPONSIBILITY_ANNEXES.md` · `../projects/COMMUNITY.md` · `../projects/WEBSITE.md`
