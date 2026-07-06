# EAO Phase A Architectural Backlog

```
Status: Transition Phase artifact. Registers confirmed architectural improvement
requests for Phase A implementation. No implementation code is changed by this
document - it is a registration record only.
```

## Purpose

A dedicated, discoverable registration point for architectural backlog items identified during or after the Transition Phase, intended for Phase A (and later Generation 2 implementation phases). This document does not replace `EAO_CANONICAL_ACTION_MODEL_SPEC.md`'s "Known Issues" section — items already recorded there (count/evidence derivation, evidence type inconsistency, registry wiring, `schemaVersion`) remain recorded there. This document is for items discovered separately, starting with the one below.

## Backlog

### BACKLOG-001: Scope-aware Technical Debt Detection

**Observed behavior:** during the Generation 2 Transition, persisting `EAO_CATEGORY_REGISTRY.md` (which legitimately describes the `technical-debt` category as "Outstanding TODO markers") caused the Technical Debt Indicator's TODO count to increase from 24 to 25, with zero change to any pipeline's implementation. The `project-health.mjs` TODO detector (`findTodos()`) matches the literal substring `\bTODO\b` anywhere in any scanned Markdown file, including inside architectural documentation that is *describing* the concept of a TODO marker rather than *containing* an actual outstanding task.

**Architectural impact:** the Technical Debt Indicator's count is not scope-aware — it cannot currently distinguish "a real, outstanding task marker left in project or methodology documentation" from "a documentation file mentioning the word TODO as part of describing this very detector's own behavior." As EAO's own architectural documentation grows (which will increasingly need to describe TODO-related concepts, category names, and detector behavior by name), this will produce a slow, compounding drift in the Technical Debt count that reflects EAO's own self-documentation rather than genuine outstanding work elsewhere in the repository.

**Why this is not a Transition defect:** the Transition's own validation (per the approved Transition execution) explicitly checked for exactly this kind of occurrence and confirmed it was a genuine, correctly-detected, harmless match — not a bug in the detector, not an accidental leftover task marker, and not a Transition-phase inconsistency. The detector behaved exactly as designed; the *design* itself is what this backlog item targets, not any error in this Transition's execution.

**Why it should be addressed during Phase A:** Phase A is already scoped to a Canonical Model/Registry stabilization pass touching `project-health.mjs` and its shared detection logic (per the Transition Plan §7). Scope-aware Technical Debt Detection is the same class of refinement — a detector-precision improvement to code Phase A is already touching — rather than a new, separately-scoped effort.

**Expected architectural outcome:** the Technical Debt detector should exclude TODO occurrences that appear within EAO's own architectural/governance documentation when that documentation is describing the detector, the category, or the concept itself (e.g., via a scoped exclusion of `brain/AI/EAO_*.md` self-referential mentions, or a more precise pattern requiring TODO to appear in a recognized task-marker context rather than as a bare substring match) — without excluding genuine outstanding TODOs that happen to exist within EAO documentation files themselves.

**Status:** Registered, not implemented. No change made to `scripts/eao/project-health.mjs`'s `findTodos()` function during this Transition.

## References

`scripts/eao/project-health.mjs` (`findTodos`); `brain/AI/EAO_CATEGORY_REGISTRY.md`; `brain/AI/EAO_CANONICAL_ACTION_MODEL_SPEC.md`

## Related Documents

`EAO_GEN2_INDEX.md` · `EAO_GEN2_CONSTITUTIONAL_ARCHITECTURE.md`
