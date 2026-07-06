# EAO Generation 2 Architecture Governance Framework

```
Status: Approved (Generation 2 planning). Transition Phase artifact - persisted verbatim
from the approved planning conversation, including its Fitness Functions and Governance
Exceptions extension (originally reviewed as a separate refinement pass, folded in here
per the "introduce no new architecture" rule rather than created as a separate artifact type).
```

## 1. Architecture Governance Principles

| Principle | Intent | Rationale | Enforcement Mechanism | Example |
|---|---|---|---|---|
| Single source of truth | Every fact about the repository is computed in exactly one place | Confirmed: `computeDependencyGraph()` is the sole owner of dependency-graph facts | Composition validation; code review checklist | `project-health.mjs` never re-scans for broken links |
| Extend at the source | New signals are added where the underlying data already gets read | Followed for all 8 Gen1 sprints (`mvpStatusFindings`, `danglingAdrReferences`, `riskDomain` all landed at their owning file) | Architecture Review stage | MVP Status extraction added to `dependency-map.mjs`'s existing walk |
| Composition over duplication | New pipelines import and reuse; they do not reimplement | Confirmed gap: `walkScripts()` duplicates `findMarkdownFiles()`'s inner walker | Composition validation | All 4 second-order pipelines import `computeProjectHealth()` |
| Explicit ownership | Every field, category, and registry has one named owner | Confirmed gap: `GOVERNANCE_DOCS`/`CORE_DOCS` are two unowned, uncoordinated lists | Ownership validation; Canonical Model/Registry Governance | Category Registry requires an `owner` field per entry |
| Traceability | Every conclusion is traceable back to the canonical evidence that produced it | Practiced consistently via "Evidence References" sections | Schema validation requiring `evidence` on every action | Risk Analysis's Mitigation Recommendations cite a `riskId` back to its action |
| Deterministic behavior | The same repository state always produces the same output | Verified by repeated regression re-runs, never formally tested as a standing guarantee | Regression/golden-output testing | Re-running `eao:dependency-map` twice produces identical counts |
| Backward compatibility | Existing consumers keep working across additive changes | Category-string hidden coupling is a confirmed real risk to this principle | Schema Governance; Registry deprecation policy | Adding `mvp-implementation-pending` required zero changes to `roadmap.mjs`/`risk-analysis.mjs` |
| Disclosure over fabrication | Every heuristic, proxy, or limitation is stated in its own output | The most consistently well-executed principle in Gen1 | Documentation validation; required in Pipeline Governance | Release Readiness's Score states it is "not a fabricated metric" |

## 2. Canonical Model Governance

- **Ownership:** the Canonical Action Model is owned by whoever maintains `project-health.mjs` - an architectural role, not a personal title.
- **Who may extend it:** any author may propose an addition; only the canonical-model owner implements it inside `project-health.mjs`.
- **Who may modify existing fields:** only the canonical-model owner, per the compatibility policy in Section 4.
- **Who approves breaking changes:** the Human Approval Authority (the standing role under `EAO_PERMISSION_MODEL.md`).
- **What requires an ADR:** breaking changes to any field's type/removal; changes to a stated invariant.
- **What requires only documentation:** additive fields, presentation-field wording changes, new categories fitting the existing registry extension policy.

**Formal lifecycle:** Proposed -> Reviewed (duplicate-check) -> classified (additive/breaking) -> additive: documented + shipped, OR breaking: ADR + migration plan -> implemented -> validated -> versioned.

## 3. Registry Governance

| | Category Registry | Risk Domain Registry | Future Registries |
|---|---|---|---|
| Ownership | The pipeline that detects that category's findings | Architecture-level, cross-cutting | Must state ownership at creation time |
| Approval workflow | Lightweight: complete registry entry required | Stricter: must demonstrate no existing domain fits | Must define its own approval workflow before first use |
| Extension policy | Non-breaking by default | Review required before addition | Same non-breaking-by-default principle unless schema-critical |
| Deprecation policy | Never silent removal; overlap window + replacement id | Same pattern, more conservative given downstream grouping | Must inherit the same pattern |
| Review process | Confirm no semantic overlap with an existing category | Confirm no semantic overlap with an existing domain | Same overlap-check discipline required |

## 4. Schema Governance

| Change type | Definition | Version bump? |
|---|---|---|
| Additive | New field, new category, new domain, new pipeline | No |
| Behavioral | Same shape, but the logic producing values changes materially | No bump required, but a mandatory changelog entry |
| Breaking | Field/category removed, renamed, or retyped; a stated invariant no longer holds | Yes, mandatory |

**Migration policy:** every breaking change ships with a documented migration note, every existing consumer updated in the same change, and a deprecation overlap window where feasible.

**Validation:** schema governance is only real if the automated schema-validation layer actually runs on every change.

## 5. Pipeline Governance

**Pipeline author responsibilities:** verify no existing pipeline/lib already computes the needed data; export `compute*()` and `render*Markdown()` separately; disclose every heuristic in the rendered output; reference Category/Risk-Domain Registries by identifier, never raw strings, once they exist; run the full existing pipeline suite before declaring work complete.

**Pipeline reviewer responsibilities:** verify composition claims are literally true; verify canonical-model/registry touches went through their governance process; verify no raw category-string comparison was introduced; verify evidence/count consistency.

**Architectural acceptance criteria - every new pipeline must satisfy before merge:**
1. Performs no repository scan duplicating an existing pipeline's already-computed data.
2. Exports both `compute*()` and `render*Markdown()`.
3. Writes to no file.
4. Declares its minimum required `schemaVersion` once versioning exists.
5. Passes all Quality Gates (Section 7).

## 6. Architectural Decision Governance

| Change | ADR Status |
|---|---|
| New canonical field (breaking type/removal) | Required |
| Registry structural change (new registry type) | Required |
| Ownership change | Required |
| Schema breaking change | Required |
| Architectural layering change | Required |
| Plugin model structural change | Required |
| New risk domain addition | Recommended |
| Behavioral change to an existing heuristic with material output impact | Recommended |
| First pipeline composing 3+ upstream pipelines | Recommended |
| New category addition following the established extension policy | Unnecessary |
| New pipeline following the established composition pattern | Unnecessary |
| Presentation-field wording change | Unnecessary |
| Additive canonical field | Unnecessary |

## 7. Quality Gates

Mandatory before merge - no pipeline or canonical-model change bypasses these:
1. Schema validation - every canonical action passes the required-field/type check.
2. Regression validation - full pipeline suite run; any output change is zero or explicitly intentional.
3. Contract validation - every category touched is checked against its registered valid consumers.
4. Composition validation - confirms no new/duplicated repository scanning was introduced.
5. Ownership validation - confirms the change was reviewed by the correct owner.
6. Documentation validation - purpose/composition-sources/output-sections documented; any registry/schema touch reflected in its spec.

## 8. Governance Lifecycle

```
Proposal -> Architecture Review -> ADR (if required) -> Implementation -> Validation
(Quality Gates SS7 + Fitness Functions, Section 9 below) -> Approval (Human Approval
Authority) -> Release -> Post-release Review (Exception Governance, Section 10, activates here if needed)
```

## 9. Architectural Fitness Functions

Fitness Functions are the continuous, standing validation layer - distinct from Quality Gates (Section 7), which are a per-change, pre-merge checklist.

| # | Fitness Function | Objective | Measurable Rule | Validation Mechanism | Failure Condition | Severity | Blocks Merge | Human Approval Required |
|---|---|---|---|---|---|---|---|---|
| 1 | Single Source of Truth | No repository fact computed independently in more than one place | Exactly one producer function per data point | Static scan for duplicate directory-walk/file-read patterns | Two functions independently implement the same scan | High | Yes | No (detect) / Yes (approve fix scope) |
| 2 | Extend at the Source | New signals added where data is already read | Any field in downstream output traces to an imported `compute*()` | Composition validation; flag non-`lib`/non-first-order files calling `fs.*` scans | A downstream pipeline scans the repository itself | High | Yes | Yes (for any exception) |
| 3 | Composition over Duplication | Reuse existing compute functions | Import graph matches the documented dependency chain | Composition validation gate; manual diff review | Near-identical logic in two files | Medium-High | Yes | No (detect) / Yes (exception) |
| 4 | Explicit Ownership | Every field/category/registry/pipeline has one named owner | 1:1 correspondence between entries and stated owners | Documentation validation gate | An entry ships with no owner | Medium | Yes | No |
| 5 | Canonical Model Integrity | Every emitted action conforms fully to its schema | 100% of `priorityActions` pass schema validation | Automated schema validation on every `computeProjectHealth()` call | Missing/malformed field, count/evidence/riskDomain mismatch | Critical | Yes | No (detect) / Yes (schema change) |
| 6 | Registry Integrity | Every category/domain referenced exists in its registry | Set of used identifiers equals set of registered identifiers | Contract validation gate | A category string used in code is absent from the registry | Critical | Yes | No (detect) / Yes (registry change) |
| 7 | Schema Compatibility | Canonical-model changes correctly classified and versioned | Every touch declares its classification; breaking changes bump `schemaVersion` | Pipeline compatibility testing | A breaking change ships without a version bump | High | Yes | Yes (breaking changes require an ADR) |
| 8 | Deterministic Output | Identical repository state produces identical output | Two consecutive runs produce byte-identical output | Golden-output/regression + repeatability test | Unexplained nondeterminism (scoped to exclude declared timestamp fields) | Medium | Yes | No |
| 9 | Read-only Execution | No pipeline writes to, deletes, or mutates repository files | Zero write/mutate calls anywhere under `scripts/eao/**` | Static grep-based check | Any matching write/mutate call found | Critical | Yes, unconditionally | N/A - no exception path exists for this function |
| 10 | Traceability | Every conclusion is traceable to specific evidence | Every reported entry carries a non-empty evidence reference | Schema validation + documentation-validation gate | A finding reported with no underlying evidence | Medium-High | Yes | No |

## 10. Governance Exceptions Policy

**Temporary Exception** (a fitness function fails, cause understood, blocking is worse than a tracked deviation): justification required in writing; approved by Human Approval Authority; maximum lifetime tied to an explicit commit/milestone, never open-ended; reviewed at every subsequent Post-release Review; recorded in an exceptions ledger (fitness-function id, justification, owner, expiration); automatically escalates to a hard blocking failure if unresolved at expiration - silent extension is forbidden; if unresolved, the change is reverted or re-justified through fresh approval.

**Emergency Exception** (urgent fix ahead of full review): EAO is read-only advisory tooling, not a live service - "emergency" is proportionally lower-severity than an on-call incident; justification permissible after the fact but within a short, stated grace period; Human Approval Authority sign-off still required, retroactively if needed; shortest lifetime of all exception types - must convert to a proper fix or downgrade to a Temporary Exception within one review cycle; favors the most reversible fix available.

**Permanent architectural change (not an exception):** if a Fitness Function itself needs to change, this requires the full normal Architecture Governance process (Section 8) - never handled as an exception. **No exception may become permanent by repeated renewal.**

## References

`brain/AI/EAO_GEN2_CONSTITUTIONAL_ARCHITECTURE.md`; `brain/AI/EAO_CANONICAL_ACTION_MODEL_SPEC.md`; `brain/AI/EAO_CATEGORY_REGISTRY.md`; `brain/AI/EAO_RISK_DOMAIN_REGISTRY.md`

## Related Documents

`EAO_GEN2_INDEX.md` · `EAO_GEN2_READINESS_REVIEW.md`
