# Module: Public API

## Purpose

Expose the human-approved public Content Graph through a stable read-only V1
contract without serializing private domain or persistence records.

## Canonical authority

- Constitution §19: partner/public sharing is read-only and grounded-content-only by default, never raw Person or ConsentRecord data; citations must not be stripped.
- ADR-007: the deterministic, human-reviewed Knowledge Graph is the Public API substrate.
- Owner-approved Release E in `PLATFORM_FACT_CHECK_2026-08-10.md`.

## Current implementation

`src/modules/public-api` owns the manifest, pure DTO/pagination projector,
ETag/error helpers, tests and scope documentation. `src/app/api/public/v1`
provides discovery plus entity and relationship collections. The routes reuse
`getPublicKnowledgeGraph`, the shared PostgreSQL limiter and request context.

## Data and persistence

No table or migration. The module reads only the already filtered public graph
projection and emits allowlisted DTOs. Repository/canonical source paths,
domain ownership and private tables never enter the response.

## Public contract

- URL version `v1`.
- DE/EN/FA filters and optional entity type/search filters.
- Opaque cursor pagination bound to resource and filter scope.
- Public URLs plus deterministic/human-verified/public-only provenance.
- ETag, conditional 304, bounded cache policy, request ID and distributed rate limit.

## Status and open work

The anonymous grounded Content Graph projection is locally implemented and
verified. It is not deployed by this slice. Partner accounts, credentials,
agreements, quota administration, Q&A embeds and Event integration remain
deferred behind explicit partner/legal/security/operational decisions; see
OPEN-026 and WARN-024.

## Do not redo

Do not create a second graph or serialize ORM rows directly. Extend the V1 DTO
projector additively, preserve source URLs, and require a new version for any
breaking contract change.
