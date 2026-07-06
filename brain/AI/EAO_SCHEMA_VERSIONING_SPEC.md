# EAO Schema Versioning Specification

```
Status: Approved (Generation 2 planning). Transition Phase artifact - policy only.
Confirmed: no schemaVersion field exists anywhere in the live code as of this Transition.
Implementing the field is Phase A work, not part of this Transition.
```

## schemaVersion

A single integer, intended to be present on every `compute*()` return object. Starts at `1` for the shape already shipped in Generation 1 (the 12-field Canonical Action Model documented in `EAO_CANONICAL_ACTION_MODEL_SPEC.md`).

## Compatibility Policy

| Change type | Definition | Version bump? |
|---|---|---|
| **Additive** | New field, new category, new risk domain, new pipeline | No |
| **Behavioral** | Existing field/category shape unchanged, but the logic producing its values changes materially | No version bump required, but a mandatory changelog entry |
| **Breaking** | Field/category removed, renamed, or retyped; a stated invariant no longer holds | Yes, mandatory |

## Migration Policy

Every breaking change ships with:
1. A documented migration note alongside the version bump.
2. Every existing consumer updated in the same change.
3. A deprecation overlap window (per `EAO_CATEGORY_REGISTRY.md`/`EAO_RISK_DOMAIN_REGISTRY.md`'s deprecation policies) where feasible - never a same-day silent replacement.

## Validation

Schema governance is only real once the automated schema-validation layer (Fitness Function 5, `EAO_GEN2_GOVERNANCE_FRAMEWORK.md` Section 9) actually runs on every change - this document defines the policy; enforcement is a later Generation 2 milestone.

## Status at Transition

- `schemaVersion` field: not yet implemented in code (Phase A).
- Compatibility policy: documented here, not yet enforced by any automated mechanism.
- This specification itself has no version - it is the first statement of the policy.

## References

`brain/AI/EAO_CANONICAL_ACTION_MODEL_SPEC.md`; `brain/AI/EAO_GEN2_GOVERNANCE_FRAMEWORK.md` Section 4, Section 9

## Related Documents

`EAO_GEN2_INDEX.md` · `EAO_CATEGORY_REGISTRY.md` · `EAO_RISK_DOMAIN_REGISTRY.md`
