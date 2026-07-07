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

`auth-extension-point.ts` defines `AuthenticatedActor`/`ActorResolver` — interfaces only. This module does not define, implement, or own Authentication; `ADR-027` remains unresolved. A future API/session layer would implement `ActorResolver` to produce the `personId` every function here already accepts.

## Lifecycle and tier taxonomy

Both taken directly from `docs/source/projects/MEMBER_PROFILE.md`, which explicitly flagged them as gaps for this module to define. No new terminology invented.

## Status

Full lifecycle, pledges/renewals, institutional profiles, benefit grants, Community-standing review, and the journey view model are implemented and tested. Dashboard/CRM integration deferred until those modules exist.
