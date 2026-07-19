# Res Publica — Decision Log

*Canonical index of the adopted and accepted Architecture Decision Records. The ADRs themselves remain unchanged at `../architecture/adr/`; this file cross-references their current decisions and status.*

| ADR | Decision | Amended during Stabilization? |
|---|---|---|
| [ADR-001](../architecture/adr/ADR-001-core-platform.md) | Three-tier architecture (Static Core / AI Retrieval / Personalization & Identity) | Yes — amendment notes the original Engineering/Security Audit P0 items remain unresolved in the live repo, re-sequenced as Step 0 of the Foundation Build Order |
| [ADR-002](../architecture/adr/ADR-002-domain-model.md) | Five canonical domain entities (Person, ConsentRecord, Payment, Organization, AuditLog), extracted to stop cross-module duplication | Yes — amendment adds a sixth entity (Notification) and resolves the AuditLog/GDPR-erasure tension |
| [ADR-003](../architecture/adr/ADR-003-plugin-architecture.md) | Module manifest contract instead of hard-coded module integration | No |
| [ADR-004](../architecture/adr/ADR-004-ecc-agent-system.md) | Eight new specialized agent roles, conceptual roster only | No |
| [ADR-005](../architecture/adr/ADR-005-cli-architecture.md) | Single `respublica` CLI wrapping/extending existing npm scripts | No |
| [ADR-006](../architecture/adr/ADR-006-local-development-workflow.md) | Local dev runs against mocked AI Layer, stubbed payments, disposable seeded DB | No |
| [ADR-007](../architecture/adr/ADR-007-knowledge-graph.md) | Deterministic entity/relationship extraction from Git-committed MDX, never AI-invented | No |
| [ADR-008](../architecture/adr/ADR-008-ai-layer.md) | One shared grounded RAG service, citation-or-refuse, hard cost ceiling | Yes — amendment clarifies AI Layer as sole owner of cost/usage data (Analytics only aggregates) and states the Moderator-Synthesis Assist endpoint is staff-only |
| [ADR-009](../architecture/adr/ADR-009-module-integration.md) | One integration map with a "downstream never blocks upstream" rule | Yes — amendment records the two map corrections (Events↔Community direction, missing Membership→Analytics row) |
| [ADR-010](../architecture/adr/ADR-010-offline-first-development.md) | Offline-first as a platform-wide principle, not just a local-dev convenience | No |
| [ADR-011](../architecture/adr/ADR-011-phase-0-start.md) | Phase 0 begins from the frozen Project Brain v1.1 baseline (`7d39c71`, tag `project-brain-v1.1`); no Brain/Foundation document changes during Phase 0 without a new ADR | No |
| [ADR-012](../architecture/adr/ADR-012-phase-0-build-order-correction.md) | Adopts Implementation Plan's P0 tier (not `foundation-architecture.md` §9's list) as the authoritative Foundation Build Order Step 0 scope, without editing the frozen Foundation Architecture text | No — first ADR adopted under the Constitution's ADR Governance Workflow (§17) |

## Review gate history

- [`../FOUNDATION_REVIEW.md`](../FOUNDATION_REVIEW.md) — first pass, found 6 concrete issues across 20 validated dimensions, recommended NO pending fixes.
- [`../FOUNDATION_REVIEW_FINAL.md`](../FOUNDATION_REVIEW_FINAL.md) — rerun after Foundation Stabilization, confirmed all 10 checklist items closed, recommended **APPROVED**.

## Constitutional governance

The Res Publica Accountability Constitution — [`00_constitution/00_constitution.md`](00_constitution/00_constitution.md), tagged `constitution-v1.0` — is the highest authority for conduct/accountability matters (who is answerable, what evidence compliance requires, how compliance is checked), per its own Section 6 Decision Hierarchy. Approved ADRs and the Foundation Architecture remain highest authority for architecture/domain-model matters; neither document outranks the other outside its own domain. Its review history: [`00_constitution/CONSTITUTION_REVIEW.md`](00_constitution/CONSTITUTION_REVIEW.md) (first pass, 12 finding categories) and [`00_constitution/CONSTITUTION_REVIEW_2.md`](00_constitution/CONSTITUTION_REVIEW_2.md) (re-validation, zero critical findings, recommended APPROVE). ADR-012 onward is governed by the Constitution's own ADR Governance Workflow (§17); ADR-001 through ADR-011 are grandfathered as validly adopted.

## Current ADR index (ADR-013 through ADR-034)

| ADR | Decision | Status |
|---|---|---|
| [ADR-013](../architecture/adr/ADR-013-contribution-impact-framework-reconciliation.md) | Reconciles the Contribution and Impact Framework with the canonical architecture. | **Accepted** |
| [ADR-014](../architecture/adr/ADR-014-annex-blockchain-civic-contribution-architecture.md) | Adopts the Annex, blockchain-verification, and civic-contribution architecture. | **Accepted** |
| [ADR-015](../architecture/adr/ADR-015-annex-architecture-extension.md) | Extends the Annex architecture with ERD, immutability, and full-system integration. | **Accepted** |
| [ADR-016](../architecture/adr/ADR-016-responsibility-dashboard-specification.md) | Specifies the Responsibility Dashboard and corrects its lifecycle position. | **Accepted** |
| [ADR-017](../architecture/adr/ADR-017-scientific-review-validation-engine.md) | Establishes Scientific Review as the ecosystem's human validation engine. | **Accepted** |
| [ADR-018](../architecture/adr/ADR-018-rp-standard-001-documentation-architecture.md) | Adopts RP Standard 001 as the documentation architecture standard. | **Accepted** |
| [ADR-019](../architecture/adr/ADR-019-civic-intelligence-layer-and-knowledge-graph-relationship.md) | Accepts the HARM-specific Knowledge Graph specialization under ADR-007/026/028; reserves Innovations 6/7 and new operational graph rules for ADR-035. | **Accepted** |
| [ADR-020](../architecture/adr/ADR-020-dual-intake-and-review-paths.md) | Establishes distinct Primary Lifecycle and Direct Annex intake/review paths. | **Accepted** |
| [ADR-021](../architecture/adr/ADR-021-national-harm-taxonomy-classification-layer.md) | Establishes the National Harm Taxonomy as the Annex classification layer. | **Accepted** |
| [ADR-022](../architecture/adr/ADR-022-transferable-civic-value.md) | Defines Transferable Civic Value as an output of an approved Annex. | **Accepted** |
| [ADR-023](../architecture/adr/ADR-023-mvp-annex-phasing-governance-modules.md) | Places Ethics Charter, DPIA, AI Governance, and Early Warning in non-blocking Phase 2 governance hardening. | **Accepted** |
| [ADR-024](../architecture/adr/ADR-024-executive-ai-office.md) | Establishes the Executive AI Office and its phased activation model. | **Accepted** |
| [ADR-025](../architecture/adr/ADR-025-eao-generation-2-constitutional-architecture-adoption.md) | Adopts the EAO Generation 2 constitutional architecture. | **Accepted** |
| [ADR-026](../architecture/adr/ADR-026-constitutional-domain-architecture.md) | Separates Civic Domain, Governance Domain, and Shared Platform Services. | **Accepted** |
| [ADR-027](../architecture/adr/ADR-027-identity-authentication-authorization.md) | Defines identity, authentication, session, and authorization boundaries. | **Accepted** |
| [ADR-028](../architecture/adr/ADR-028-knowledge-graph-boundary.md) | Assigns the generic graph mechanism to Shared Platform Services and graph semantics to their owning domains. | **Accepted** |
| [ADR-029](../architecture/adr/ADR-029-audit-and-event-bus-boundary.md) | Defines the append-only audit and domain-event boundary. | **Accepted** |
| [ADR-030](../architecture/adr/ADR-030-ai-runtime-boundary.md) | Defines the shared AI runtime mechanism while keeping domain decisions human and domain-owned. | **Accepted** |
| [ADR-031](../architecture/adr/ADR-031-project-ownership-and-cross-domain-collaboration.md) | Assigns Project ownership and governs cross-domain collaboration. | **Accepted** |
| [ADR-032](../architecture/adr/ADR-032-license-strategy.md) | Adopts AGPL-3.0-only core licensing, CLA requirements, and a dual-licensing reservation. | **Accepted** |
| [ADR-033](../architecture/adr/ADR-033-delegation-of-authority.md) | Defines Governance operational roles, powers, appointment, scope, and revocation. | **Accepted** |
| [ADR-034](../architecture/adr/ADR-034-member-profile-visibility-and-self-service-authorization.md) | Defines member-profile visibility and protected self-service authorization. | **Accepted** |

## Reading the amendments

Every amended ADR keeps its original Context/Decision/Alternatives/Consequences/Future Impact sections completely intact — amendments are appended, never edited in, per the same "do not rewrite history" discipline used for git commits. If an ADR's original decision ever needs to be reversed rather than merely clarified, that requires a new ADR explicitly superseding it, not an edit to this one.
