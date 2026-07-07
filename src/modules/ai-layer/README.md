# AI Layer

Foundation Build Order Step 5, MVP module #2 (`ADR-008`).

## Purpose

The single, shared, grounded-retrieval service every other module consumes rather than reimplements.

## API

- `queryAILayer(provider, prompt, ledger)` — the entry point every module should use. Enforces cost governance (`cost-governance.ts`) and citation-or-refuse regardless of provider.
- `createLocalProvider(graph)` — the default, repository-local `AIProvider`: deterministic Knowledge Graph keyword search, zero cost, always refuses when nothing matches.

## Extension point

`AIProvider` (`types.ts`) is the interface a future LLM-backed provider implements. Activating a real provider is a configuration change (pass a different `AIProvider` to `queryAILayer`), not a redesign of this module.

## Status

Local provider implemented and tested. Real external provider (grounded RAG, embeddings, LLM calls) is separate, later, infrastructure-dependent work — not started.
