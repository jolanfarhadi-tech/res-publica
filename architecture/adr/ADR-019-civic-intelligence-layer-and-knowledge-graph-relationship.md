# ADR: Civic Intelligence Layer and Knowledge Graph Relationship

## Status
**Draft — not final, pending review.** This ADR is created because the Standard governing this repository (`standards/RP_STANDARD_001_DOCUMENTATION_ARCHITECTURE.md` §7) requires new Foundation Architecture documents to be authorized by an ADR. Per explicit instruction, this is a draft record only, not an accepted decision.

## Context

An external source specification (`CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATION.md`, reviewed by the user in the IDE) proposed formalizing two things: (1) a "Civic Intelligence Layer" positioning the existing Civic Intelligence Lab (Innovation 5) within a broader 5-layer stack plus two new, previously unnamed Innovations (6 — Policy & Action Lab; 7 — Responsibility Observatory); and (2) a specific relationship between that layer and the Knowledge Graph already defined in `ADR-007`, including 14 HARM-specific node types and 10 edge types.

Review of the existing repository found: `docs/source/methodology/CIVIC_INTELLIGENCE.md` already canonically defines Civic Intelligence Lab; `ADR-007` already defines a generic Knowledge Graph for Website content; no document previously specialized that graph for HARM-ecosystem objects (Stories, Codex entries, Annexes, Patterns); no `brain/ARCHITECTURE/` directory previously existed; `brain/DECISIONS.md` (the ADR index) had not been updated since ADR-012.

## Decision (draft)

Created two new Foundation Architecture documents under a new `brain/ARCHITECTURE/` subdirectory:

- **`CIVIC_INTELLIGENCE_LAYER.md`** — deepens, does not redefine, the existing Civic Intelligence Lab. States its core definition and motto verbatim as specified. Maps Layers 1–5 explicitly onto the existing five canonical Innovations by name. Explicitly flags Innovations 6 and 7 as proposed extensions **not yet adopted** into `01_HARM_OPERATING_SYSTEM.md`'s canonical Innovation list — this ADR does not amend that document. Documents the six-step Intelligence Cycle as the internal detail of the existing four-step Workflow already in `CIVIC_INTELLIGENCE.md`. Includes an explicitly conceptual, non-LOCKED implementation sketch (`IntelligenceCycle`, `Pattern`, `Scenario`, `OrientationStatement`).

- **`CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md`** — specializes, does not replace, `ADR-007`'s existing Knowledge Graph for HARM-ecosystem node/edge types. Adds one value beyond the source specification: a `"reference"` status for taxonomy/reference nodes (`HarmCategory`, `NormativeFramework`), explicitly flagged as an addition with its own rationale, not silently introduced.

Neither document adds any entity to `brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED). Both are explicitly conceptual sketches, consistent with how Annex-ecosystem concepts (Annex, Evidence Package, Civic Contribution) were kept out of the locked model pending their own future ADR.

## Governance Compliance

Per `standards/RP_STANDARD_001_DOCUMENTATION_ARCHITECTURE.md`:
- §5 (Naming): new documents follow `UPPER_SNAKE_CASE.md`; the new `brain/ARCHITECTURE/` directory is not yet enumerated in the Standard's §2 taxonomy — flagged as a gap for the Standard's own future update, not resolved here.
- §9 (Traceability): both new documents carry the required metadata block and state what they extend/reconcile with.
- §14 (Introducing new documents): both documents state their relationship to existing canonical owners (`CIVIC_INTELLIGENCE.md`, `ADR-007`) rather than silently duplicating them.

## Consequences

- A new Foundation Architecture subdirectory (`brain/ARCHITECTURE/`) now exists, not yet reflected in RP Standard 001's own document taxonomy (§2) — a follow-up amendment to the Standard is recommended but not performed here.
- Innovations 6 and 7 exist only in this draft ADR's scope; `01_HARM_OPERATING_SYSTEM.md` remains unchanged and still names exactly five canonical Innovations until a separate decision is made.
- `brain/DECISIONS.md` gains one new entry for this draft ADR; its existing gap (no entries for ADR-013 through ADR-018) is noted but not backfilled here, as out of this task's scope.
- No LOCKED file was modified.

## Alternatives Considered

- **Fold this content into the existing `CIVIC_INTELLIGENCE.md` methodology document directly.** Rejected — that document is a methodology-tier definition; this content is deep architecture (schema sketches, graph specialization) more consistent with the Foundation Architecture tier already used for the Annex ecosystem.
- **Silently adopt Innovations 6/7 as canonical by editing `01_HARM_OPERATING_SYSTEM.md`.** Rejected — that document was not named in this task's scope, and doing so would exceed "do not invent missing architecture" by unilaterally expanding an already-established canonical list.
- **Treat the schema sketches as immediately-ready Core Domain Model entities.** Rejected — the source specification itself labels them a "Schema-Skizze (für Implementierung)" (a sketch for implementation), and the task explicitly instructed not to create new domain entities unless clearly required; nothing here clearly requires it yet.

## Open Questions for Human Review
1. Should Innovations 6 and 7 be formally proposed for `01_HARM_OPERATING_SYSTEM.md`, and if so, via what process?
2. Should `brain/ARCHITECTURE/` be added to RP Standard 001's document taxonomy (§2) as a seventh category, or folded into the existing "Foundation Architecture" category definition?
3. Should `brain/DECISIONS.md` receive a full backfill for ADR-013 through ADR-018, given it is now visibly stale?
