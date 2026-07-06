# EAO Generation 2 Architecture Index

```
Status: Transition Phase artifact. Single navigation entry point for all Generation 2
constitutional documentation. Generation 2 remains in the Transition Phase - Phase A
implementation has not begun.
```

## Purpose

This document is the entry point for anyone approaching EAO's Generation 2 architecture for the first time. It exists because the Generation 1 execution architecture (`EAO_ARCHITECTURE.md` and its 16 companion documents) is a separate, already-implemented layer; Generation 2 is the constitutional/governance layer built on top of it, persisted here as of the Transition Phase.

## Reading Order

1. **`EAO_GEN2_CONSTITUTIONAL_ARCHITECTURE.md`** - start here. Defines the constitutional layers, dependency model, ownership model, invariants, and maturity model.
2. **`EAO_GEN2_GOVERNANCE_FRAMEWORK.md`** - the process: governance principles, canonical model/registry/schema governance, pipeline governance, ADR criteria, quality gates, the governance lifecycle, Fitness Functions, and the Exceptions Policy.
3. **`EAO_CANONICAL_ACTION_MODEL_SPEC.md`** - the formal, code-verified specification of the 12-field Canonical Action Model produced by `project-health.mjs`.
4. **`EAO_CATEGORY_REGISTRY.md`** - the 8 registered categories, extracted from live code.
5. **`EAO_RISK_DOMAIN_REGISTRY.md`** - the 6 registered risk domains, extracted from live code.
6. **`EAO_SCHEMA_VERSIONING_SPEC.md`** - the `schemaVersion` policy (not yet implemented in code).
7. **`EAO_GEN2_READINESS_REVIEW.md`** - the historical GO WITH CONDITIONS decision this Transition resolves.
8. **`architecture/adr/ADR-025-eao-generation-2-constitutional-architecture-adoption.md`** - the formal adoption decision, establishing documents 1-6 above as the governing authority for future EAO architectural work.
9. **`EAO_PHASE_A_BACKLOG.md`** - registered architectural improvement requests for Phase A, starting with BACKLOG-001 (Scope-aware Technical Debt Detection).

## Current State

**Generation 2 is in the Transition Phase, pending formal closure.** All 6 constitutional/governance documents above are persisted repository artifacts, closing the one blocking condition identified in the Readiness Review. Their adoption is formalized by `ADR-025`, and one architectural improvement discovered during Transition execution is registered in `EAO_PHASE_A_BACKLOG.md`. Phase A implementation (Canonical Model code refactor, registry wiring, `schemaVersion` field addition, and BACKLOG-001) has **not** begun and requires separate, explicit approval.

**No code under `scripts/eao/` was changed to produce this Transition.** Every document above is a faithful transcription of already-approved design, verified against live code where the design describes existing behavior (the Canonical Action Model's 12 fields, the 8 categories, the 6 domains) and marked as not-yet-implemented where it describes future work (`schemaVersion`, registry-referencing code, Fitness Function automation).

## Relationship to Generation 1 Documentation

Generation 1's execution architecture remains documented in `EAO_ARCHITECTURE.md` and its existing companions (`EAO_AGENT_REGISTRY.md`, `EAO_SKILL_LIBRARY.md`, `EAO_PLUGIN_MCP_ARCHITECTURE.md`, `EAO_PERMISSION_MODEL.md`, `EAO_REPORTING_TEMPLATES.md`, `EAO_DASHBOARD_SPEC.md`, and the runtime-layer documents) — none of that documentation is superseded or altered by Generation 2. Generation 2 governs *how* that architecture evolves; it does not redescribe what already exists.

## References

All 9 Generation 2 documents listed above (6 constitutional/governance documents, `ADR-025`, and `EAO_PHASE_A_BACKLOG.md`); `brain/AI/EAO_ARCHITECTURE.md`

## Related Documents

`EAO_GEN2_CONSTITUTIONAL_ARCHITECTURE.md` · `EAO_GEN2_GOVERNANCE_FRAMEWORK.md` · `EAO_CANONICAL_ACTION_MODEL_SPEC.md` · `EAO_CATEGORY_REGISTRY.md` · `EAO_RISK_DOMAIN_REGISTRY.md` · `EAO_SCHEMA_VERSIONING_SPEC.md` · `EAO_GEN2_READINESS_REVIEW.md` · `EAO_PHASE_A_BACKLOG.md`
