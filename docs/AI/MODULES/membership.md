# Module: Membership

## Incremental resource protection — 2026-08-16

The authenticated self-profile projection now consumes its own shared
PostgreSQL rate-limit scope before actor resolution and database projection.
Membership application/create policies also declare bounded JSON body sizes.
These guards do not change account/application status, consent, board decision,
MFA, exact-target authorization or atomic persistence semantics.

## Incremental Mandatory-hardening Phase-B boundary — 2026-08-16

Board approval/rejection now requires a five-minute recent-MFA session and the
decision-matching reason code. The decision and any bounded grants created by
approval share the server request ID, actor session, capability, reason and
timestamp in canonical audit evidence. Applicant/decider separation and atomic
Membership persistence are unchanged.

## Incremental implementation — protected board workspace, 2026-08-10

The bounded Operations Console adds a read side for assigned Membership
Applications without changing the application or decision services. Queue and
detail access require the existing `civic/membership.application.decide`
capability, the exact application target and MFA. Self-review is rejected;
research-readiness preferences are excluded from the board projection.

The detail presents the versioned Satzung, technical-protocol and privacy
acknowledgements, assignment validity, decision actor/timestamps and canonical
decision-audit references. Approve/reject calls the existing protected route,
so separation of duties, wallet-offer boundary, notification, verified-member
creation and AuditLog persistence remain one atomic transaction. No new
membership state, clarification workflow, suspension path or migration was
invented.

## Production update — 2026-08-10

The application protocol is committed in `326229f`, deployed in Production
commit `7d2bb07`, and persisted by the complete 19-migration/66-table chain.
Email verification activates only the account. Membership still requires the
separate application and an exact-scope, genuine-MFA, different-actor board
decision. The old immediate-create route remains a non-bypassing `410`.

The repeatable Production check validates Auth0 signup initiation and private
self-service reads without mutating Membership. It stops explicitly when a
controlled synthetic session or genuine MFA is unavailable; it introduces no
authentication bypass and does not claim an unperformed board E2E.

## Incremental application protocol — 2026-08-04 (subsequently committed and deployed)

`src/application/membership-applications.ts` and
`/api/membership/applications` implement the proposed ADR-037 boundary. New
applicants are not inserted into `members`; board approval requires MFA,
`civic/membership.application.decide`, the exact application target, and a
reviewer other than the applicant. The former `/api/membership/create` path now
returns `410 membership_application_required`, preventing immediate-membership
bypass while preserving an explicit compatibility response.

Research readiness is optional. Project-specific consent and eligibility use
separate records and withdrawal does not mutate Membership. Approval offers—but
does not activate—a pseudonymous research wallet. ADR-037/038 and public legal
wording require approval before Production activation.

## Incremental implementation — request protection, 2026-07-29

`POST /api/membership/create` now receives a server-generated request ID and
consumes the shared PostgreSQL rate limit before actor resolution or
persistence. The policy permits five attempts per one-hour window per
pseudonymized client address. Rate limiting does not move or duplicate
Membership logic: session-derived authorization, exactly two versioned profile
consents, Membership creation, and canonical audit evidence remain atomic in
the existing application service.

## Purpose

Recurring individual/institutional support relationships — registration through the full exit/deactivation lifecycle. Evidence: `src/modules/membership/README.md` (read in full, this session).

## Canonical authority

One of the 9 ratified MVP modules (`brain/ROADMAP.md` build order). Lifecycle and tier taxonomy taken directly from `docs/source/projects/MEMBER_PROFILE.md`, which flagged them as gaps for this module to define (per this module's own README, read in full). ADR-027 (identity/auth) governs the `AuthenticatedActor`/`ActorResolver` extension point this module declares but does not itself implement.

## Current implementation

**Frontend presentation update, 2026-07-24:** the existing application form and
API remain unchanged. The localized page now frames membership as sustained
civic participation and explicitly rejects rank/reward framing before the
existing protected form.

`src/modules/membership/{auth-extension-point.ts, benefits.ts, community-integration.ts, institutional.ts, lifecycle.ts, manifest.ts, pledge.ts, types.ts, view.ts, membership.test.ts, README.md}` (directory listing, this session). Application layer: `src/application/membership.ts`. Committed via `2194b7e` (M1 persistence), `a9fac9c` (M2 module bootstrap) — both ≤ `origin/main` tip `7025e6f`.
Per the README (read in full), its own stated status: *"Full lifecycle, pledges/renewals, institutional profiles, benefit grants, Community-standing review, and the journey view model are implemented and tested. Dashboard/CRM integration deferred until those modules exist."*

## Data and persistence

`src/persistence/module-schema.ts` (grepped this session): `members` (L15), `membershipStatusChanges` (L34), `recurringPledges` (L47), `institutionalSupporterProfiles` (L57), `membershipBenefitGrants` (L63). Migration coverage: `drizzle/0001_m1-membership-events.sql`, `drizzle/0006_m2-membership-uniqueness.sql` (filenames confirmed; content not read this session).

## Authorization and trust boundaries

**Important documentation-drift caveat (see `WARNINGS_AND_DEBT.md` WARN-004):** this module's own committed README states: *"`auth-extension-point.ts` defines `AuthenticatedActor`/`ActorResolver` — interfaces only. This module does not define, implement, or own Authentication; `ADR-027` remains unresolved."* This was accurate when written (commit `9f9ec5f`, 2026-07-07). **As of this compilation, ADR-027 is Accepted and `src/auth/` has committed source and tests implementing OIDC, sessions, and authorization** (see `MODULES/identity-auth.md`; tests exist but were not run this session) — the README line is stale. Do not conclude authentication is unimplemented from this README alone.

## Public interfaces

`src/app/api/membership/{create/route.ts, profile/route.ts (+route.test.ts)}` — shared with the Member Profile module (see `MODULES/member-profile.md`) for the `profile` route specifically.

## Verification

Tests confirmed to exist: `src/modules/membership/membership.test.ts`. **Not run this session.**

## Decisions and rejected approaches

- `pledge.ts` creates real `domain/payment` transactions for renewals — "no parallel transaction record" (README, direct quote) — a reuse decision, not a new payment mechanism.
- `institutional.ts` references real `domain/organization` records, not a duplicate concept.
- Lifecycle explicitly excludes "Deleted" as a state — `REGISTERED → VERIFIED → ACTIVE → INACTIVE/PAUSED/SELF-ISOLATED/WITHDRAWN/RETIRED/SUSPENDED/TERMINATED`, per both this module's own implementation and `docs/source/projects/MEMBER_PROFILE.md`'s person-centered-not-account-centered principle.
- `view.ts` exposes `MembershipJourneyView`, explicitly designed to match `MEMBER_PROFILE.md`'s documented display fields — "a future frontend consumes this, not raw domain objects" (README).

## Current status

**REMOTE_VERIFIED**, **IMPLEMENTED_NOT_REVERIFIED**. Dashboard/CRM integration explicitly deferred per the module's own README (not independently re-checked this session).

## Open work

Dashboard/CRM integration — deferred per the module's own README. The stale auth-boundary README line (WARN-004) should be corrected but is a documentation task, not a code task.

## Do not redo

Do not re-implement the exit/deactivation lifecycle, pledge/renewal handling, institutional profiles, benefit grants, or the `MembershipJourneyView` presentation model — all implemented and tested per the module's own committed self-assessment. Do not re-litigate whether "Deleted" should be a lifecycle state — explicitly and deliberately excluded, twice-documented (this module and `MEMBER_PROFILE.md`).

## Evidence index

- `src/modules/membership/README.md` (full read, this session)
- `src/modules/membership/{auth-extension-point,benefits,community-integration,institutional,lifecycle,pledge,types,view}.ts` (directory listing; not individually read line-by-line)
- `src/application/membership.ts`
- `src/persistence/module-schema.ts:15,34,47,57,63`
- `drizzle/0001_m1-membership-events.sql`, `drizzle/0006_m2-membership-uniqueness.sql`
- commits `2194b7e`, `a9fac9c`
- `architecture/adr/ADR-027-identity-authentication-authorization.md` (for the drift finding)
- test: `membership.test.ts`

## Incremental membership-application boundary — 2026-08-04

New applicants now have a separate verified Auth0 account and Membership
Application. Email verification never grants membership. The MFA-protected board
decision uses an exact application capability and different actor; approval,
verified Membership, wallet offer, member grants, notification and canonical
audit evidence commit atomically. Versioned Satzung, technical-protocol and
privacy acknowledgements are separate. General research readiness is optional
and never gates membership. ADR-037 remains Proposed pending architecture/legal
approval; existing legacy members are not reclassified.
