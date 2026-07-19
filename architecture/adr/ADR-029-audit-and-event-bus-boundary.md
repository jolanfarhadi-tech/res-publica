# ADR-029: Audit and Event Bus Boundary

## Status

Accepted — explicitly approved by the Founder on 2026-07-19.

## Authorship

Prepared on 2026-07-19 by the implementation agent at the instruction of the
Program Director to execute the binding project order “Digitale Plattform der
Res Publica — Aufbau, Meilensteine, Workflow”. This proposal is not presented
as a discovered architectural fact. The Founder approved the four decisions
listed under “Human Approval Required” in the conversation on 2026-07-19 with
the explicit response “ok”.

## Classification

Architectural governance decision. This ADR resolves the ownership and write
boundary for the canonical `AuditLog` and decides whether M1 requires an event
bus. It does not activate the legally blocked GDPR erasure path.

## Context

The following existing decisions constrain M1:

- `ADR-002` defines one canonical, append-only `AuditLog`, shared by all
  modules. Existing entries are never edited; pseudonymization is the approved
  engineering pattern, still subject to legal/data-protection sign-off.
- `brain/DOMAIN/CORE_DOMAIN_MODEL.md` requires every institutional action to
  have a corresponding audit entry and names `AuditLog` as shared across every
  bounded context.
- `ADR-003` rejects per-module microservices and requires modules to integrate
  through manifests rather than direct modification of one another.
- `ADR-026` makes Civic Domain and Governance Domain constitutional peers and
  permits Shared Platform Services to own reusable mechanisms, but no business
  policy or semantics.
- `brain/BLUEPRINTS/foundation-architecture.md` places the canonical domain
  model in one EU-resident managed PostgreSQL tier.
- M1 requires all six canonical entities, including the append-only audit log,
  to survive process restart and requires a documented migration path.

The unresolved question is how both business domains can record actions in one
canonical audit trail without Shared Platform Services taking ownership of the
meaning of those actions, and without introducing a distributed event system
that the current single-deployment architecture does not otherwise require.

## Decision

### 1. One canonical audit repository

`AuditLog` is persisted through one domain-neutral repository owned by Shared
Platform Services. Both Civic Domain and Governance Domain use this repository;
neither owns a separate audit table or parallel log.

The shared service owns only the generic mechanism and invariant:

- append an immutable entry;
- read entries through authorized query interfaces;
- preserve ordering and timestamps;
- prohibit update and delete operations at the persistence boundary;
- expose the legally gated pseudonymization operation without activating it.

The shared service does not define which business actions exist or what they
mean. Each owning domain defines its own action vocabulary and supplies the
actor, action, target, and domain context required for an entry.

### 2. Atomic write boundary

A status-changing domain operation and its audit append must commit in the same
PostgreSQL transaction. Application services receive a transaction-scoped unit
of work that exposes the owning domain repositories and the shared audit
repository. A business state transition must not be committed if its audit
append fails, and an audit entry must not be committed for a state transition
that fails.

Modules may not write directly to the audit table. They call the shared audit
repository through the transaction boundary. Database credentials used by the
application must not grant application code a general-purpose audit update or
delete capability.

### 3. No event bus in M1

M1 does not introduce an event bus, message broker, or independently persisted
event stream. The current architecture is a modular monolith using one
transactional persistence tier; an asynchronous bus would weaken the invariant
that state and audit are committed together and add operational complexity not
required by an accepted use case.

Domain events may remain typed in-process values used for composition and
tests. They are not a second source of truth and are not persisted as a second
ledger.

An event bus requires a new ADR if a later, accepted requirement introduces an
independent deployment boundary or a demonstrable asynchronous delivery need.
That ADR must preserve `AuditLog` as the canonical accountability record and
must specify transactional outbox, delivery, idempotency, ordering, replay,
retention, and failure semantics.

### 4. Persistence and migration constraints

The M1 adapter targets the already specified EU-resident PostgreSQL tier. The
schema and migrations are version-controlled. Forward migrations must preserve
the append-only invariant; rollback procedures must never silently delete or
rewrite production audit evidence.

Local development may use a compatible disposable adapter, but production
semantics and tests are defined by PostgreSQL. The existing in-memory local-dev
store remains a development fixture and is not promoted into production
persistence.

### 5. GDPR stop condition remains in force

This ADR does not grant the outstanding legal/data-protection sign-off. The
erasure/pseudonymization path remains structurally disabled exactly as required
by `ADR-002`, `brain/ROADMAP.md`, and the existing domain implementation. No
production data subject to that unresolved regime may be processed merely
because persistence exists.

## Alternatives Considered

### Per-domain audit logs plus aggregation

Rejected for M1. It would create multiple authoritative accountability stores,
conflicting with the canonical shared `AuditLog` and the repository’s explicit
prohibition on parallel logging systems. Cross-domain ordering and complete
monthly audit sampling would also become harder to demonstrate.

### Event bus as the primary audit write path

Rejected for M1. An asynchronous consumer creates a period in which a business
transition can exist without its required audit entry. An outbox could close
part of that gap, but it still adds delivery and replay machinery without a
current distributed-runtime requirement.

### Direct table writes from every module

Rejected. This exposes storage internals, makes append-only enforcement
dependent on caller discipline, and prevents one testable access boundary from
enforcing the constitutional invariant.

### Audit owned by either Civic or Governance Domain

Rejected. The domains are constitutional peers and both require the mechanism.
Assigning it to either domain would create cross-domain reach-through and place
the other domain’s accountability infrastructure under a peer’s ownership.

## Consequences

- M1 can use a single transaction to make business state and audit evidence
  durable together.
- Shared Platform Services owns infrastructure only; action semantics remain
  with the relevant business domain.
- No broker, event-store, or second ledger is added to the operational burden.
- Repository interfaces and transaction boundaries become required before a
  module state transition can be wired to persistence.
- Audit reads still require authorization rules from ADR-027 before exposure
  through API or UI surfaces.
- The GDPR erasure gate remains a release blocker for affected real data, not a
  reason to weaken or bypass the audit invariant.

## Validation Criteria

- A failed audit append rolls back the corresponding status transition.
- A failed status transition produces no committed audit entry.
- Application-level update and delete operations for audit entries do not
  exist.
- Persistence tests prove entries survive process restart and retain insertion
  order.
- No module owns a second audit table, log file, or event ledger.
- Domain action vocabularies are declared outside Shared Platform Services.
- The legally gated pseudonymization path remains disabled until documented
  legal approval.

## Human Approval Record

Approved by the Founder on 2026-07-19 before implementation:

1. one Shared Platform Services audit repository;
2. atomic same-transaction state and audit writes;
3. no event bus in M1; and
4. continued legal gating of pseudonymization/erasure.

## References

`architecture/adr/ADR-002-domain-model.md`;
`architecture/adr/ADR-003-plugin-architecture.md`;
`architecture/adr/ADR-010-offline-first-development.md`;
`architecture/adr/ADR-026-constitutional-domain-architecture.md`;
`brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED, referenced only);
`brain/BLUEPRINTS/foundation-architecture.md`;
`brain/ROADMAP.md`;
`src/domain/audit-log/index.ts`;
project order “Digitale Plattform der Res Publica — Aufbau, Meilensteine,
Workflow”, Version 1.0, July 2026.
