# Module: Notifications

## Purpose

Provide the one canonical cross-module delivery record required by ADR-002,
plus bounded operational evidence for each external delivery attempt. Events,
Membership, Community, and CRM reuse this entity rather than owning parallel
email mechanisms.

## Canonical authority

- ADR-002 adds Notification as a canonical shared entity.
- The core domain model defines one Notification per send.
- ADR-029 does not authorize an event bus in M1.
- Provider activation remains subject to privacy, processor, retention, and
  operational gates.

## Current implementation

`src/domain/notification/index.ts` owns Notification creation and status
transitions. `src/application/notification-delivery.ts` adds an internal
provider boundary and delivery orchestration. The default
`DisabledNotificationProvider` cannot deliver.

The service locks the pending Notification, verifies its recipient and
purpose-scoped consent, assigns the next bounded attempt number, writes a
deterministic idempotency key, invokes an explicitly enabled provider, and
finalizes both attempt evidence and Notification state in one transaction.
A provider exception becomes a retryable, non-sensitive operational code.
Permanent failures and the final bounded attempt make the Notification final.

Only the two existing Event templates map to the existing `event-pii` purpose.
Unknown templates fail closed and do not disclose contact data to a provider.
No broader email legal basis is inferred.

## Persistence and privacy

Migration `0013_notification-delivery-attempts.sql` creates
`notification_delivery_attempts`. It stores no email address, message body,
request payload, or exception detail. Provider error codes are constrained by
the application to a short machine-safe vocabulary; arbitrary values become
`provider_error`.

The Notification row remains the canonical delivery state. Attempt rows are
operational evidence, not a second notification entity or an event bus.

## Verification

The PGlite integration suite proves:

- the disabled adapter causes no delivery or persistence mutation;
- missing active purpose consent prevents provider access and attempt writes;
- successful delivery persists one idempotent attempt and final status;
- transient failures retry with monotonically numbered attempt records; and
- permanent failures become final and are not retried.

Focused verification passes 1 file / 5 tests; full verification passes 48
files / 231 tests. Structure, lint, typecheck, `git diff --check`, schema
validation, a fresh 14-migration / 55-table database, and the 102-page
Production build pass.

## Current status

**LOCALLY_VERIFIED, PROVIDER DISABLED, NOT PUSHED OR DEPLOYED.** No credentials,
external provider, worker schedule, public route, or real-person delivery is
active.

## Open work

Owner/legal approval of a provider and DPA, templates and legal basis,
retention, worker operations, credentials, and Production migration
authorization are required before real delivery.

## Do not redo

Do not add per-module mail senders, store addresses in attempt evidence, infer
consent for unknown templates, expose delivery as a public write API, or
activate a provider from repository defaults.
