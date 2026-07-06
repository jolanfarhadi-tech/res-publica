# ADR-022: Transferable Civic Value and the Philosophical Basis of Annex Generation

## Status
Accepted

## Context

The user requested a philosophical and architectural clarification of Annex generation, following the Rule 7 wording fix (prior turn, no ADR). Full repository verification (this turn) confirmed every existing reference to Harm Categories is already consistent with the non-generative, post-validation framing — no further correction was needed there.

However, the user's message introduced a genuinely new concept not previously present anywhere in the repository: **Transferable Civic Value** — the idea that an Annex's worth is not the document itself but its capacity to produce six named forms of downstream value (evidence, governance, learning, policy, repair, contribution value). The user also provided a "canonical lifecycle" spanning from reported harm through to "Future Democratic Learning & Institutional Repair," which — checked carefully — omits Blockchain Annex Block and uses coarser stage names than the existing §2 process diagram in `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`.

Since this introduces new architectural content (a named concept with six sub-values, and a new lifecycle-level narrative), this ADR is created — unlike the prior turn's Rule 7 wording fix, which required none.

## Decision

**Added new §13 to `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`**, not a new document, since this content extends the same canonical Annex architecture rather than standing alone:

- Restated the philosophical basis of Annex generation (every person may carry evidence that becomes an Annex via the approved review pathway) as a **framing** of the existing Annex definition (§3), not a redefinition.
- Enumerated Annex origination sources (reported harms, testimonies, lived experiences, documentary evidence, community knowledge, structured observations) as concrete-source-type language for what §7 (Raw Testimony) and `ADR-020` (Direct Annex Path/External Evidence) already cover architecturally — no new intake mechanism was introduced.
- Defined **Transferable Civic Value** (evidence, governance, learning, policy, repair, contribution value) as what an Annex produces once approved — genuinely new content, not previously named anywhere.
- Restated, once more, that Harm Categories are non-generative — consistent with the prior turn's fix, not a new decision.
- Reconciled the user's "canonical lifecycle" as an explicit **value-narrative view** of the existing §2 process lifecycle, not a parallel or competing technical pipeline: Blockchain Annex Block is noted as implicit within "Approved Annex" at this level of abstraction (the integrity record *of* the Annex, per §3), not omitted from the architecture; "Future Democratic Learning & Institutional Repair" is reconciled as the same concept as `01_HARM_OPERATING_SYSTEM.md`'s existing "Institutional Learning / Governance Improvement" stages, not a new terminal state.

## No Duplication, No Parallel Lifecycle

- §2 (the process lifecycle diagram) is unchanged — no stage reordering, no stage removed.
- §6 (Governance Rules) and §12 (National Harm Taxonomy classification layer) are unchanged in substance — §13 restates their non-generative framing for philosophical completeness, it does not alter the rules themselves.
- No new domain entity is proposed; Transferable Civic Value is a conceptual property of an Annex, not a new entity in `brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED).
- "Contribution value" (one of the six) is explicitly cross-referenced to the existing Civic Contribution definition (§3/§4) rather than redefined.

## Consequences

- The Annex architecture now has an explicit philosophical/value-theoretic layer (§13) alongside its process (§2), governance (§6), validation-engine (§7), and classification (§12) layers.
- Future documents describing why an Annex matters, or what downstream systems gain from one, should cite §13's six value types rather than inventing new value language.
- No implementation consequence — Transferable Civic Value remains conceptual, consistent with every other Annex-ecosystem concept's LOCKED-model-deferred status.

## Alternatives Considered

- **Create a new standalone "Transferable Civic Value" document.** Rejected — this content is specifically about what an Annex produces; it belongs with the Annex's own canonical architecture, not a separate document, consistent with the "extend, don't fragment" discipline already applied to Scientific Review (§7) and the National Harm Taxonomy (§12).
- **Treat the user's "canonical lifecycle" as replacing §2's diagram.** Rejected — it omits Blockchain Annex Block and uses coarser stage names; treating it as a literal replacement would silently drop an already-adopted governance rule (Rule 3: no Blockchain Annex Block before approval) from the visible lifecycle. Reconciling it as a value-narrative view preserves both without contradiction.
- **Skip creating an ADR, treating this as a continuation of the prior turn's wording fix.** Rejected — Transferable Civic Value is genuinely new content, not a rewording of something that already existed; per the standing rule ("create an ADR only if the architectural meaning changes"), this one does.
