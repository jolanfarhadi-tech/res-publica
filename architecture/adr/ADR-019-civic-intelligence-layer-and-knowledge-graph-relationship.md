# ADR: Civic Intelligence Layer and Knowledge Graph Relationship

## Status
**Accepted — explicitly approved by the Founder on 2026-07-19.** The accepted scope is limited to the HARM-specific Knowledge Graph specialization and its compatibility with ADR-007, ADR-026, and ADR-028. Innovations 6 and 7 and any new Governance, graph-status, or deletion rules are excluded and reserved for ADR-035.

## Context

An external source specification (`CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATION.md`, reviewed by the user in the IDE) proposed a specific relationship between the existing Civic Intelligence Lab and the Knowledge Graph already defined in `ADR-007`, including 14 HARM-specific node types and 10 edge types. The same source also proposed two previously unnamed Innovations, but those extensions are not part of this decision and are reserved for ADR-035.

Review of the existing repository found: `docs/source/methodology/CIVIC_INTELLIGENCE.md` already canonically defines Civic Intelligence Lab; `ADR-007` already defines a generic Knowledge Graph for Website content; no document previously specialized that graph for HARM-ecosystem objects (Stories, Codex entries, Annexes, Patterns); no `brain/ARCHITECTURE/` directory previously existed; `brain/DECISIONS.md` (the ADR index) had not been updated since ADR-012.

## Decision

### 1. Accept the HARM-specific Knowledge Graph specialization

`CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md` is accepted as the HARM-specific schema specialization of the existing Knowledge Graph concept. It does not create a second graph engine, replace ADR-007, or add entities to `brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED).

### 2. Confirm compatibility and ownership

The specialization is compatible with ADR-007's deterministic provenance rule, ADR-026's constitutional domain separation, and ADR-028's accepted ownership boundary: Shared Platform Services owns the generic graph mechanism, while Governance Domain owns the HARM-, Evidence-, Hearing-, Annex-, Repair-, Scientific-Review-, and Civic-Intelligence-specific schema semantics and write validation.

### 3. Remove Innovations 6 and 7 from this decision

This ADR neither proposes nor accepts Innovation 6 (Policy & Action Lab) or Innovation 7 (Responsibility Observatory), and it does not amend `01_HARM_OPERATING_SYSTEM.md`'s canonical five-Innovation list. Their possible adoption, scope, ownership, and relationship to the existing ecosystem require the separate ADR-035 decision.

### 4. Reserve unresolved operational rules for ADR-035

This ADR accepts the graph specialization at the architecture and ownership level only. Any new Governance procedure, graph-specific lifecycle/status vocabulary beyond already accepted domain states, reference-node eligibility rule, withdrawal/deletion cascade, retention rule, or anonymized-aggregation rule described in the supporting draft remains non-binding and must be clarified in ADR-035 before implementation.

## Governance Compliance

Per `standards/RP_STANDARD_001_DOCUMENTATION_ARCHITECTURE.md`:
- §5 (Naming): new documents follow `UPPER_SNAKE_CASE.md`; the new `brain/ARCHITECTURE/` directory is not yet enumerated in the Standard's §2 taxonomy — flagged as a gap for the Standard's own future update, not resolved here.
- §9 (Traceability): both new documents carry the required metadata block and state what they extend/reconcile with.
- §14 (Introducing new documents): both documents state their relationship to existing canonical owners (`CIVIC_INTELLIGENCE.md`, `ADR-007`) rather than silently duplicating them.

## Consequences

- A new Foundation Architecture subdirectory (`brain/ARCHITECTURE/`) exists, not yet reflected in RP Standard 001's own document taxonomy (§2) — a follow-up amendment to the Standard is recommended but not performed here.
- Innovations 6 and 7 are outside this ADR; `01_HARM_OPERATING_SYSTEM.md` remains unchanged and continues to name exactly five canonical Innovations unless ADR-035 decides otherwise.
- The HARM-specific node/edge specialization and its Governance Domain ownership are accepted, while new operational Governance, status, retention, withdrawal, and deletion rules remain unavailable for implementation pending ADR-035.
- `brain/DECISIONS.md` already contains an entry for ADR-019; changing that entry from Draft to Accepted remains a separate index-maintenance task, alongside its existing ADR-013 through ADR-018 gap.
- No LOCKED file was modified.

## Alternatives Considered

- **Fold this content into the existing `CIVIC_INTELLIGENCE.md` methodology document directly.** Rejected — that document is a methodology-tier definition; this content is deep architecture (schema sketches, graph specialization) more consistent with the Foundation Architecture tier already used for the Annex ecosystem.
- **Silently adopt Innovations 6/7 as canonical by editing `01_HARM_OPERATING_SYSTEM.md`.** Rejected — that document was not named in this task's scope, and doing so would exceed "do not invent missing architecture" by unilaterally expanding an already-established canonical list.
- **Treat the schema sketches as immediately-ready Core Domain Model entities.** Rejected — the source specification itself labels them a "Schema-Skizze (für Implementierung)" (a sketch for implementation), and the task explicitly instructed not to create new domain entities unless clearly required; nothing here clearly requires it yet.

## Follow-up Decisions

ADR-035 must decide:

1. whether Innovations 6 and 7 are adopted, revised, or rejected;
2. any new Governance procedure required by the HARM-specific graph;
3. the graph's domain-specific lifecycle/status and reference-node eligibility rules; and
4. withdrawal, retention, anonymized aggregation, and deletion-cascade rules.

Separately, RP Standard 001's taxonomy and the stale `brain/DECISIONS.md` index remain documentation-maintenance items; neither affects this ADR's accepted architecture boundary.
