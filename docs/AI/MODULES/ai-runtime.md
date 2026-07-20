# Module: AI Runtime (AI Layer)

## Purpose

The single, shared, grounded-retrieval service every other module consumes rather than reimplements — citation-or-refuse, cost-governed. Evidence: `src/modules/ai-layer/README.md` (read in full, this session).

## Canonical authority

- `architecture/adr/ADR-008-ai-layer.md` — one shared grounded RAG service, citation-or-refuse, hard cost ceiling. Accepted; amended (AI Layer sole owner of cost/usage data; Moderator-Synthesis Assist endpoint staff-only, per `brain/DECISIONS.md`).
- `architecture/adr/ADR-030-ai-runtime-boundary.md` — shared runtime mechanism; domain decisions stay domain-owned.

## Current implementation

`src/modules/ai-layer/{query.ts, cost-governance.ts, types.ts, manifest.ts, ai-layer.test.ts, README.md, providers/local-provider.ts}` (directory listing, README read in full this session). Committed via `9f9ec5f`, ≤ `origin/main` tip `7025e6f`.
README, direct quotes (read in full): API — *"`queryAILayer(provider, prompt, ledger)` — the entry point every module should use. Enforces cost governance (`cost-governance.ts`) and citation-or-refuse regardless of provider."* / *"`createLocalProvider(graph)` — the default, repository-local `AIProvider`: deterministic Knowledge Graph keyword search, zero cost, always refuses when nothing matches."* Extension point: `AIProvider` (`types.ts`) — "Activating a real provider is a configuration change... not a redesign of this module." Status, verbatim: *"Local provider implemented and tested. Real external provider (grounded RAG, embeddings, LLM calls) is separate, later, infrastructure-dependent work — not started."*

## Data and persistence

`src/persistence/module-schema.ts` (grepped this session): `aiQueryLog`/`ai_query_log` (L224), `aiCostLedger`/`ai_cost_ledger` (L238).

## Authorization and trust boundaries

Not independently assessed this session — no dedicated `authority.ts` found under `src/modules/ai-layer/`. Per `brain/DECISIONS.md`'s ADR-008 amendment note, the "Moderator-Synthesis Assist endpoint is staff-only" — this specific access restriction was **not located or verified in code** this session; reported as a documented claim only, not a code-confirmed fact.

## Public interfaces

No dedicated `src/app/api/ai-layer/` (or similarly named) route directory was found in this session's `src/app/api/` listing. The module is consumed in-process by other modules (e.g., Events' `qa.ts`, per `MODULES/events.md`) rather than exposed as its own top-level API surface, as far as this session's directory listing shows. Not exhaustively confirmed.

## Verification

Test confirmed to exist: `src/modules/ai-layer/ai-layer.test.ts`. **Not run this session.**

## Decisions and rejected approaches

Citation-or-refuse is enforced "regardless of provider" — a deliberate design constraint preventing any future real LLM provider from bypassing grounding, per the README's own framing (the local provider "always refuses when nothing matches" is presented as the baseline behavior any swapped-in provider must preserve). No formally documented "alternatives considered" text was read this session beyond this framing.

## Current status

**REMOTE_VERIFIED**, **PARTIALLY IMPLEMENTED** — local (deterministic, zero-cost, keyword-search-based) provider is implemented and tested; **no LLM call exists in this repository as of this compilation.** Do not describe this module as providing AI-generated answers — it currently performs deterministic Knowledge Graph keyword search only.

## Open work

External provider (grounded RAG, embeddings, real LLM calls) — explicitly deferred, infrastructure-dependent, no provider/cost decision evidenced anywhere in this repository. See `OPEN_WORK.md` OPEN-005. The `AIProvider` interface is the documented extension point for this future work — implement against it rather than modifying `queryAILayer`'s core contract.

## Do not redo

Do not re-implement the local provider or the cost-governance/citation-or-refuse enforcement in `queryAILayer` — both exist and are tested. Do not build a new provider mechanism outside the existing `AIProvider` interface.

## Evidence index

- `architecture/adr/ADR-008-ai-layer.md`, `ADR-030-ai-runtime-boundary.md`
- `src/modules/ai-layer/README.md` (full read, this session)
- `src/modules/ai-layer/{query,cost-governance,types}.ts`, `providers/local-provider.ts` (directory listing; not individually read line-by-line)
- `src/persistence/module-schema.ts:224,238`
- `brain/DECISIONS.md` (ADR-008 amendment note)
- commit `9f9ec5f`
- test: `ai-layer.test.ts`
