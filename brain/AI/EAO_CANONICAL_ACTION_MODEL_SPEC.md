# EAO Canonical Action Model Specification

```
Status: Approved (Generation 2 planning). Transition Phase artifact.
Verified directly against live code (scripts/eao/project-health.mjs, buildPriorityActions())
on the date of this transition - the 12 fields below are confirmed, not assumed.
```

The Canonical Action Model is the single contract through which findings cross pipeline boundaries. It is produced exclusively by `buildPriorityActions()` in `project-health.mjs` and consumed by `roadmap.mjs`, `risk-analysis.mjs`, `adr-review.mjs`, and `release-readiness.mjs`.

## Field Specification

| Field | Type | Req? | Purpose | Owner | Producer | Consumers | Field Class |
|---|---|---|---|---|---|---|---|
| `priority` | int | Yes | Display/declaration order only | `project-health.mjs` | `buildPriorityActions` | Project Health render (order) | Presentation |
| `action` | string | Yes | Human-readable label | `project-health.mjs` | `buildPriorityActions` | All renderers (display) | Presentation |
| `count` | int | Yes | Magnitude of finding | `project-health.mjs` | `buildPriorityActions` | Roadmap, Risk Analysis, Release Readiness | Derived (should equal a function of `evidence`; currently hand-authored in parallel - see Known Issues) |
| `severity` | `"critical"` \| `"warning"` | Yes | Authoritative severity signal | `project-health.mjs` | `buildPriorityActions` | Roadmap (blocking/risk), Risk Analysis (risk level), Release Readiness (gate blocking) | Immutable |
| `category` | string (registry-backed) | Yes | Machine-readable finding-type identifier | `project-health.mjs` | `buildPriorityActions`, referencing `EAO_CATEGORY_REGISTRY.md` | Roadmap, ADR Review, Release Readiness | Immutable |
| `riskDomain` | string (registry-backed) | Yes | Coarse grouping bucket | `project-health.mjs` | `buildPriorityActions`; should be derived from `category` via the registry - see Known Issues | Risk Analysis (grouping) | Derived (currently hand-authored in parallel with `category`) |
| `sourcePipeline` | string | Yes | Which pipeline produced the underlying finding | `project-health.mjs` | `buildPriorityActions` | Risk Analysis (display), traceability | Presentation-adjacent (not currently branched on by any consumer) |
| `affectsArchitecture` | boolean | Yes | True only if the finding touches the dependency graph's structural layer | `project-health.mjs` | `buildPriorityActions` | Risk Analysis only (confirmed - not read by ADR Review or Release Readiness) | Immutable |
| `governanceSensitive` | boolean | Yes | True if the finding touches governance documents/process | `project-health.mjs` | `buildPriorityActions` | Roadmap, Risk Analysis | Immutable |
| `autoFixable` | boolean | Yes | True only if a deterministic fix is derivable from the evidence itself | `project-health.mjs` | `buildPriorityActions` | Risk Analysis only (confirmed - Release Readiness does not currently read this field) | Immutable |
| `humanApprovalRequired` | boolean | Yes | Approval gate marker | `project-health.mjs` | `buildPriorityActions` | Displayed by all 4 downstream renderers | Always `true`, no exceptions - see Open Question below |
| `evidence` | array \| object | Yes | Raw originating records, for traceability | The originating pipeline (not Project Health) - see Ownership Note | `buildPriorityActions` (attaches, doesn't create) | All 4 downstream pipelines | Structural data |

**Field-class distinction:**
- **Immutable:** `severity`, `category`, `riskDomain` (once derivation is fixed), `affectsArchitecture`, `governanceSensitive`, `autoFixable`, `humanApprovalRequired`.
- **Derived:** `count`, `riskDomain` - both are currently hand-authored in parallel with data they should be computed from.
- **Presentation:** `priority`, `action` - safe to change freely.

**Ownership note:** `evidence`'s shape is owned by whichever pipeline originates the finding (e.g. `dependency-map.mjs` owns what a broken-reference record looks like); `project-health.mjs` only owns the act of attaching that evidence to a canonical action.

## Known Issues (disclosed, not yet remediated - Phase A scope)

1. **`count` is independently authored, not derived.** Nothing today enforces `count === evidence.length` (or an equivalent derivation for object-shaped evidence). A future change to an evidence array without updating `count` would silently desynchronize them.
2. **`riskDomain` is independently authored per action, not derived from `category`.** The category-to-domain mapping is implicitly repeated at each of the 8 call sites in `buildPriorityActions` rather than declared once in a registry.
3. **`evidence` is inconsistently typed.** 6 of 8 categories use an array; 2 (`governance-connectivity`, `documentation-formatting-drift`) use a plain object. This forced an `Array.isArray(evidence) ? … : Object.keys(evidence)` workaround, duplicated independently in `risk-analysis.mjs` and `release-readiness.mjs`.
4. **`humanApprovalRequired` never varies** - it is always `true` by architectural mandate. Open question for Phase A/Gen2 implementation: model this as a per-action field (as today) or as a stated global invariant instead of repeated data.

None of these are corrected in this document - correcting them is Phase A implementation work (Generation 2 Transition Plan Section 7), not Transition-phase documentation.

## Compatibility Requirements

Immutable and Derived fields require a `schemaVersion` bump to change type or remove (see `EAO_SCHEMA_VERSIONING_SPEC.md`). Presentation fields do not.

## References

`scripts/eao/project-health.mjs` (`buildPriorityActions`); `brain/AI/EAO_GEN2_CONSTITUTIONAL_ARCHITECTURE.md`; `brain/AI/EAO_CATEGORY_REGISTRY.md`; `brain/AI/EAO_RISK_DOMAIN_REGISTRY.md`

## Related Documents

`EAO_GEN2_INDEX.md` · `EAO_SCHEMA_VERSIONING_SPEC.md`
