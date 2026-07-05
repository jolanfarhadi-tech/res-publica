# ADR-015: Annex Architecture Extension (ERD, Immutability, Full System Integration)

## Status
Accepted

## Context

ADR-014 established the Annex/Blockchain/Civic Contribution lifecycle as a Foundation Architecture capability. The user requested this be treated as "a new foundation capability, not just a document" and asked for: separate definitions for each lifecycle object (including two not previously distinguished — Scientific Approval as distinct from the Scientific Review Committee, and Impact Record as distinct from Impact), an entity relationship diagram, an explicit immutability/versioning governance rule, and an explicit integration narrative covering six named systems (Structured Hearings, HARM Operating System, Contribution & Impact Framework, Responsibility Evidence Model, RPCS, Responsibility Dashboard), plus glossary additions.

Per the standing rule established this session (extend canonical documents rather than create near-duplicates — see ADR-013's own reasoning), this was treated as an extension of `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`, not a new competing document.

## Decision

Extended `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` in place:

1. **New object definitions added to §3:**
   - **Hearing** — explicitly named as shorthand for Structured Hearing, not a new concept.
   - **Scientific Approval** — split out from Scientific Review Committee: the Committee is the body; Scientific Approval is the record of its decision, and the direct input to Blockchain Annex Block production.
   - **Impact Record** — defined as the Annex-sourced, Civic-Contribution-specific instance of the existing "Impact" concept (`02_CONTRIBUTION_IMPACT_FRAMEWORK.md` §9), carrying the same six qualitative dimensions, introducing no new dimension or score.

2. **New Governance Rule 6 added to §6:** Annexes are immutable after blockchain registration; corrections produce a new, traceable version with independent Scientific Approval and Blockchain Annex Block, never an in-place edit. This mirrors the Constitution's existing "never rewritten in place, only amended and appended" discipline (`00_constitution.md` §17).

3. **New §8, Entity Relationship Diagram** — a Mermaid `erDiagram` showing Hearing → Evidence Package → Scientific Approval → Annex → Blockchain Annex Block → Civic Contribution → Responsibility Evidence / Contribution Ledger → Impact Record → Responsibility Dashboard, including the Annex-revision self-relationship (versioning) and the Civic-Contribution-to-Annex cardinality (one-to-many, never zero).

4. **New §9, System Integration** — explicit treatment of all six requested systems. Five (Structured Hearings, HARM Operating System, Contribution & Impact Framework, Responsibility Evidence Model, Responsibility Dashboard) were already touched by ADR-014's §4/§5 and are cross-referenced rather than restated. **RPCS integration is new**: the Trauma-Informed Facilitation track supplies Hearing Facilitators, the Codex Research track supplies Scientific Review Committee expertise, and the AHIP Specialist track supplies upstream intake moderators — with an explicit statement that RPCS certification does not itself grant Committee membership, consistent with RPCS's existing "no abstract credentials" principle.

5. **Glossary additions to `docs/source/glossary/TERMS.md`** — nine new entries (Evidence Package, Annex, Scientific Review Committee, Scientific Approval, Blockchain Annex Block, Civic Contribution, Contribution Ledger, Impact Record), each checked against existing entries first; none conflicts with or duplicates a prior definition.

No new file was created for the architecture itself; only the existing ADR-014 document was extended, plus this ADR and the glossary.

## Consequences

- `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` is now the single, complete canonical document for this capability — lifecycle, ERD, per-object definitions, six governance rules, and six-system integration all in one place.
- The glossary (`docs/source/glossary/TERMS.md`) is now the single point of definition for these nine terms; any future document using them must cite, not redefine.
- No entity was added to the LOCKED Core Domain Model or Application Architecture — the ERD in §8 is a conceptual relationship diagram, not a database schema; a concrete data-model representation still requires its own future ADR against those locked documents.

## Alternatives Considered

- **Create a new, separate "Annex Architecture" document as the user's phrasing ("complete Annex Architecture," "new foundation capability") might suggest.** Rejected — the lifecycle, objects, and governance rules requested are the same ones ADR-014 already established; a new document would have duplicated rather than extended, violating the user's own requirement 2 ("do not duplicate existing concepts").
- **Merge Scientific Approval into the existing Scientific Review Committee definition rather than splitting it out.** Rejected — the user's object list explicitly named them separately, and the distinction (body vs. decision record) is genuine and useful: it clarifies that Blockchain Annex Block production is triggered by the *approval record*, not by the Committee's mere existence.
- **Treat Impact Record as a wholly new concept rather than an instance of existing Impact.** Rejected — would have reintroduced exactly the terminology-drift risk this session already resolved once for Contribution/Responsibility Evidence (ADR-013); defining it as an instance keeps one canonical Impact definition.
