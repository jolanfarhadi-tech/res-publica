# EAO Category Registry

```
Status: Approved (Generation 2 planning). Transition Phase artifact.
Extracted verbatim from the live code in scripts/eao/project-health.mjs
(buildPriorityActions()) - all 8 categories, not only the subset currently
active against today's repository state.
```

Replaces free-form category strings with a formal registry. Referenced by `EAO_CANONICAL_ACTION_MODEL_SPEC.md`'s `category` field.

## Registered Categories

| id | Meaning | Owner (detecting pipeline) | Bound `riskDomain` | Valid Consumers | Severity when produced |
|---|---|---|---|---|---|
| `terminology-drift` | A retired term reappears live, not in a disclosed historical context | `terminology-drift.mjs` | Terminology | Roadmap, Risk Analysis | critical |
| `governance-connectivity` | A governance document is orphaned or has a broken reference | `dependency-map.mjs` (via `project-health.mjs`'s governance proxy) | Governance | Roadmap, Risk Analysis, Release Readiness | critical |
| `broken-reference` | A genuine (non-scope-artifact) broken Related Documents/References entry | `dependency-map.mjs` | Documentation | Roadmap, Risk Analysis, Release Readiness | critical |
| `broken-link` | A broken Markdown link | `broken-links.mjs` | Documentation | Roadmap, Risk Analysis, Release Readiness | critical |
| `unreferenced-core-document` | A LOCKED/foundational document with zero inbound references | `dependency-map.mjs` | Architecture | Roadmap, Risk Analysis, ADR Review | critical |
| `documentation-formatting-drift` | Heading-depth drift or non-backtick filename formatting | `dependency-map.mjs` | Documentation | Roadmap, Risk Analysis | warning |
| `technical-debt` | Outstanding TODO markers | `project-health.mjs` | Technical Debt | Roadmap, Risk Analysis | warning |
| `mvp-implementation-pending` | An MVP-critical specification's implementation status is unconfirmed | `project-health.mjs` (via `dependency-map.mjs`'s `mvpStatusFindings`) | Release | Roadmap, Risk Analysis, Release Readiness | critical |

**Confirmed at Transition:** only 5 of the 8 categories are currently active against this repository's present state (`terminology-drift`, `broken-link`, and `unreferenced-core-document` are defined but not currently triggered). All 8 are registered here, since the registry describes what the model *can* produce, not only what a single snapshot happens to show.

## Deprecation Strategy

A deprecated category is never silently removed. It continues to be emitted (if still occurring) for at least one full `schemaVersion` cycle, with consumers expected to handle both the old and new `id` during the overlap window. Removal only after the overlap window closes, and only as part of a version bump.

## Extension Policy

Adding a new category is non-breaking by default - existing consumers simply don't match an unrecognized category. A new entry requires: a registered `owner`, a bound `riskDomain` (existing or newly justified per `EAO_RISK_DOMAIN_REGISTRY.md`'s policy), and - if it is expected to gate a release or drive a new report section - an explicit addition to the relevant consumer's logic in the same change, not an assumption that generic wiring will pick it up automatically.

## Known Gap (disclosed, Phase A scope)

The registry above is currently a **documentation-only extraction** - `buildPriorityActions()` still hand-writes each category string inline rather than referencing this registry. Consumers (`roadmap.mjs`, `adr-review.mjs`, `release-readiness.mjs`) still match on raw string literals. Wiring the code to this registry is Generation 2 Phase A work (Transition Plan Section 7), not part of this Transition.

## References

`scripts/eao/project-health.mjs`; `brain/AI/EAO_CANONICAL_ACTION_MODEL_SPEC.md`; `brain/AI/EAO_RISK_DOMAIN_REGISTRY.md`

## Related Documents

`EAO_GEN2_INDEX.md` · `EAO_GEN2_GOVERNANCE_FRAMEWORK.md`
