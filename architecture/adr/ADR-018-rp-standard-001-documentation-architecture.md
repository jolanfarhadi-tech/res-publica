# ADR-018: Adopt RP Standard 001 — Documentation Architecture Standard

## Status
Accepted

## Context

An architecture review of the Annex ecosystem (this session) found that Annex-related architecture had grown organically across a single document (`brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`) through four ADRs (014–017), each requiring section renumbering, with governance rules split across two lists and roles scattered across four documents with no single roster or index. The review recommended not a new Annex document, but a repository-wide documentation governance standard addressing the underlying pattern.

Before drafting, a conflict analysis found: (1) `docs/source/MASTER_SYSTEM.md` already states informal documentation-governance principles; (2) two partial "relationship between document types" statements already exist (`docs/source/foundation/04_GOVERNANCE.md`'s Decision Hierarchy and `docs/source/DECISION_LOG.md`'s precedence rule) and disagree in scope; (3) `docs/source/standards/` already exists but with narrower, `docs/source/`-only scope; (4) the "`brain/` is historical" framing established earlier this session is factually imprecise given `brain/FOUNDATION/`, `brain/DOMAIN/`, `brain/APPLICATION/`, and `brain/AI/` all hold live canonical architecture.

## Decision

Adopted `standards/RP_STANDARD_001_DOCUMENTATION_ARCHITECTURE.md` v1.0.0 as a new document type ("Standard"), distinct from ADRs and from `docs/source/standards/`'s narrower content-style category, per explicit human decisions:

1. **Placement:** a new top-level `standards/` directory, not `docs/source/standards/`, since this Standard governs the whole repository (`brain/`, `docs/source/`, `architecture/adr/`), not only the documentation tree.
2. **`MASTER_SYSTEM.md`:** explicitly retained as the bootstrap document, not deprecated or superseded. The Standard formalizes its informal principles without replacing it. Retirement of `MASTER_SYSTEM.md` is out of scope and requires its own future ADR.
3. **Metadata (§12, §17 of the Standard):** applied prospectively only. No existing document was retroactively modified to add the new metadata block. A dedicated repository-wide migration remains a separate, future task.

The Standard reconciles rather than replaces the two existing partial relationship statements (Decision Hierarchy = authority; precedence rule = content-conflict resolution) by introducing Architecture Layers (§4) as a third, previously-unaddressed concern: citation direction between document types.

The Standard corrects the imprecise "`brain/` = historical" framing (§2), stating explicitly that `brain/FOUNDATION/`, `brain/DOMAIN/`, `brain/APPLICATION/`, and `brain/AI/` hold live canonical Foundation Architecture, while only `brain/BLUEPRINTS/`, the Constitution review snapshots, and `PROJECT_BRAIN_STATUS.md` are genuinely historical.

## Consequences

- A new document type, "Standard," now exists alongside Constitution, ADR, Foundation Architecture, Methodology, and Governance/Project/Reference — with its own numbering track (`RP Standard NNN`) and its own top-level directory.
- Future Standards require an ADR to adopt, per the Standard's own §7 rule, applied here reflexively to its own adoption.
- No existing document was modified, renamed, or had metadata retroactively added — this ADR and the Standard's creation are additive only.
- `docs/source/MASTER_SYSTEM.md` continues to serve as the bootstrap document unchanged; a future ADR is required before any change to its status.
- Naming conventions (§5) apply prospectively only; no existing file is renamed as a result of this ADR.

## Alternatives Considered

- **Place the Standard inside `docs/source/standards/`.** Rejected per explicit decision — that directory's existing scope is documentation-tree content style, narrower than a repository-wide governance standard.
- **Have this ADR also deprecate `docs/source/MASTER_SYSTEM.md`.** Rejected per explicit decision — premature; retirement decisions require their own dedicated ADR once the documentation governance model is fully adopted in practice, not bundled into its initial adoption.
- **Retroactively add the new metadata block to all LOCKED and Foundation Architecture documents immediately.** Rejected per explicit decision — scoped as a separate, dedicated future migration task, kept out of this ADR to avoid mixing a large mechanical change with the Standard's initial adoption.
- **Rewrite `docs/source/foundation/04_GOVERNANCE.md` or `docs/source/DECISION_LOG.md` to merge their content into this Standard.** Rejected — both remain the canonical owners of their respective concerns (decision authority; content-conflict precedence); this Standard adds a third, distinct concern (citation direction) rather than absorbing theirs, consistent with "do not move responsibilities already owned by other documents."
