# ADR-016: Responsibility Dashboard Specification and Lifecycle Correction

## Status
Accepted

## Context

The user supplied a detailed "RESPONSIBILITY DASHBOARD — SPEZIFIKATION" with two demands: (1) correct an architecture nuance in ADR-014/`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`, which had described the Responsibility Dashboard primarily as a downstream consumer of Impact Framework output; and (2) add the full Dashboard specification (four components, outputs, data model, Zero-Gamification Guardrails, Website vs. Platform distinction, Fellowship Session 3 role) — none of which existed anywhere in the repository before this ADR.

Review of existing files (per the user's explicit requirement) found: `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md` already correctly positioned the Dashboard as Innovation 3, upstream, "feeding Responsibility Annexes" — it was never wrong. The actual defect was in `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` (ADR-014), whose new lifecycle had reframed the Dashboard's relationship to Annexes in a way that understated its upstream, primary role.

## Decision

**Corrected `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` (ADR-014, amended in place with an appended note, not rewritten):**
- §2 Full Lifecycle now reads: Listening/Structured Hearings → Responsibility Mapping → Responsibility Dashboard → Top Priority Selection → Annex Deepening → Evidence Package → Scientific Review Committee → Approved Annex → Blockchain Annex Block → Civic Contribution Mapping → Contribution Ledger → Contribution & Impact Framework → (secondary, later) Responsibility Dashboard.
- §5 rewritten to state the Dashboard has one **primary** role (upstream prioritization instrument) and one **secondary** role (later aggregate-view refresh from Impact Records), replacing the prior "two parallel equal paths" framing.
- §8 ERD updated to show the Dashboard feeding Top Priority Selection → Annex Deepening as the primary relationship, with the Impact-Record-to-Dashboard edge redrawn as optional/secondary.
- §9 System Integration's Dashboard bullet corrected to state primary/secondary roles explicitly.

**Extended `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md` in place** (the pre-existing canonical document, not a new file) with the full specification:
- **Definition** as prioritization instrument, not merely visualization/reporting.
- **Four components:** Responsibility Observer Panel (role-attributed reflections, never name-attributed), HARM Lens (applies the existing H-A-R-M engine, no new analytical framework), Responsibility Priority Matrix (collective human judgment, produces Top Priority Selection, never an automated score), Visualizations & Metrics (aggregate, scoped, read-only).
- **Data model** (conceptual — no new domain entity; remains a view over existing Responsibility Evidence/`AuditLog` data, consistent with the LOCKED Core Domain Model).
- **Civic Responsibility Index rule** — must always show scope; must never use "person" scope.
- **Zero-Gamification Guardrails** — all six rules from the user's specification, stated as binding.
- **Website vs. Platform distinction** — Website is explanation-only (consistent with the existing Harm Codex pattern); Platform is where the Observer Panel/HARM Lens/Priority Matrix actually operate.
- **Fellowship Session 3** — a participation point for Fellows to review and reflect on the current Top Priority Selection; explicitly not an approval authority.

## Governance Rules Preserved (verbatim from the user's specification, now binding in `RESPONSIBILITY_DASHBOARD.md`)

1. Metrics apply to issues, regions, communities, or society — never individual persons.
2. No personal scoring, ranking, leaderboard, or gamification.
3. Observer reflections are role-attributed only, not name-attributed.
4. The Civic Responsibility Index must always show its scope and must never use "person" scope.
5. Scores are produced by collective human judgment, not automated AI scoring.
6. Human-in-the-loop is mandatory.

These are consistent with, and do not replace, the ecosystem's existing Zero Gamification principle (Core Principle 2) — they are its specific application to Dashboard metrics.

## Consequences

- `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md` is now the single, complete canonical specification for the Dashboard; no separate specification document was created.
- ADR-014's original text is preserved unedited, with a correction appended per the Constitution's amendment discipline (§17) — nothing was silently rewritten.
- The "direct path" (single Hearing → Evidence Package, bypassing Dashboard-driven prioritization) in `RESPONSIBILITY_ANNEXES.md` remains valid but is now explicitly stated as secondary to the Dashboard-driven primary route.
- No new domain entity was added to the LOCKED Core Domain Model; Observer Panel, HARM Lens, and Priority Matrix are process/role concepts, not proposed as new stored entities in this ADR.

## Alternatives Considered

- **Create a new standalone "Responsibility Dashboard Specification" document.** Rejected — `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md` already existed as the canonical document for this exact concept and already had the correct primary positioning; extending it was the non-duplicating choice, consistent with the user's own requirement 1.
- **Rewrite ADR-014 in place rather than append an amendment note.** Rejected — the Constitution's own amendment discipline requires appending, not silently editing, prior decisions; an ADR is itself subject to the same rule as any other governed document.
- **Treat the direct Hearing path as invalid now that the Dashboard-driven path is primary.** Rejected — the user's correction addressed sequencing/emphasis, not the existence of the direct path; nothing in the specification instructed removing it.
