# ADR-011: Phase 0 Start

## Context

Foundation Architecture v1.0 was approved (`FOUNDATION_REVIEW_FINAL.md`), committed (`2c2dedb`), and tagged `foundation-v1.0`. The Project Brain migration that followed consolidated every approved Foundation artifact into `/brain` as the project's permanent Single Source of Truth, was finalized in a dedicated gate-check pass, and is now frozen: commit `7d39c71` ("Finalize Project Brain v1.1"), tagged `project-brain-v1.1`, pushed to `origin/main`. Phase 0 ("Foundation hardening," per `brain/ROADMAP.md`) is the first phase of actual implementation work and needs an explicit, named baseline to build against, rather than an informal understanding of "whatever the Brain currently says."

## Decision

Phase 0 officially begins from the frozen Project Brain v1.1 baseline (commit `7d39c71`, tag `project-brain-v1.1`). This means, for the duration of Phase 0:

- All Phase 0 work references `/brain` for definitions, decisions, module scope, and standing principles — it does not redefine or restate concepts `/brain` already canonically owns (per `brain/GOVERNANCE/brain-governance-rules.md` rule 2).
- No document under `/brain`, `architecture/adr/`, or the repo-root `FOUNDATION_REVIEW.md` / `FOUNDATION_REVIEW_FINAL.md` is modified during Phase 0, except through a new ADR that explicitly authorizes the specific change.
- Phase 0's own scope is exactly what `brain/ROADMAP.md` and `brain/BLUEPRINTS/foundation-architecture.md` §9 (Foundation Build Order) already define: Step 0 — confirming/applying the four original Engineering/Security Audit P0 fixes (deleting the dead `proxy.ts`, adding a content-read caching layer, sanitizing slugs before filesystem access, adding newsletter rate limiting) — ahead of any Core Domain Model implementation work.

## Alternatives Considered

- **Start Phase 0 without a formal gate/baseline marker.** Rejected — without a named commit/tag boundary, it becomes impossible to later answer "which exact version of the Brain was Phase 0 actually built against," which matters the first time Phase 0 work and Brain content appear to disagree.
- **Allow ad hoc Brain edits during Phase 0 whenever a convenient fix is found.** Rejected — this is precisely the discipline the Brain migration and its freeze exist to prevent; an implementation phase is exactly when the pressure to "just fix the doc while I'm here" is highest, and exactly when that pressure most needs a named process (a new ADR) rather than a silent edit.

## Consequences

Any Phase 0 discovery that appears to require a change to Brain content (a missing entity, an incorrect integration-map row, a principle that doesn't fit a real implementation constraint) must be raised as a new, explicitly-scoped ADR proposal — not resolved by editing `/brain` directly. This adds a small amount of process overhead to Phase 0 but preserves the single-source-of-truth property the entire migration was built to establish. Phase 0 implementation work proceeds against the exact frozen baseline named above; if the baseline is ever superseded, that supersession itself must be a new ADR, not an implicit assumption.

## Future Impact

This is the first "Phase start" ADR; the same pattern — a named, frozen baseline commit/tag, an explicit no-silent-edit rule, and Brain-Rather-than-redefine referencing — should be repeated at the start of MVP, V2, and V3, each against whatever the then-current frozen Brain baseline is. This ADR does not itself authorize any Core Domain Model, module, or Constitution work — those remain out of scope until separately started.
