# Public API v1

Release E implements the Constitution's read-only, grounded-content-only public boundary.

## Exposed

- Version discovery at `/api/public/v1`.
- Cursor-paginated Content Graph entities and relationships.
- Explicit DTO allowlists, public source URLs, deterministic/human-reviewed provenance, ETags, cache policy, request correlation and the shared PostgreSQL rate limiter.
- Consumers must preserve returned public source URLs. No additional reuse licence is implied by the API.

## Not exposed

No Person, ConsentRecord, authentication, membership, application, research, Governance case, audit, private source path or other private-table data is serialized. Partner accounts, API keys, agreements, embed configuration, grounded-Q&A widgets and Event integrations remain excluded until their separate partner, legal, security and operational gates are approved.
