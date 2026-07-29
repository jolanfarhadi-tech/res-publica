# Module: Events

## Incremental integration — self-facing Dashboard, 2026-07-29

The protected Dashboard now consumes the authenticated actor's own event
registration history and joined public event details as a read-only
projection. It does not change registration, cancellation, capacity,
waitlisting, promotion, notification, or audit behavior. Registration actions
are shown only when the actor currently holds a valid `events.register`
capability.

## Incremental implementation — owner cancellation, 2026-07-29

`DELETE /api/events/registration` now cancels the session-derived actor's own
active registration under the existing event-targeted `events.register`
capability. The application service locks the event and performs cancellation,
waitlist cleanup, valid earliest-waitlist promotion, pending-notification
persistence, and the canonical `events.registration.cancelled` audit append
in one transaction. An actor cannot select another person or cancel an absent
or already-cancelled registration.

The existing `cancelled` registration status, waitlist table, shared
Notification entity, and canonical AuditLog are reused; no migration or
parallel service was introduced. Focused domain/application/route regression
tests pass 15/15.

`EventRegistration` now exposes localized cancellation controls and feedback
in DE/EN/FA after a successful registration or waitlist response. It preserves
the default-off event privacy confirmation for registration; cancellation is
an owner lifecycle action and does not request a second consent.

## Incremental implementation — registration request protection, 2026-07-29

`POST /api/events/registration` now receives a server-generated request ID and
consumes the shared PostgreSQL rate limit before actor resolution or event
persistence. The policy permits twenty attempts per fifteen-minute window per
pseudonymized client address. Existing capacity, waitlist,
duplicate-registration, session actor, authorization, notification, and audit
semantics remain owned by the Events application service.

## Purpose

Registration, waitlist/capacity management, event-scoped logistics Q&A, and post-event outcome publishing. Evidence: `src/modules/events/README.md` (read in full, this session).

## Canonical authority

No dedicated ADR found specifically for Events this session; it is one of the 9 ratified MVP modules per `brain/ROADMAP.md`'s build order (Knowledge Graph → AI Layer → Publishing → Community → Membership System → Events → Dashboard → CRM → Analytics). Cross-cutting authority: ADR-002 (domain model — `domain/audit-log`, `domain/notification` reuse), ADR-008 (AI Layer — reused for scoped Q&A, not reimplemented).

## Current implementation

`src/modules/events/{manifest.ts, outcomes.ts, qa.ts, registration.ts, types.ts, events.test.ts, README.md}` (directory listing, this session). Application layer: `src/application/events.ts`. Committed via `2194b7e` (M1 persistence foundation), `444dc6e` ("Harden event capacity handling") — both ≤ `origin/main` tip `7025e6f`.
Per the README (read in full), its own stated status: *"Registration, waitlist promotion, capacity checks, scoped Q&A, and outcome publishing implemented and tested. Dashboard/CRM/Analytics consumption deferred until those modules exist."*

## Data and persistence

`src/persistence/module-schema.ts` (grepped this session): `events` (L70), `registrations` (L79), `waitlistEntries` (L91), `eventQaLog` (L98), `outcomePublications` (L106). Migration coverage: `drizzle/0001_m1-membership-events.sql` (filename confirmed; content not read this session).

## Authorization and trust boundaries

Registration and cancellation derive the actor from the authenticated session
and require `{ domain: "civic", capability: "events.register", target:
eventId }`. Cancellation selects only the active registration whose
`personId` equals the actor. Public writes also retain trusted-origin checks,
shared PostgreSQL rate limiting, and server-generated request IDs.

## Public interfaces

`GET /api/events/capacity`, `POST /api/events/registration`, and
`DELETE /api/events/registration`. Registration and cancellation share the
same bounded route, request protection, actor resolver, and application
service boundary.

## Verification

Focused cancellation coverage in `src/modules/events/events.test.ts`,
`src/application/flows.integration.test.ts`, and
`src/app/api/events/registration/route.test.ts`: 15/15 passing.

## Decisions and rejected approaches

**The module's own stated "single most important guardrail"** (README, direct quote): *"`qa.ts` filters the Knowledge Graph down to only the querying event's own entities *before* passing it to the AI Layer's local provider — Event B's data is structurally absent, not merely filtered by convention."* This is a data-isolation design decision, not merely a filter — worth preserving verbatim for any future agent modifying `qa.ts`.
Integration pattern (README): `registration.ts` writes real `domain/audit-log` and `domain/notification` records (reuse, not reimplementation); `outcomes.ts` creates real `domain/notification` records for every confirmed registrant.

## Current status

**LOCALLY_VERIFIED, NOT YET PUSHED OR DEPLOYED.** Registration, cancellation,
capacity, waitlist promotion, owner authorization, notification persistence,
and atomic audit evidence are implemented. Self-facing Dashboard consumption
is implemented locally; CRM/Analytics consumption remains separately deferred.

## Open work

CRM/Analytics consumption of Events data remains deferred. The protected
Dashboard now consumes only the session actor's registration history.

## Do not redo

Do not re-implement registration, waitlist promotion, capacity checks, scoped Q&A, or outcome publishing — all implemented and tested per the module's own committed self-assessment. Do not remove or weaken the Knowledge-Graph-scoping guardrail in `qa.ts` without understanding it is the module's stated primary safety mechanism.

## Evidence index

- `src/modules/events/README.md` (full read, this session)
- `src/modules/events/{manifest,outcomes,qa,registration,types}.ts` (directory listing; not individually read line-by-line)
- `src/application/events.ts`
- `src/persistence/module-schema.ts:70,79,91,98,106`
- `drizzle/0001_m1-membership-events.sql`
- commits `2194b7e`, `444dc6e`
- tests: `events.test.ts`, `src/app/api/events/capacity/route.test.ts`
