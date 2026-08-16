# AI Layer

Foundation Build Order Step 5, MVP module #2 (`ADR-008`).

## Purpose

The single, shared, grounded-retrieval service every other module consumes rather than reimplements.

## API

- `POST /api/ai/rag` - authenticated Civic query route. The shared rate limiter runs before actor resolution, authorization runs before retrieval, and responses are correlated and never cached.
- `runGroundedCivicQuery(...)` - application boundary for exact-scope authorization, public Knowledge Graph retrieval, privacy-preserving query logging, and public citation projection.
- `queryAILayer(provider, prompt, ledger, context)` - provider-neutral policy boundary. It enforces the executable use-case registry, hard cost governance, exact-grounding citation checks, and citation-or-refuse behavior.
- `createLocalProvider(graph)` - the repository-local provider: deterministic Knowledge Graph keyword search, zero cost, and refusal when nothing approved matches.

## Extension point

`AIProvider` (`types.ts`) is the interface a future LLM-backed provider implements. External providers are rejected by the runtime until provider selection, data-protection review, residency, security review, and activation are approved.

## Status

The local deterministic provider and authenticated governed route are implemented. Raw prompts are not persisted; logs retain an HMAC digest, policy and provider provenance, public citation URLs, request ID, and answer digest. All output remains advisory. Governance use cases and external providers fail closed because neither is approved or activated.
