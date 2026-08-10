# Knowledge Graph

The Knowledge Graph is a Shared Platform Services mechanism with domain-owned
vocabularies. Release C implements the accepted Civic/content vocabulary only.
It does not implement the operational rules reserved for ADR-035.

## Trust boundary

1. `buildRepositoryKnowledgeGraph` deterministically reads committed MDX.
2. A rebuild persists candidates and a reproducible content digest; it does not
   publish entities or relationships.
3. A different MFA-authenticated actor reviews each exact candidate.
4. Approval persists the canonical graph record, provenance and canonical
   `audit_log` entry in one transaction.
5. Public APIs project only currently public-eligible sources that also have an
   approved provenance record. Internal aliases and source paths are excluded.

No AI model, embedding provider or live generative relationship path is part of
this module. Public search remains useful without the database and is enriched
at build time only by explicit public MDX entity declarations.

## Operations

- Public read: `/api/knowledge-graph/{lookup,related,search}`
- MFA staff read: `/api/knowledge-graph/operations`
- MFA staff writes: rebuild and exact-candidate decision routes under
  `/api/knowledge-graph/operations/`
- UI: `/{locale}/operations/knowledge-graph`

All HTTP reads/writes use the shared PostgreSQL limiter. Staff writes preserve
session-derived actors, exact capabilities, MFA, separation of duties and
atomic audit semantics.
