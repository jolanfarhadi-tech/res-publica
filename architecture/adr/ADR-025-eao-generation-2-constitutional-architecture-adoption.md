# ADR-025: Adoption of the EAO Generation 2 Constitutional Architecture

## Status
Accepted.

## Classification
**Architectural governance decision.** This ADR introduces no implementation change of any kind — it formally adopts already-persisted documentation as the governing authority for future EAO work.

## Context

Generation 1 of the Executive AI Office (EAO) delivered 9 working, composed pipelines (`ADR-024`) through disciplined but entirely informal practice — search before building, extend at the source, verify before trusting output. That discipline caught real defects at every stage, but existed only as the acting engineer's own habit, not as a checkable, durable structure.

A Generation 2 planning arc (Architecture Assessment -> Blueprint -> Governance Framework -> Refinement -> Constitutional Architecture -> Readiness Review -> Transition Plan) formalized that informal discipline into an explicit constitutional layer, and a subsequent Transition Phase persisted the resulting documents to the repository under `brain/AI/`:

- `EAO_GEN2_CONSTITUTIONAL_ARCHITECTURE.md`
- `EAO_GEN2_GOVERNANCE_FRAMEWORK.md`
- `EAO_CANONICAL_ACTION_MODEL_SPEC.md`
- `EAO_CATEGORY_REGISTRY.md`
- `EAO_RISK_DOMAIN_REGISTRY.md`
- `EAO_SCHEMA_VERSIONING_SPEC.md`
- `EAO_GEN2_READINESS_REVIEW.md` (historical record)
- `EAO_GEN2_INDEX.md` (navigation entry point)

This ADR is the formal adoption step the Constitutional Architecture's own Review Model (`EAO_GEN2_CONSTITUTIONAL_ARCHITECTURE.md` §8) requires for a change of this scope: establishing a new governing authority is, by the Constitution's own criteria, always ADR-required.

## Decision

1. **`EAO_GEN2_CONSTITUTIONAL_ARCHITECTURE.md` is adopted as the authoritative architectural reference** for the EAO execution platform — its layers, dependency model, ownership model, invariants, and maturity model govern how Generation 2 and all subsequent generations are understood and evolved.
2. **`EAO_GEN2_GOVERNANCE_FRAMEWORK.md` is adopted as the governing process** — its principles, ADR criteria, quality gates, governance lifecycle, Fitness Functions, and Exceptions Policy govern how any change to the architecture may be proposed, reviewed, and released.
3. **`EAO_CANONICAL_ACTION_MODEL_SPEC.md` is adopted as the architectural contract** for cross-pipeline findings — the 12-field shape it documents (verified against live code at Transition) is the single reference for what a canonical action is, until changed through the process in (2).
4. **`EAO_CATEGORY_REGISTRY.md` and `EAO_RISK_DOMAIN_REGISTRY.md` are adopted as the authoritative registries** for the `category` and `riskDomain` fields respectively — no future addition, deprecation, or reinterpretation of a category or domain is valid unless it follows the extension/deprecation policies these documents state.
5. **All future EAO architectural work shall follow these documents** unless and until superseded through the constitutional governance process defined in (2) — informal deviation is not permitted once this ADR is accepted.

## Consequences

- No file under `scripts/eao/**` is modified by this ADR. Every canonical field, category, and domain named in the adopted documents already existed in the live code before this ADR — the documents describe the repository as it stands, they do not change it.
- The known, disclosed gaps recorded in the adopted documents (`count`/`riskDomain` not yet derived, `evidence` type inconsistency, registries not yet wired into code, `schemaVersion` not yet implemented) remain open and are explicitly out of scope for this ADR — they are Phase A implementation work, tracked separately (see the Transition Backlog registration accompanying this ADR).
- Future changes to any adopted document must follow `EAO_GEN2_GOVERNANCE_FRAMEWORK.md` §6's ADR-required/recommended/unnecessary criteria — this ADR does not itself define new criteria, it activates the ones already specified in the adopted Governance Framework.

## Alternatives Considered

- **Treat the Generation 2 documents as informative only, without a formal adoption ADR.** Rejected — the Constitutional Architecture's own Review Model classifies "establishing a new governing authority" as always ADR-required; adopting the constitution without an ADR would itself violate the constitution's own review criteria on its first application.

## Human Approval Required

Before: any future amendment to an adopted document (per `EAO_GEN2_GOVERNANCE_FRAMEWORK.md` §6); any Phase A implementation change (a separate, still-pending approval, not granted by this ADR).

## References

`brain/AI/EAO_GEN2_INDEX.md`; `brain/AI/EAO_GEN2_CONSTITUTIONAL_ARCHITECTURE.md`; `brain/AI/EAO_GEN2_GOVERNANCE_FRAMEWORK.md`; `brain/AI/EAO_CANONICAL_ACTION_MODEL_SPEC.md`; `brain/AI/EAO_CATEGORY_REGISTRY.md`; `brain/AI/EAO_RISK_DOMAIN_REGISTRY.md`; `brain/AI/EAO_SCHEMA_VERSIONING_SPEC.md`; `architecture/adr/ADR-024-executive-ai-office.md`
