# ADR-005: CLI Architecture

## Context

The existing repository already has `npm run dev`, `npm run build`, and `npm run check-structure`. The 9 MVP modules each introduce new local operational needs — content validation, database seeding, draft publishing, knowledge-graph rebuilding, per-module validation-checklist execution — that would otherwise proliferate as inconsistent, independently-named ad hoc scripts, one per module, with no shared conventions for naming, output format, or exit codes.

## Decision

Introduce a single `respublica` CLI that wraps and extends the existing npm scripts, adding one command per cross-module operational need: `dev`, `build`, `validate-content`, `validate-module <name>`, `seed-local`, `publish-draft <id>`, `graph-rebuild`, and `check-structure` (the existing guard, folded in for discoverability rather than replaced).

## Alternatives Considered

- **Let each module ship its own script with its own conventions.** Rejected — the original Engineering Audit already identified inconsistent script/naming conventions as a real problem in the pre-existing repository; repeating that pattern across 9 new modules would compound it rather than fix it.
- **Build a GUI admin tool instead of a CLI.** Rejected as premature polish — a small, technically capable team doesn't need a GUI at MVP scale, and building one has no MVP-stage justification when a consistent CLI covers the same operational needs at a fraction of the build cost.

## Consequences

The CLI must delegate to the existing underlying scripts (e.g., `check-structure.mjs`) rather than reimplementing their logic, to avoid two sources of truth for the same operation. If the CLI Agent (ADR-004) doesn't keep it in sync as new modules add operational needs, the CLI degrades back into exactly the inconsistent-script problem it was built to prevent.

## Future Impact

Every new V2/V3 module should be expected to add its own CLI command(s) through this same namespace and convention, not introduce a separate tool or script pattern. The CLI's command list should be treated as a living, versioned contract — new commands added deliberately, existing ones not silently renamed, since contributors (including future Fellows with technical skills, per the Fellowship System) will build muscle memory around it.
