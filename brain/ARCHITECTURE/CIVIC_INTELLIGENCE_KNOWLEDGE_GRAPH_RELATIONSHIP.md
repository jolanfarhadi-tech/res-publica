# Civic Intelligence Layer ↔ Knowledge Graph Relationship

```
Type: Foundation Architecture
Status: Draft — pending ADR-019
Version: 1.0.0-draft
Authorized by: ADR-019 (draft)
Extends/Reconciles with: architecture/adr/ADR-007-knowledge-graph.md,
  brain/ARCHITECTURE/CIVIC_INTELLIGENCE_LAYER.md,
  brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md,
  docs/source/methodology/HARM_CODEX.md
```

**Canonical relationship — read this first:** `ADR-007` already defines a Knowledge Graph for the public Website (people, organizations, topics, legislation, dialogues, findings — deterministically extracted from Git-committed MDX, never AI-invented). This document does not propose a second, competing graph. It specifies how the HARM ecosystem's own objects (Stories, Codex entries, Annexes, Patterns) populate and are queried through that same underlying graph concept, specialized with HARM-specific node and edge types. No new graph engine, database, or extraction pipeline is proposed here — only the schema specialization.

## 1. Core Sentence

> **The Knowledge Graph is the memory; the Civic Intelligence Layer is the thinking about it.**

The graph stores *what* is known and *how* it connects. The Civic Intelligence Layer (`CIVIC_INTELLIGENCE_LAYER.md`) asks questions of that memory, recognizes patterns within it, and writes its own findings back as new, traceable nodes. Without the graph, the Layer would be blind; without the Layer, the graph would stay mute.

## 2. Division of Labor

| | Knowledge Graph | Civic Intelligence Layer |
|---|---|---|
| Role | Persistent knowledge infrastructure | Collective thinking process |
| Stores | Nodes, edges, provenance | Nothing of its own — reads and writes to the graph |
| Changes | On every validated entry | Per cycle/cohort |
| Answers | "What do we know, and from where?" | "What does it mean, and where does it lead?" |

## 3. Node Types

| Node Type | Origin (Layer) | Example |
|---|---|---|
| `Story` | Layer 1 — Biography Lab | Pseudonymized Story fragment (reference ID only) |
| `CodexEntry` | Review Pipeline | A Harm Codex mechanism entry (`HARM_CODEX.md`) |
| `MechanismPathway` | Scientific Review Level 3 | Policy → Exposure → Effect as an edge chain |
| `Issue` | Layer 3 — Dashboard | A prioritized issue with a priority score |
| `Annex` | Layer 4 — Annexes | An Approved Annex (`RESPONSIBILITY_ANNEXES.md`) |
| `Pattern` | Layer 5 — Intelligence | A recognized cluster across multiple Codex entries |
| `Scenario` | Layer 5 — Intelligence | An explorative future, 1/3/10-year horizon |
| `OrientationStatement` | Layer 5 — Intelligence | A human-reviewed orientation output |
| `HarmCategory` | Taxonomy (reference) | One of the National Harm Taxonomy's category types (formally named in `docs/source/methodology/HARM_CODEX.md`; currently: institutional mechanisms, systemic patterns, procedural failures) |
| `NormativeFramework` | External (reference) | A referenced external standard or indicator |
| `ActorCategory` | Layer 2 — Mapping | An institution-type category — **never an individual person** |
| `Region` | Dashboard/heat map | A geographic area with a heat level |
| `Session` | Process | A Hearing/session, as a provenance anchor |
| `Review` | Scientific Review | A Scientific Review record (level, criteria, role) |

## 4. Edge Types — the Actual Intelligence

| Edge | Meaning | Example |
|---|---|---|
| `derived_from` | Provenance | Pattern → CodexEntry → Story → Session |
| `validated_by` | Review evidence | CodexEntry → Review (level, criteria, role) |
| `maps_to` | Normative linkage | MechanismPathway → NormativeFramework |
| `categorized_as` | Taxonomy | CodexEntry → HarmCategory |
| `responsible_interface` | Responsibility assignment | Issue → ActorCategory (category, never a name) |
| `prioritized_as` | Dashboard result | Issue → priority score |
| `compounds_into` | Cumulative harm | Environmental exposure → health decline → economic vulnerability |
| `documented_in` | Knowledge preservation | Issue → Annex |
| `informs` | Intelligence flow | Pattern → Scenario → OrientationStatement |
| `located_in` | Spatial reference | CodexEntry → Region |

**`compounds_into` is strategically central.** It is what makes "Harm Pathways" — how individual harms chain into structural vulnerability over time — a queryable graph structure rather than a claim that can only be asserted in prose.

## 5. How Each Layer Interacts with the Graph

| Layer | Writes | Reads |
|---|---|---|
| 1 — Stories | `Story` reference nodes (pseudonymous) + `Session` | — |
| 2 — Responsibility | `ActorCategory`, `responsible_interface` edges | Stories within its own cohort |
| 3 — Priorities | `prioritized_as`, heat-level on `Region` | Issues + responsibility edges |
| Review Pipeline | `validated_by`, `maps_to`, status transitions | Everything preceding it |
| 4 — Knowledge | `Annex` + `documented_in` | Validated subgraphs per priority |
| **5 — Intelligence** | `Pattern`, `Scenario`, `informs` | **The entire validated graph** |

**Core rule:** the Intelligence Layer is the only layer with read access to the *entire* validated graph — and it may read only nodes whose status is `codex_validated` or `published` (§7's status-lock guardrail). Everything else is invisible to it, mirroring the same status-lock discipline already established in Scientific Review's lifecycle state machine (`03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7).

## 6. What This Relationship Delivers

1. **Explainability becomes structural.** Every claim in a Civic Intelligence Report is a graph path (`OrientationStatement ← informs ← Pattern ← derived_from ← CodexEntry ← validated_by ← Review`) — "no black-box synthesis" becomes a query, not just a policy.
2. **Pattern Recognition = graph analysis**, not text-guessing: recurring subgraphs (same HarmCategory + same ActorCategory + similar Pathways across regions).
3. **Cross-case validation** (the existing "Internal Consistency" Review Criterion) becomes a neighborhood query: does a new entry contradict the connected cases in its cluster?
4. **Confidence inherits provenance.** A Pattern's confidence is computed from source diversity in its subgraph (independent Sessions/Regions), not from assertion.
5. **The cycle closes.** Orientation Statements become nodes the next cohort builds on — institutional memory, not a restart each time.

## 7. Schema Sketch (for implementation — conceptual, not a LOCKED Core Domain Model addition)

```typescript
type NodeType =
  | "Story" | "CodexEntry" | "MechanismPathway" | "Issue" | "Annex"
  | "Pattern" | "Scenario" | "OrientationStatement"
  | "HarmCategory" | "NormativeFramework" | "ActorCategory"
  | "Region" | "Session" | "Review";

type EdgeType =
  | "derived_from" | "validated_by" | "maps_to" | "categorized_as"
  | "responsible_interface" | "prioritized_as" | "compounds_into"
  | "documented_in" | "informs" | "located_in";

interface GraphNode {
  id: string;
  type: NodeType;
  status: "draft" | "expert_reviewed" | "hearing_documented"
        | "codex_validated" | "published" | "reference";
  payloadRef: string;        // reference to the actual object — never raw text in the graph
  createdBySession?: string; // provenance anchor
}

interface GraphEdge {
  from: string; to: string; type: EdgeType;
  createdBy: "human" | "ai_suggested_human_confirmed";  // never "ai" alone
  loggedAt: string;
}
```

**Added beyond the source specification, flagged explicitly:** the `"reference"` status value on `GraphNode` is an addition. Reference/taxonomy nodes (`NormativeFramework`, `HarmCategory`) don't sensibly pass through the Scientific Review pipeline's draft→published states — they are static, pre-existing anchors, not evidence under review. `"reference"` marks them as always-queryable regardless of the status-lock in §5, without weakening that lock for any evidentiary node type.

**This is a sketch, not a domain model addition.** No node or edge type here is proposed for entry into `brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED). It specializes `ADR-007`'s existing graph concept for the HARM ecosystem's own objects; it does not introduce a second graph engine or extraction pipeline.

## 8. Guardrails

1. **No person nodes.** The graph knows `ActorCategory` (institution types) and pseudonymous `Story` references — never identifiable individuals. Re-identification via edge combination is the primary DPIA risk for this graph; therefore no edges exist between `Story` nodes belonging to different people.
2. **Categories, not names, for responsibility.** `responsible_interface` points to categories — naming an individual or institution explicitly is a separate, documented human decision made outside the graph.
3. **No edge without a human.** `createdBy` accepts only `human` or `ai_suggested_human_confirmed` — AI may suggest an edge, never set one unilaterally.
4. **Zero Gamification in the graph.** No centrality, activity, or contribution scores on person-linked nodes; graph metrics apply only to Issues, Patterns, and Regions.
5. **Status lock.** Intelligence queries filter hard on `codex_validated`/`published` (or `reference`, §7) — enforced technically, not left as a convention.
6. **Deletion cascade.** Withdrawal of a Story reference removes that node and all outgoing `derived_from` provenance within the same window as any other withdrawal right in this ecosystem; aggregated, anonymized Patterns remain, consistent with the organization's existing data-minimization approach (`docs/source/governance/DATA_POLICY.md`).

## 9. Website vs. Platform Boundary

The website may show a static diagram of this relationship only. The productive graph — database, query engine, semantic layer — is platform-roadmap work, out of scope for the website build (`.claude/skills/web-05-core-pages/SKILL.md`). No graph backend belongs on the website.

## References

`architecture/adr/ADR-007-knowledge-graph.md` · `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_LAYER.md` · `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` · `docs/source/methodology/HARM_CODEX.md`

## Unresolved Source Gaps

The source specification cites "Roadmap Command 22 (Knowledge Graph, Phase 3 — AI)," "Command 23 (Memory Architecture)," and "Commands 27/28 (Contribution/Impact Intelligence)" — these belong to the 40-step execution roadmap, which this repository has already established as an execution-layer overlay only, never an architecture authority (`brain/GOVERNANCE/EXECUTION_ALIGNMENT.md`). They are noted here as external references, not adopted as canonical numbering. The Early Warning Proposal's "Harm Pathways" concept, referenced as the motivation for `compounds_into`, has no full specification in this repository (consistent with the earlier finding that `EARLY_WARNING_PROPOSAL.md` does not exist here).
