# Module: Knowledge Graph

## Purpose

Deterministic entity/relationship extraction from Git-committed MDX content, providing a queryable graph other modules (AI Layer, Events Q&A) consume — never AI-invented. Evidence: `architecture/adr/ADR-007-knowledge-graph.md`; `src/modules/knowledge-graph/manifest.ts` (read in full, this session).

## Canonical authority

- `architecture/adr/ADR-007-knowledge-graph.md` — deterministic extraction, never AI-invented.
- `architecture/adr/ADR-028-knowledge-graph-boundary.md` — generic graph mechanism → Shared Platform Services; graph semantics → owning domains.
- `architecture/adr/ADR-019-civic-intelligence-layer-and-knowledge-graph-relationship.md` — accepts the HARM-specific Knowledge Graph specialization under ADR-007/026/028; **reserves Innovations 6/7 and new operational graph rules for ADR-035 (not yet written)**.

## Current implementation

`src/modules/knowledge-graph/{build.ts, api.ts, types.ts, manifest.ts, graph-rebuild-cli-entry.ts, knowledge-graph.test.ts, extractors/frontmatter-extractor.ts}` (directory listing this session; `manifest.ts` read in full). Committed via `9f9ec5f` (Foundation Build Order Steps 1-5), ≤ `origin/main` tip `7025e6f`.
`manifest.ts`'s own inline comment (read in full): *"Knowledge Graph's Plugin Architecture manifest (ADR-003). Declarative only — no table or route is created or wired by this file; Backend/API Architecture implementation will act on this metadata later."* **This refers only to the manifest file itself** — the actual tables it lists (`kg_entities`, `kg_relationships`) are separately implemented in `module-schema.ts` (confirmed by direct grep this session), and API route paths it lists (`/api/knowledge-graph/{lookup,related,search}`) were **not found** under `src/app/api/` in this session's directory listing of that tree — **their implementation status is UNKNOWN**, not confirmed either way.

## Data and persistence

`src/persistence/module-schema.ts` (grepped this session): `kgEntities`/`kg_entities` (L203), `kgRelationships`/`kg_relationships` (L212). Confirmed via targeted grep for `kg_entities`/`kg_relationships` this session — both exist as real `pgTable` definitions, matching the manifest's declared `databaseTables`.

## Authorization and trust boundaries

Not assessed this session — no authority/authorization file found under `src/modules/knowledge-graph/` (unlike `publishing`/`harm-governance`, which each have their own `authority.ts`). This may mean the Knowledge Graph has no dedicated authorization layer of its own (read-only, publicly-derivable data) or that authorization is enforced elsewhere — **not confirmed either way this session.**

## Public interfaces

`manifest.ts` declares intended routes `/api/knowledge-graph/{lookup,related,search}`, but **these routes were not found in `src/app/api/`'s directory listing this session** (only `auth`, `events`, `governance`, `health`, `membership`, `newsletter`, `platform`, `publishing` top-level directories were observed under `src/app/api/`). `graph-rebuild-cli-entry.ts` suggests a CLI-invoked rebuild path (likely via `scripts/cli.mjs`, ADR-005) rather than an HTTP API — not confirmed this session.

## Verification

Test confirmed to exist: `src/modules/knowledge-graph/knowledge-graph.test.ts`. **Not run this session.**

## Decisions and rejected approaches

Deterministic, non-AI extraction is the core rejected-alternative-avoidance decision baked into ADR-007's title itself ("never AI-invented") — no separate alternatives text was read in full this session.

## Current status

**REMOTE_VERIFIED**, **PARTIALLY IMPLEMENTED** — core build/API/extraction logic and both declared tables exist and are committed; the three manifest-declared HTTP API routes were **not found**, so the module's *internal* logic is REMOTE_VERIFIED while its *external HTTP* interface is **UNKNOWN/likely not implemented as literal `/api/knowledge-graph/*` routes** (it may be consumed only in-process by other modules, e.g., Events' `qa.ts` and AI Layer's local provider, both of which reference "the Knowledge Graph" without necessarily going through an HTTP route — not confirmed either way this session).

## Open work

Confirm whether `/api/knowledge-graph/{lookup,related,search}` are (a) implemented under a path this session's directory listing missed, (b) intentionally not implemented as HTTP routes because consumption is in-process only, or (c) genuinely unbuilt. This compilation could not distinguish between these three possibilities and does not guess. ADR-035 (reserved, not written) is **not** an active task — see `OPEN_WORK.md` OPEN-008.

## Do not redo

Do not re-implement `kg_entities`/`kg_relationships` tables or the frontmatter extractor — both exist and are committed. Do not write Innovations 6/7 or new operational graph rules without first writing and accepting ADR-035 (reserved).

## Evidence index

- `architecture/adr/ADR-007-knowledge-graph.md`, `ADR-019-civic-intelligence-layer-and-knowledge-graph-relationship.md`, `ADR-028-knowledge-graph-boundary.md`
- `src/modules/knowledge-graph/manifest.ts` (full read, this session)
- `src/modules/knowledge-graph/{build,api,types,graph-rebuild-cli-entry}.ts`, `extractors/frontmatter-extractor.ts` (directory listing; not individually read)
- `src/persistence/module-schema.ts:203,212` (grep confirmed, this session)
- command: directory listing of `src/app/api/` (this session) — `knowledge-graph` subdirectory absent
- commit `9f9ec5f`
- test: `knowledge-graph.test.ts`
