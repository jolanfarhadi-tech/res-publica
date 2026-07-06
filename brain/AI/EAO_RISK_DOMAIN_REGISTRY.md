# EAO Risk Domain Registry

```
Status: Approved (Generation 2 planning). Transition Phase artifact.
Extracted verbatim from the live code in scripts/eao/project-health.mjs
(buildPriorityActions()) - all 6 domains currently in use.
```

Formalizes the `riskDomain` concept used by the Canonical Action Model and consumed primarily by Risk Analysis's domain grouping.

## Registered Domains

| id | Meaning | Owning Categories | Relationships | Future Extensibility |
|---|---|---|---|---|
| `Terminology` | Findings about retired-term reuse | `terminology-drift` | Independent - no overlap with other domains | Non-breaking addition of further terminology-related categories |
| `Governance` | Findings touching governance documents/process | `governance-connectivity` | Overlaps intentionally with `Architecture` - `governance-connectivity` is both `governanceSensitive: true` and `affectsArchitecture: true`; this is a stated, intentional relationship, not an implicit accident | Additions require review (domains are curated) |
| `Documentation` | Findings about document quality/formatting/references | `broken-reference`, `broken-link`, `documentation-formatting-drift` | The largest domain by category count; distinct from `Architecture` (structural/foundational concerns) | Additions require review |
| `Architecture` | Findings touching the dependency graph's structural layer | `unreferenced-core-document` | Overlaps intentionally with `Governance` (see above) | Additions require review |
| `Technical Debt` | Non-blocking maintenance findings | `technical-debt` | Independent | Additions require review |
| `Release` | Findings specifically relevant to release readiness | `mvp-implementation-pending` | Independent today; conceptually adjacent to `Architecture` (MVP specs are architectural artifacts) but kept distinct since it answers a different question ("is this ready to ship" vs. "is this structurally sound") | Additions require review |

**Disclosed, not fabricated:** a `Dependency` domain was named as an illustrative example during Generation 2 planning but has never had a real category map to it - it is intentionally absent from this registry rather than included to complete a hypothetical list.

## Ownership

Architecture-level, cross-cutting - no single pipeline owns the domain set (contrast with the Category Registry, where each category is owned by its detecting pipeline). Domains are meant to stay a small, human-scannable set.

## Extension Policy

Unlike categories, new domains require review before addition: the proposer must demonstrate that no existing domain already fits, to prevent the same category-vs-domain sprawl risk this registry was designed to avoid.

## Known Gap (disclosed, Phase A scope)

As with the Category Registry, this is currently a documentation-only extraction. `buildPriorityActions()` still hand-writes each `riskDomain` value inline per action rather than deriving it from a category-to-domain lookup against this registry. Wiring the code to this registry is Phase A work.

## References

`scripts/eao/project-health.mjs`; `brain/AI/EAO_CATEGORY_REGISTRY.md`; `brain/AI/EAO_CANONICAL_ACTION_MODEL_SPEC.md`

## Related Documents

`EAO_GEN2_INDEX.md` · `EAO_GEN2_GOVERNANCE_FRAMEWORK.md`
