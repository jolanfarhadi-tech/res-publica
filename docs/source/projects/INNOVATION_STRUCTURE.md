# Innovation Structure — Canonical Architecture Overview

```
Type: Project (Canonical Overview / Root Document)
Status: Canonical
Version: 1.3.0 — last restructured: Critical ordering conflict resolved via ADR-020 (Dual Intake and Review Paths); prior "Known Architecture Decision Needed" callout updated to RESOLVED
Authorized by: N/A — pure synthesis of already-canonical content, no new decision introduced
Extends/Reconciles with: docs/source/foundation/01_HARM_OPERATING_SYSTEM.md,
  docs/source/methodology/RESPONSIBILITY_BIOGRAPHY_LAB.md,
  docs/source/methodology/RESPONSIBILITY_MAPPING.md,
  docs/source/methodology/RESPONSIBILITY_DASHBOARD.md,
  docs/source/methodology/RESPONSIBILITY_ANNEXES.md,
  docs/source/methodology/CIVIC_INTELLIGENCE.md,
  brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md,
  brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md,
  brain/ARCHITECTURE/CIVIC_INTELLIGENCE_LAYER.md,
  brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md,
  architecture/adr/ADR-007-knowledge-graph.md
```

**This is the canonical architecture overview of the entire Res Publica Responsibility Lab ecosystem — the root document for all Responsibility Lab Innovations.** It is not another specification. It defines nothing new: every concept named here is owned canonically by another document, cited and linked, never redefined. Its sole purpose is to show, in one place, how the pieces that were built separately (across roughly a dozen documents and ADR-007, ADR-013 through ADR-019) actually fit together as a single ecosystem.

---

## 1. Purpose

Each Responsibility Lab Innovation, and each supporting system around it, has been specified in its own canonical document. No single document, before this one, showed the complete, end-to-end picture — from a citizen's first account to institutional learning — in one continuous view. This document is that missing overview, synthesized strictly from what is already canonical. It introduces no new architecture decision, which is why no ADR authorizes it (per `standards/RP_STANDARD_001_DOCUMENTATION_ARCHITECTURE.md` §9, traceability applies to documents that introduce a decision; this one summarizes decisions already made elsewhere).

## 2. The Five Canonical Innovations

| # | Canonical Name | UI Label | Canonical Document | Purpose |
|---|---|---|---|---|
| 1 | Responsibility Biography Lab | Biography Lab | `docs/source/methodology/RESPONSIBILITY_BIOGRAPHY_LAB.md` | Listening: captures Citizen Experience |
| 2 | Responsibility Mapping Lab | Mapping Lab | `docs/source/methodology/RESPONSIBILITY_MAPPING.md` | Identifies who/what holds responsibility |
| 3 | Responsibility Dashboard | Dashboard | `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md` | Prioritization instrument (Observer Panel, HARM Lens, Priority Matrix) |
| 4 | Responsibility Annexes | Annexes | `docs/source/methodology/RESPONSIBILITY_ANNEXES.md` | Produces the verified evidence unit (the Annex) |
| 5 | Civic Intelligence Lab | Civic Intelligence Lab | `docs/source/methodology/CIVIC_INTELLIGENCE.md`, deepened by `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_LAYER.md` | Synthesizes validated evidence into collective understanding |

**Not yet canonical, flagged, not adopted here:** `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_LAYER.md` names two further Innovations — 6 (Policy & Action Lab) and 7 (Responsibility Observatory) — explicitly as proposed extensions pending their own future decision against `01_HARM_OPERATING_SYSTEM.md`. This document does not treat them as canonical, consistent with that document's own flag and `ADR-019`'s (draft) Open Question 1.

## 3. The Unified Lifecycle

This is the first document to show the complete path in one continuous diagram — every stage name below is taken directly from an existing canonical document; none is invented here.

```mermaid
flowchart TD
    CE[Citizen Experience / Listening — Innovation 1] --> AHIP[AHIP Intake]
    AHIP --> SH[Structured Hearing]
    SH --> RM[Responsibility Mapping Lab — Innovation 2]
    RM --> Dash[Responsibility Dashboard — Innovation 3]
    Dash -->|Observer Panel + HARM Lens + Priority Matrix| TPS[Top Priority Selection]
    TPS --> AD[Annex Deepening]
    AD --> EP[Evidence Package]
    EP --> SR{Scientific Review — 4 Levels}
    SR -- Approved --> AA[Approved Annex — Innovation 4]
    SR -- Returned --> AD
    AA --> BAB[Blockchain Annex Block]
    BAB --> CCM[Civic Contribution Mapping]
    CCM --> CL[Contribution Ledger]
    CL --> CIF[Contribution & Impact Framework — Trust, Impact Record]
    CIF --> CI[Civic Intelligence Lab — Innovation 5]
    CI -->|6-step Intelligence Cycle| ORS[Civic Intelligence Report / Orientation Statements]
    ORS -.institutional & community learning.-> CE
```

Every node above is owned by exactly one existing canonical document (§7, References). The **Knowledge Graph** (`ADR-007`, specialized by `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md`) is not a stage in this flow — it is the persistent memory layer underlying every stage, per its own core sentence: *"The Knowledge Graph is the memory; the Civic Intelligence Layer is the thinking about it."*

> **✅ RESOLVED — see `architecture/adr/ADR-020-dual-intake-and-review-paths.md`.** "Structured Hearing" and "Expert Review" appear in different orders across `01_HARM_OPERATING_SYSTEM.md` and `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7 because they describe two distinct, intentional entry paths — the Primary Lifecycle (Innovation/Fellowship Path, Structured Hearing before Expert Review) and the Direct Annex Path (Evidence-Origin Path, Expert Review before Structured Hearing) — not a contradiction. Both paths converge after Codex Validation. Neither existing document was changed; this diagram's single collapsed "Scientific Review — 4 Levels" node remains a simplification of the Primary Lifecycle path specifically — see the ADR for the full Direct Annex Path detail.

## 4. Supporting Systems (each canonically owned elsewhere)

- **Scientific Review** — the four-level validation engine (`brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7). Not redefined here.
- **Blockchain Annex Architecture** — the integrity/immutability layer for Approved Annexes (same document, §2–§6).
- **Contribution & Impact Framework** — Trust and Impact Record semantics (`brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md`). Not redefined here.
- **Knowledge Graph** — the persistent memory substrate (`ADR-007`, `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md`). Not redefined here.
- **Application Architecture** (`brain/APPLICATION/APPLICATION_ARCHITECTURE.md`, LOCKED) — no stage in this lifecycle yet has an assigned owning service in that document; this overview does not assign one. Not touched or redefined here.
- **AI Governance** (`docs/source/foundation/05_AI.md`, `brain/AI/AI_GOVERNANCE_HIERARCHY.md`, `docs/source/governance/AI_POLICY.md`) — constrains every stage's AI Integration boundary already stated in each stage's own canonical document (e.g., Scientific Review's "AI never validates," Civic Intelligence's "AI grounds, never originates"). Not redefined here; cited as the umbrella governing all of them.
- **Early Warning** — the optional downstream consumer tied to `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7's `published → signal_released` state and to `CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md`'s `compounds_into` edge. Referenced by name only — no full specification exists in this repository (`EARLY_WARNING_PROPOSAL.md` is not present); not invented here.
- **Direct Annex origination path** — a single Structured Hearing may produce an Evidence Package independent of Dashboard-driven Top Priority Selection, per `docs/source/methodology/RESPONSIBILITY_ANNEXES.md`'s "direct path" Workflow and `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §2's explicit note. This path exists alongside the primary, Dashboard-driven route shown in §3's diagram; it is not shown as a separate branch there, per the lifecycle-ordering freeze in effect for this document.
- **Dashboard's secondary/aggregate role** — once Impact Records exist for prior Civic Contributions, the Responsibility Dashboard's Visualizations & Metrics may incorporate them to refresh its aggregate view, per `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §5 and `ADR-016`. This is secondary to, not a replacement for, the Dashboard's primary upstream role shown in §3's diagram.

## 5. Genuine Gaps Identified (explicit, not smoothed over)

1. ~~**Innovation 1 has no dedicated methodology document.**~~ **RESOLVED.** `docs/source/methodology/RESPONSIBILITY_BIOGRAPHY_LAB.md` now exists, derived strictly from `01_HARM_OPERATING_SYSTEM.md` and `HARM_LIFECYCLE.md`'s existing "Citizen Experience" description — no new concept was invented. Both documents' Innovation table/Related Documents were updated to point to it.
2. **Innovations 6 and 7 remain unresolved.** Named in `CIVIC_INTELLIGENCE_LAYER.md`, not yet adopted into the canonical 5-Innovation list, per `ADR-019`'s (draft) open questions.
3. **No prior document showed the full end-to-end lifecycle in one place.** Each piece (HARM Lifecycle, Annex/Blockchain lifecycle, Scientific Review pipeline, Civic Intelligence Cycle) existed only in its own document. This document's §3 is the first synthesis — worth stating plainly as the actual gap this document exists to close.
4. **The Knowledge Graph specialization is still Draft.** `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md` and its authorizing `ADR-019` are not yet approved. This overview cites Draft-status material for the Knowledge Graph section specifically — flagged so that status isn't silently implied to be Canonical.
5. **Ethics Board's interaction with the Knowledge Graph schema is unstated.** The graph's `Review` node and `validated_by` edge do not explicitly represent an Ethics Board veto outcome as distinct from ordinary Scientific Review Committee approval — a real, small modeling gap, not resolved here.
6. **RPCS-track-to-Innovation-role mapping is only partial.** `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §10 maps some RPCS tracks (Trauma-Informed Facilitation, Codex Research, AHIP Specialist) to specific lifecycle roles, but no document maps all RPCS tracks against all five Innovations comprehensively.

No other inconsistency was found — the nine source documents were checked against each other's stated terminology, lifecycle ordering, and role names, and no contradiction (as opposed to the six genuine gaps above) was identified.

## 6. Governance

This document does not alter the governance of any Innovation or supporting system it references. Amending any cited document's content requires following that document's own governance rules; amending this overview to reflect such a change is a Version bump here (per `standards/RP_STANDARD_001_DOCUMENTATION_ARCHITECTURE.md` §6), not a new decision.

## 7. References

`docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` · `docs/source/methodology/RESPONSIBILITY_BIOGRAPHY_LAB.md` · `docs/source/methodology/RESPONSIBILITY_MAPPING.md` · `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md` · `docs/source/methodology/RESPONSIBILITY_ANNEXES.md` · `docs/source/methodology/CIVIC_INTELLIGENCE.md` · `brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md` · `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` · `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_LAYER.md` · `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md` · `architecture/adr/ADR-007-knowledge-graph.md`

## Related Documents

All nine documents listed in §7. The repository-level documentation standard described in §1 also governs this document.
