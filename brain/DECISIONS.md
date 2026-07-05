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

## Review gate history

- [`../FOUNDATION_REVIEW.md`](../FOUNDATION_REVIEW.md) — first pass, found 6 concrete issues across 20 validated dimensions, recommended NO pending fixes.
- [`../FOUNDATION_REVIEW_FINAL.md`](../FOUNDATION_REVIEW_FINAL.md) — rerun after Foundation Stabilization, confirmed all 10 checklist items closed, recommended **APPROVED**.

## Reading the amendments

Every amended ADR keeps its original Context/Decision/Alternatives/Consequences/Future Impact sections completely intact — amendments are appended, never edited in, per the same "do not rewrite history" discipline used for git commits. If an ADR's original decision ever needs to be reversed rather than merely clarified, that requires a new ADR explicitly superseding it, not an edit to this one.
