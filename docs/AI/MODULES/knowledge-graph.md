# Module: Knowledge Graph

## Incremental Release-F integration — 2026-08-16

The central Operations index advertises the Knowledge Graph workspace only for
an active exact `knowledge-graph.operations.read:civic` grant at MFA assurance.
The domain API independently reauthorizes the session actor; Governance-domain
authority does not unlock the Civic workspace and candidate/reviewer
separation remains unchanged.

## Incremental public V1 projection — 2026-08-16

Release E consumes `getPublicKnowledgeGraph` through a separate explicit DTO
projector; it does not add a graph, table or relationship-generation path.
Versioned public entities and relationships include only mapped public content
URLs and deterministic/human-reviewed provenance. Internal file paths,
canonical source paths, domain ownership and non-public records are excluded.
DE/EN/FA filtering and filter-bound cursor tests preserve cross-locale and
pagination boundaries.

## Incremental implementation — Release C, 2026-08-10

The previously declarative HTTP paths are now implemented under
`src/app/api/knowledge-graph/`. Public lookup, related and search responses are
read-only allowlisted DTOs over currently public-eligible, human-approved
provenance. Staff operations provide deterministic rebuild and exact-candidate
review behind shared PostgreSQL limits, session-derived actors, exact Civic
capabilities and MFA.

`src/modules/knowledge-graph/{repository-build,candidates,schema-registry}.ts`
make rebuild ordering, schema ownership, fingerprints and the aggregate content
digest deterministic. A rebuild persists candidates only. A different human
must approve; peer-domain mutation is rejected; a relationship cannot publish
before both same-domain endpoints; accepted graph/provenance/AuditLog writes are
one transaction. No model, embedding provider or generative relation path is
present.

Migration `0021_knowledge-graph-governance` adds `kg_graph_builds`,
`kg_candidates` and `kg_provenance`; it does not duplicate the existing entity
or relationship tables. Explicit HARM project frontmatter supplies two verified
Civic/content entities across DE/EN/FA, producing three aggregate candidates
from three locale-specific edges. Public projection strips non-public aliases
and source paths. Search index enrichment and the localized MFA Operations UI
are implemented. Full verification passes 92 files / 386 tests; fresh schema is
22 migrations / 98 tables; Production is unchanged at 19 / 66.

The older “routes absent / future wiring” notes below are retained as historical
evidence and are superseded by this Release-C update. ADR-035 remains reserved:
no Innovation 6/7 or new HARM graph lifecycle, retention, withdrawal or deletion
rule was implemented.

## Incremental verification and correction — 2026-08-04

The optional domain predicate in `searchEntities` is now grouped across all
canonical-name, alias, and type matching. Previously, JavaScript operator
precedence allowed alias/type matches from the peer domain to bypass a Civic or
Governance filter. A cross-domain regression fixture proves the corrected
boundary; the focused module suite passes 10/10.

The three manifest-declared HTTP paths are now confirmed absent. Existing
consumers (`dashboard/digest.ts`, the local AI provider, Events, Publishing,
and tests) import the deterministic functions and graph types in-process. This
matches the manifest's explicit statement that its route metadata is
declarative future wiring, while confirming that no literal public HTTP API is
currently implemented.

## Purpose

Deterministic entity/relationship extraction from Git-committed MDX content, providing a queryable graph other modules (AI Layer, Events Q&A) consume — never AI-invented. Evidence: `architecture/adr/ADR-007-knowledge-graph.md`; `src/modules/knowledge-graph/manifest.ts` (read in full, this session).

## Canonical authority

- `architecture/adr/ADR-007-knowledge-graph.md` — deterministic extraction, never AI-invented.
- `architecture/adr/ADR-028-knowledge-graph-boundary.md` — generic graph mechanism → Shared Platform Services; graph semantics → owning domains.
- `architecture/adr/ADR-019-civic-intelligence-layer-and-knowledge-graph-relationship.md` — accepts the HARM-specific Knowledge Graph specialization under ADR-007/026/028; **reserves Innovations 6/7 and new operational graph rules for ADR-035 (not yet written)**.

## Current implementation

`src/modules/knowledge-graph/{build.ts, api.ts, types.ts, manifest.ts, graph-rebuild-cli-entry.ts, knowledge-graph.test.ts, extractors/frontmatter-extractor.ts}` (directory listing this session; `manifest.ts` read in full). Committed via `9f9ec5f` (Foundation Build Order Steps 1-5), ≤ `origin/main` tip `7025e6f`.
`manifest.ts`'s own inline comment states that its table and route metadata is declarative and requires later Backend/API wiring. The actual tables it lists (`kg_entities`, `kg_relationships`) are implemented in `module-schema.ts`. The three listed HTTP paths are confirmed absent; current module consumption is in-process.

## Data and persistence

`src/persistence/module-schema.ts` (grepped this session): `kgEntities`/`kg_entities` (L203), `kgRelationships`/`kg_relationships` (L212). Confirmed via targeted grep for `kg_entities`/`kg_relationships` this session — both exist as real `pgTable` definitions, matching the manifest's declared `databaseTables`.

## Authorization and trust boundaries

The in-process query API accepts an optional `BusinessDomain` and now enforces
that predicate uniformly for canonical names, aliases, and types. There is no
dedicated HTTP authorization layer because no Knowledge Graph HTTP route is
implemented. Any future public or staff route still needs an accepted access
policy; do not infer one from declarative manifest metadata.

## Public interfaces

`manifest.ts` declares intended routes `/api/knowledge-graph/{lookup,related,search}`, but they are not implemented under `src/app/api`. The implemented public interface is currently an in-process TypeScript API; graph rebuild also has a CLI entry point.

## Verification

`src/modules/knowledge-graph/knowledge-graph.test.ts` passes 10/10, including cross-domain alias and type matches that previously bypassed the requested domain.

## Decisions and rejected approaches

Deterministic, non-AI extraction is the core rejected-alternative-avoidance decision baked into ADR-007's title itself ("never AI-invented") — no separate alternatives text was read in full this session.

## Current status

**PRODUCTION_DEPLOYED, PARTIALLY IMPLEMENTED** — deterministic build,
extraction, in-process queries, both tables, and domain filtering exist. The
manifest-declared external HTTP interface is confirmed unbuilt and remains
future wiring rather than an operational API.

## Open work

Before implementing `/api/knowledge-graph/{lookup,related,search}`, define and
approve its public/staff access policy and a concrete backend milestone. ADR-035
(reserved, not written) is **not** an active task — see `OPEN_WORK.md`
OPEN-008.

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
