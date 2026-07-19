# ADR-031: Project Ownership and Cross-Domain Collaboration

## Status

Accepted — explicitly approved by the Founder on 2026-07-19.

## Authorship

Prepared on 2026-07-19 by the implementation agent from the existing stub,
ADR-026, and the locked Core Domain Model's recorded ownership gap. This is an
authored decision record, not a discovered fact. The Founder approved the
recommendation in the explicit approval quoted under Human Approval Record.

## Classification

Architectural aggregate-ownership and collaboration-boundary decision. It
resolves the open Project-owner question without editing or silently unlocking
the Core Domain Model.

## Context

The locked Core Domain Model defines `Project` as an aggregate root grouping
Dialogue, Event, and Publication instances, but explicitly leaves its owner
unresolved. ADR-026 assigns projects to Civic Domain at the constitutional
responsibility level and requires peer domains to collaborate through defined
interfaces rather than overlapping ownership.

Governance work may use material produced by a Project as Evidence or may link
a Hearing, Annex, Responsibility finding, or Repair activity to a civic
initiative. That relationship does not require Governance to control the
Project's lifecycle.

## Decision

### 1. Project is owned by Civic Domain

Civic Domain has sole authority over the `Project` aggregate and its business
lifecycle, including creation, identity, descriptive metadata, participants,
status, and relationships to Civic-owned activities and outputs.

This confirms ADR-026's responsibility-level assignment at entity level. It
does not change `Project`'s existing aggregate-root meaning or add fields to the
locked Core Domain Model.

### 2. Governance references; it does not co-own

Governance Domain may reference a Project by stable identifier and consume only
the data made available through a defined Civic-owned interface. Governance may
not create, rename, transition, archive, or otherwise mutate a Project directly.

Governance-owned records—such as Evidence, Hearing, Annex, Responsibility, or
Repair records—may retain a Project reference and their own provenance. Those
records remain Governance-owned and do not become fields or lifecycle state on
the Project aggregate.

### 3. Published snapshots and provenance

When Governance relies on Project material for an accountable decision, it
must cite a stable published output, immutable version/snapshot, or equivalent
provenance record—not an unversioned live view whose later Civic edits could
silently change the evidentiary basis.

The Governance record owns the fact that material was used and the context in
which it was assessed. Civic Domain owns the source Project and publication.

### 4. Cross-domain operations

A workflow that changes state in both domains is coordinated as two explicit
domain operations with separate authorization and audit evidence. Neither
domain writes the other's tables or treats its own authorization as sufficient
for the peer domain. Failure and retry behavior must not leave an unaudited
partial institutional transition.

No new event bus or distributed transaction is introduced. ADR-029's accepted
modular-monolith transaction and audit boundary remains in force until a future
deployment boundary requires another decision.

### 5. No duplicate Project concept

Governance must not create a parallel “Governance Project” entity to avoid the
interface. If Governance needs a distinct lifecycle container, it must use an
already approved Governance concept or obtain a dedicated ADR rather than
reusing the Project name with different ownership.

## Alternatives Considered

### Joint Civic/Governance ownership

Rejected. Overlapping lifecycle authority violates ADR-026's single-owner rule
and makes authorization and accountability ambiguous.

### Shared Platform Services owns Project

Rejected. Project has civic business semantics and is not neutral
infrastructure.

### Governance owns cross-domain Projects

Rejected. Use of Project outputs as Evidence does not transfer ownership of the
initiative that produced them.

### Duplicate Project aggregates per domain

Rejected. It creates identity drift and competing sources of truth.

## Consequences

- Civic Domain can implement the Project lifecycle with one authoritative
  owner.
- Governance integrations must use stable references and explicit contracts.
- Evidence provenance survives later Project edits.
- Cross-domain authorization and audit duties remain visible rather than being
  hidden inside shared tables.
- The locked Core Domain Model records an historical unresolved gap; this ADR
  is the authoritative resolution and does not rewrite that history.

## Validation Criteria

- Only Civic application services mutate Project state.
- Governance schemas store references/provenance, not duplicate Project state.
- A Governance decision can reproduce the exact Project output/version it used.
- Each domain independently authorizes and audits its part of a cross-domain
  workflow.
- Removing a Governance reference does not delete or mutate the Civic Project.
- Project identifiers remain stable across all references.

## Human Approval Record

Approved by the Founder on 2026-07-19:

> “Die empfohlenen Entscheidungen für ADR‑028, ADR‑030 und ADR‑031 sind als
> Founder-Entscheidung genehmigt. Die drei bestehenden Stubs dürfen zu
> vollständigen ADRs ausgearbeitet werden.”

The approved ADR-031 recommendation was: `Project` belongs to Civic Domain;
Governance accesses Project material only through defined read/reference
interfaces.

## References

`architecture/adr/ADR-026-constitutional-domain-architecture.md`;
`architecture/adr/ADR-029-audit-and-event-bus-boundary.md`;
`brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED, unmodified);
`brain/APPLICATION/APPLICATION_ARCHITECTURE.md` (LOCKED, unmodified);
`docs/source/methodology/EVIDENCE_MODEL.md`;
`docs/source/methodology/STRUCTURED_HEARINGS.md`.
