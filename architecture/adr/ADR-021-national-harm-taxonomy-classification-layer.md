# ADR-021: National Harm Taxonomy as the Annex Classification Layer

## Status
Accepted

## Context

The user directed that the "National Harm Taxonomy" be treated as the canonical taxonomy used by the Annex lifecycle, explicitly **not** a new standalone framework, and required: every Annex to reference at least one Harm Category; Harm Categories to become the classification layer for 9 named systems (Responsibility Dashboard, Priority Selection, Scientific Review, Annex, Blockchain Record, Civic Contribution, Knowledge Graph, Civic Intelligence, Early Warning); no duplication of existing concepts; reuse of existing data models; and a full repository consistency check before any writing.

A full repository search, performed before writing anything, found no document or file anywhere containing actual "National Harm Taxonomy" content (an enumerated category list). The only existing taxonomy content in the repository is `docs/source/methodology/HARM_CODEX.md`'s own "Version 1.0 proposal, pending approval": three categories — institutional mechanisms, systemic patterns, procedural failures. The Knowledge Graph specialization (`brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md`) already referenced a `HarmCategory` node type and a `categorized_as` edge, but only generically, without naming or enumerating categories in the repository itself.

Given this genuine content gap on a requirement stated as a hard "MUST," the user was asked to clarify rather than have a category list invented. The user confirmed: treat "National Harm Taxonomy" as the formal name for `HARM_CODEX.md`'s existing 3-category proposal — no new category names.

## Decision

**No new taxonomy content was created.** "National Harm Taxonomy" is adopted as the formal name for the taxonomy already proposed in `docs/source/methodology/HARM_CODEX.md` (institutional mechanisms, systemic patterns, procedural failures) — that document's content is unchanged, only formally named.

**Integrated into the existing Annex architecture only**, via one new section added to `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` (§12, "National Harm Taxonomy — Classification Layer") and one new governance rule (§6, Rule 7: "Each validated Annex shall be classified under one or more Harm Categories from the National Harm Taxonomy. Harm Categories classify Annexes; they do not generate them. Annexes originate from validated evidence produced through the Structured Hearing and Scientific Review pipeline."). No parallel lifecycle was created.

**Wording clarified post-adoption (same turn, no architectural meaning change):** the rule's initial wording ("must reference," "must cite") was ambiguous by omission about *when* classification occurs relative to Annex validation, and its position alongside genuinely gating rules (Rule 2, Rule 3) risked being misread as a precondition for Annex creation rather than a post-validation classification step. The `categorized_as` edge direction (`Annex → HarmCategory`) always made the correct architecture explicit — an Annex is classified, not generated, by its category — so this is a precision fix to the rule's prose, not a change to the decision recorded above.

**Reused existing data models exactly:**
- The `HarmCategory` node type and `categorized_as` edge, already defined in `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md`, are extended in scope from `CodexEntry → HarmCategory` to also cover `Annex → HarmCategory`, using the *same* edge type — not a new one.
- No entity was added to `brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED).

**Classification layer across the 9 named systems:** §12's table shows that 7 of the 9 integration points already existed implicitly in already-canonical documents (Scientific Review's Narrative Coding already references "the Harm Codex taxonomy"; the Knowledge Graph already models `HarmCategory`; Civic Intelligence's Pattern Recognition already groups by "same HarmCategory") — this ADR only names the shared taxonomy each already uses. The two points requiring genuine new content were: (1) the Annex governance rule itself (new, per above), and (2) explicit statements that the Blockchain Record and Civic Contribution consume Harm Category classification only indirectly (via the Annex they reference), not as their own separate classification.

## Minimal Cross-References Added

- `docs/source/methodology/HARM_CODEX.md` — one sentence naming its existing taxonomy as the National Harm Taxonomy, cross-referencing §12.
- `brain/ARCHITECTURE/CIVIC_INTELLIGENCE_KNOWLEDGE_GRAPH_RELATIONSHIP.md` — the `HarmCategory` node type row updated to name the taxonomy and its 3 current categories.
- `docs/source/methodology/RESPONSIBILITY_ANNEXES.md` — one governance sentence cross-referencing Rule 7.
- `brain/DECISIONS.md` — one new pending-ADR index row.

No other document was modified. No LOCKED file was touched. No existing document was recreated.

## Preservation of Existing ADR Decisions

ADR-013 through ADR-020 are unaffected. This ADR adds Governance Rule 7 alongside the existing 6 rules in `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §6 (established across ADR-014 and ADR-015) without altering any of them. ADR-020's Dual Intake and Review Paths decision is untouched — the National Harm Taxonomy classification applies identically to both paths' resulting Annexes.

## Consequences

- Every future validated Annex must be classified under at least one Harm Category to be considered complete — a new, real constraint applied *after* the Annex Deepening/Scientific Review workflow produces a validated Annex, not a precondition of it; not yet enforced in any implementation (none exists yet).
- The National Harm Taxonomy remains, honestly, a 3-category Version 1.0 proposal, not a fully mature national-scale taxonomy — this ADR does not upgrade its evidentiary status, only its name and integration surface.
- Any future expansion of the taxonomy's category list requires its own governance process (`docs/source/governance/REVIEW_PROCESS.md`), not a silent edit to `HARM_CODEX.md`.

## Alternatives Considered

- **Invent a plausible category list (e.g., environmental, health, economic, social, institutional, digital, intergenerational) to match the "National" framing's apparent scope.** Rejected — no source material was found for any such list; inventing one for a hard "MUST" requirement would misrepresent invented content as an already-approved national taxonomy.
- **Create a new standalone "National Harm Taxonomy" document.** Rejected — explicitly instructed against ("this is NOT a new standalone framework"); `HARM_CODEX.md` already canonically owns this content.
- **Introduce a new Knowledge Graph edge type specifically for Annex-to-category classification.** Rejected — the existing `categorized_as` edge already models this relationship generically; a new edge type would duplicate existing structure rather than reuse it.
