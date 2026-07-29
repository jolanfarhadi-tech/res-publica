# Module: Dashboard

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
ConsentRecord, Registration, and Notification queries by
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
The PGlite test proves another person's consent, registrations, events, and
notifications do not enter the response. The full suite passes 47 files / 226
tests. Structure, lint, typecheck, `git diff --check`, `db:check`,
`db:check:fresh` (13 migrations / 54 tables), and the 102-page Production
build pass.

Production-mode browser checks cover DE/EN/FA page metadata, Persian RTL,
noindex/nofollow, 375px-safe layout, and the truthful unavailable state when a
local protected runtime is absent.

## Current status

**LOCALLY_VERIFIED, NOT YET PUSHED OR DEPLOYED.** No migration was introduced.
Production activation remains gated by verified Auth0 callback/MFA,
authorization to apply migration 0012, and the applicable legal/operational
approvals.

## Do not redo

Do not replace the existing Member Profile, expose caller-selected people or
raw grants, duplicate module persistence, or add consent mutation without an
accepted authority decision.
