# Privileged Access Review

Status: Operational procedure; owner assignments and provider evidence pending

## Review inputs

- active authorization grants grouped by domain, capability and exact target;
- grant validity and revocation state;
- canonical role grant/revoke and sensitive-decision AuditLog records;
- denied privileged-access events grouped by scope and request ID;
- Auth0 MFA and security-event evidence, when provider export is approved.

Do not export raw session cookies, tokens, identity claims, request bodies or
database credentials into the review package.

## Review procedure

1. Assign a requestor and an independent reviewer.
2. Verify that each grant has a current owner, operational need, exact target
   and minimum assurance.
3. Revoke expired, unused, duplicated or excessive grants through the existing
   protected route with `scheduled-access-review` or `duty-reassignment`.
4. Confirm that no actor can cross the Civic/Publishing and Governance domains
   through a role label alone.
5. Correlate high-risk changes by server request ID, session ID, capability,
   reason code, actor and timestamp in the canonical audit store.
6. Investigate repeated denials, capability expansion, unexpected target
   changes, monitoring gaps and separation-of-duties failures.
7. Record reviewer identity, scope, exceptions and completion date outside the
   application until an approved review-evidence store exists.

## Emergency handling

Use the existing incident-response and Tier-0 compromise playbooks. Do not
disable authorization, MFA, immutable audit, rate limiting or separation of
duties to restore access. Database privilege changes, monitoring disablement,
evidence deletion and fail-closed overrides require separately approved
control-plane procedures; they are not application-admin capabilities.

