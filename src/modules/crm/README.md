# CRM

Foundation Build Order Step 5, MVP module #8. Staff-facing relationship management. AI Features: None — deliberately (governance/accountability tool).

## Integration

`relationship.ts`/`donor.ts` reference real `domain/organization` and `domain/payment` records — never duplicated. `disclosure.ts` writes real `domain/audit-log` entries and structurally enforces "no activation without an approved disclosure." `membership-integration.ts` confirms a Membership institutional profile and a CRM partnership share the same real `Organization` — the module's documented dependency on Membership System, added during the MVP Architectural Review.

## Status

Relationship records, conflict-of-interest disclosure review, activation gating, funding disclosure publication, and donor giving history implemented and tested.
