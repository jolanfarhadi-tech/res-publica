# Res Publica Public API v1

## Scope

The v1 API is read-only and exposes grounded public Content Graph records only. Every returned entity or relationship must already be human-approved and backed by a currently public-eligible repository content source.

It never serializes Person, ConsentRecord, authentication, membership, application, research, Governance case, AuditLog, internal source path or other private-table records.

## Resources

- `GET /api/public/v1` — version and resource discovery.
- `GET /api/public/v1/content-graph/entities` — cursor-paginated public entities. Optional parameters: `locale=de|en|fa`, `type`, `q`, `limit`, `cursor`.
- `GET /api/public/v1/content-graph/relationships` — cursor-paginated public relationships. Optional parameters: `locale=de|en|fa`, `limit`, `cursor`.

Collection responses use explicit v1 DTOs, opaque cursors, public source URLs and deterministic/human-verified provenance flags. Responses provide ETags and shared privacy-preserving PostgreSQL rate limiting.

Consumers must preserve returned public source URLs. The endpoint does not create or imply any additional reuse licence.

## Deferred partner capabilities

Partner accounts, API keys, agreements, quota administration, Q&A embeds and Event integrations are not part of this public projection. They require separate partner, legal, privacy, security and operational approval and must not be inferred from the existence of v1.
