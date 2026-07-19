# ADR-028: Knowledge Graph Boundary

## Status

Accepted — explicitly approved by the Founder on 2026-07-19.

## Authorship

Prepared on 2026-07-19 by the implementation agent from the existing stub and
the repository's accepted architectural constraints. This is an authored
decision record, not a discovered fact. The Founder approved the recommended
decision with the explicit instruction: “Die empfohlenen Entscheidungen für
ADR‑028, ADR‑030 und ADR‑031 sind als Founder-Entscheidung genehmigt. Die drei
bestehenden Stubs dürfen zu vollständigen ADRs ausgearbeitet werden.”

## Classification

Architectural boundary decision. It assigns mechanism and schema ownership; it
does not change the locked Core Domain Model, select a deployment topology, or
accept the still-draft ADR-019.

## Context

ADR-007 defines a deterministic Knowledge Graph extracted from Git-committed
content. Draft ADR-019 proposes HARM-specific node and edge types. ADR-026
requires Shared Platform Services to own reusable mechanisms without acquiring
business semantics, while Civic and Governance remain peer domains.

A graph database, indexing pipeline, entity-resolution mechanism, provenance
format, and query engine are reusable infrastructure. Names such as Dialogue,
Finding, HarmCategory, Annex, Evidence, and NormativeFramework carry domain
meaning and cannot be owned by neutral infrastructure.

## Decision

### 1. Shared generic graph engine

Shared Platform Services owns the domain-neutral graph mechanism:

- storage and indexing primitives;
- stable node and edge identifiers;
- provenance and source-location mechanics;
- deterministic extraction interfaces;
- multilingual alias/entity-resolution infrastructure; and
- domain-neutral query and traversal capabilities.

The engine never invents domain types, relationships, validation states, or
publication eligibility.

### 2. Domain-owned schemas

Each business domain owns the semantics and lifecycle of the graph types it
contributes.

- Civic Domain owns the existing ADR-007 civic/content schema, including its
  meaning for people, organizations, topics, legislation, dialogues, and
  findings used by civic products.
- Governance Domain owns any HARM-, Evidence-, Hearing-, Annex-, Repair-,
  Responsibility-, Scientific-Review-, or Civic-Intelligence-specific schema.

Shared Platform Services validates the generic shape and provenance contract;
the owning domain validates business meaning and admissibility.

### 3. One logical engine, separated ownership

The modular monolith may use one logical graph engine and one physical store.
This does not merge ownership. Domain namespaces, schema registration, and
write paths must make the owning domain explicit. A domain may reference
published graph objects from the other domain through a defined interface but
may not mutate the other domain's objects directly.

No microservice or separate graph instance is required by this decision.
Deployment separation would require separate operational justification.

### 4. Deterministic and auditable publication

ADR-007's deterministic extraction rule remains binding across both domains.
AI may assist candidate extraction only where a separately accepted policy
permits it; no AI-inferred relationship becomes authoritative without the
owning domain's deterministic or human-approved publication path and retained
provenance.

### 5. ADR-019 remains a separate gate

This ADR assigns ownership of the schema proposed by ADR-019 to Governance
Domain. It does not accept ADR-019, its new Innovations, its detailed node/edge
catalogue, or its `reference` status. Those elements remain unavailable for
implementation until ADR-019 is separately resolved and accepted.

## Alternatives Considered

### Entire graph owned by Shared Platform Services

Rejected. A neutral service would become the owner of civic and governance
business semantics, contradicting ADR-026.

### Entire graph owned by Governance Domain

Rejected. ADR-007 already supports Civic products, and Governance ownership
would give one peer domain authority over the other's content relationships.

### Separate engines and stores per domain

Rejected for the current modular monolith. It duplicates entity resolution,
provenance, indexing, and operations without improving semantic ownership.
Physical separation remains possible if future risk or scale evidence warrants
it, but is not required by this ADR.

### Live generative graph

Rejected by ADR-007's provenance and reproducibility requirements.

## Consequences

- Graph infrastructure can be reused without centralizing business policy.
- Every graph schema/type must declare one owning domain.
- Cross-domain links require stable references and interface contracts rather
  than direct table reach-through.
- Existing generic persistence structures may remain shared, but domain
  services control writes and validation.
- Governance graph implementation remains blocked on ADR-019 or a superseding
  accepted specification.

## Validation Criteria

- Generic graph code contains no HARM-, Membership-, Hearing-, or other
  domain-policy decisions.
- Every registered node/edge type identifies its owning domain.
- Every published relationship retains deterministic source provenance.
- Civic code cannot mutate Governance-owned graph objects and vice versa.
- Rejecting or delaying ADR-019 does not break the existing ADR-007 Civic graph.
- One domain's schema extension can be disabled without disabling the other's
  anonymous content graph.

## Human Approval Record

Approved by the Founder on 2026-07-19:

> “Die empfohlenen Entscheidungen für ADR‑028, ADR‑030 und ADR‑031 sind als
> Founder-Entscheidung genehmigt. Die drei bestehenden Stubs dürfen zu
> vollständigen ADRs ausgearbeitet werden.”

The approved ADR-028 recommendation was: generic Knowledge Graph engine as a
Shared Platform Service, with business schemas owned by the respective domain.

## References

`architecture/adr/ADR-007-knowledge-graph.md`;
`architecture/adr/ADR-019-civic-intelligence-layer-and-knowledge-graph-relationship.md` (Draft);
`architecture/adr/ADR-026-constitutional-domain-architecture.md`;
`brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md`;
`brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED, unmodified).
