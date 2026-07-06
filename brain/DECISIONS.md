# Res Publica — Decision Log

*An index into the ten approved Architecture Decision Records. The ADRs themselves remain unchanged at `../architecture/adr/`, per the Foundation Stabilization rule "do not change approved ADRs." This file cross-references; it does not restate.*

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

## Pending / draft ADRs (not yet approved)

This index otherwise lists only approved ADRs (ADR-001 through ADR-012, above). It has not been kept current for ADR-013 through ADR-018 — a known gap, not resolved here. One pending item is recorded explicitly so it is not silently missed:

| ADR | Proposed Decision | Status |
|---|---|---|
| [ADR-019](../architecture/adr/ADR-019-civic-intelligence-layer-and-knowledge-graph-relationship.md) | Civic Intelligence Layer (deepens Innovation 5) and its relationship to the Knowledge Graph (specializes ADR-007) | **Draft — not final, pending review** |
| [ADR-020](../architecture/adr/ADR-020-dual-intake-and-review-paths.md) | Resolves the Structured Hearing/Expert Review ordering conflict between `01_HARM_OPERATING_SYSTEM.md` and `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` as two distinct, intentional paths (Primary Lifecycle vs. Direct Annex Path), not a contradiction | **Accepted** |
| [ADR-021](../architecture/adr/ADR-021-national-harm-taxonomy-classification-layer.md) | Names `HARM_CODEX.md`'s existing 3-category taxonomy the "National Harm Taxonomy" and integrates it as the Annex lifecycle's classification layer; adds Governance Rule 7 (every validated Annex is classified under ≥1 Harm Category, applied after validation — classification does not generate the Annex) | **Accepted** |

## Reading the amendments

Every amended ADR keeps its original Context/Decision/Alternatives/Consequences/Future Impact sections completely intact — amendments are appended, never edited in, per the same "do not rewrite history" discipline used for git commits. If an ADR's original decision ever needs to be reversed rather than merely clarified, that requires a new ADR explicitly superseding it, not an edit to this one.
