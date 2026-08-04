# Module: Dashboard

## Incremental implementation — self-facing payments, 2026-08-04

The private Dashboard now reads the canonical `Payment` table through an
allowlisted query constrained by the session actor's `personId`. It presents
only amount, currency, purpose, status, creation time, and settlement time.
Provider references and payer identifiers are excluded at the data-access
boundary; records belonging to another person are covered by regression tests
and do not enter the response.

The DE/EN/FA interface renders all four canonical payment states with
locale-aware currency and date formatting. This completes the existing
Payments/Notifications view item without changing Payment ownership, creating
a mutation path, activating a provider, or adding a migration.

## Purpose

Provide one protected, self-facing account overview without flattening module
authority or exposing internal administration. The public-facing Dashboard is
a composition layer; it does not own Membership, consent, Events,
notifications, identity, or authorization state.

## Canonical authority

- ADR-002: canonical Person, ConsentRecord, Notification, and AuditLog entities.
- ADR-027: session identity and shared capability authorization.
- ADR-034: Member Profile visibility and read-only self-service.
- ADR-035 is absent: consent withdrawal/mutation is therefore not activated.
- Existing module boundaries remain authoritative for Membership and Events.

## Current implementation

- `src/application/dashboard.ts` builds the self-only projection.
- `src/app/api/dashboard/route.ts` exposes a dynamic private `GET`.
- `src/app/[locale]/dashboard/page.tsx` and
  `src/components/platform/DashboardClient.tsx` provide the localized
  DE/EN/FA interface.
- `src/i18n/dashboard.ts` contains complete localized copy.
- `src/components/site/AccountControl.tsx` links authenticated users to the
  Dashboard; the existing Profile route remains available.

The repository's earlier `src/modules/dashboard` package remains intact. It
owns declarative dashboard manifests, preferences, and impact-evidence
capabilities. The self-facing application projection is an integration
consumer and does not duplicate that domain package.

## Data and privacy boundary

The application accepts no person identifier. It derives the actor from the
verified session, calls the existing Member Profile self-service, and filters
ConsentRecord, Payment, Registration, and Notification queries by
`actor.personId`. Event details are joined only for those registrations.
Internal review records, Governance data, other people's data, and raw
authorization grants are not returned.

The API sends `Cache-Control: private, no-store, max-age=0`, `Vary: Cookie`,
and the shared server-generated `X-Request-ID`. It returns `401` for an
anonymous session and `503` when the protected runtime is not configured.

## Authorization and actions

Profile viewing is self-only. Membership application is offered only when no
membership exists. Event navigation is offered only when a current
`events.register` capability passes the shared authorization evaluator.
Consent receipts are read-only; no withdrawal UI or endpoint is inferred.

## Verification

Focused application, route, and response-state tests pass 3 files / 7 tests.
The PGlite test proves another person's consent, payments, registrations,
events, and notifications do not enter the response, and proves payment
provider references are excluded. The full serial suite passes 53 files / 253
tests. Structure, lint, typecheck, `git diff --check`, `db:check`,
`db:check:fresh` (14 migrations / 55 tables), and the 105-page Production
build pass.

Production-mode browser checks cover DE/EN/FA page metadata, Persian RTL,
noindex/nofollow, 375px-safe layout, and the truthful unavailable state when a
local protected runtime is absent.

## Current status

**LOCALLY_VERIFIED, NOT YET PUSHED OR DEPLOYED** for the payment increment. No
migration was introduced. The existing Dashboard is deployed; authenticated
Production verification remains blocked by the Auth0 callback mismatch.

## Do not redo

Do not replace the existing Member Profile, expose caller-selected people or
raw grants, duplicate module persistence, or add consent mutation without an
accepted authority decision.
