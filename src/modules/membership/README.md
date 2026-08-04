# Membership

Foundation Build Order Step 5, MVP module #5.

## Purpose

Recurring individual/institutional support relationships — registration through the full exit/deactivation lifecycle.

## Integration with other modules

- **`pledge.ts`** creates real `domain/payment` transactions for renewals — no parallel transaction record.
- **`institutional.ts`** references real `domain/organization` records.
- **`community-integration.ts`** reviews Membership status against real Community ladder standing.
- **`lifecycle.ts`** writes a real `domain/audit-log` entry on every status transition.
- **`view.ts`** exposes `MembershipJourneyView`, a stable presentation model matching `MEMBER_PROFILE.md`'s own documented display fields — a future frontend consumes this, not raw domain objects.

## Authentication/Identity boundary (`ADR-027`)

`auth-extension-point.ts` preserves the Membership-facing actor contract, while
the shared implementation lives in `src/auth/`. ADR-027 is accepted and the
OIDC/session layer produces the session-derived `personId` consumed by
Membership application services. Membership does not define or own
Authentication and must not accept a caller-selected actor instead.

## Lifecycle and tier taxonomy

Both taken directly from `docs/source/projects/MEMBER_PROFILE.md`, which explicitly flagged them as gaps for this module to define. No new terminology invented.

## Status

Full lifecycle, pledges/renewals, institutional profiles, benefit grants, Community-standing review, and the journey view model are implemented and tested. Dashboard/CRM integration deferred until those modules exist.
