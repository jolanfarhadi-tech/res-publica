# Auth0 invitation and identity-provisioning runbook

## Status

Implementation-ready operational draft. External onboarding remains closed
until the board assigns an identity administrator and reviewer, Auth0 callback
and logout/origin settings are verified, MFA policy is active for sensitive
roles, and security-event retention/export is approved.

## Separation of duties

- The requester states the operational need and requested capability.
- The identity administrator creates or invites the Auth0 identity.
- A different authorized reviewer approves application identity linking and
  grants.
- The recipient completes authentication and MFA enrollment where required.
- No role is inferred from email domain, membership tier, or Auth0 metadata.

## Provisioning

1. Record an approved request with person reference, purpose, requested
   capability, target scope, assurance level, validity period, requester, and
   reviewer.
2. Invite the user through the existing approved Auth0 connection. Do not send
   passwords or secrets manually.
3. After first successful verified authentication, link the immutable issuer
   and subject to the existing Person through the governed identity-linking
   operation. Never accept a `personId` from a public client.
4. Create only the approved capability grants, with target scope and expiry.
   Sensitive Governance, Publishing, and administration grants require the
   assurance level mandated by accepted ADRs.
5. Verify session restoration, logout, expiry, denied access, and canonical
   audit evidence with a controlled test account.

## Founder-appointed foundational authority

`Institution Admin` and `Publisher` are not ordinary administrator roles.
ADR-033 and ADR-036 reserve their appointment and removal to the
Founder/Human Approval Authority through an externally recorded process. They
must never be inferred from a board title, email address, Auth0 metadata, or
Control Panel visibility.

The repository provides the non-HTTP command
`npm run ops:record-founder-authority`. It records an already-made appointment;
it does not make or approve the decision. Before running it, the operator must
verify all of the following:

1. The approval authority and appointee are two different canonical Persons,
   each linked to an active immutable OIDC `(issuer, subject)` tuple.
2. The external appointment record identifies the authority, exact institution
   or publication scope, optional expiry, requester, approver, and a unique UUID
   used as the approval request ID.
3. The database connection is supplied through the process environment and is
   authorized to insert `authorization_grants` and canonical `audit_log` rows.
   Never pass or print the connection URL on the command line.
4. The exact confirmation value is set only for the controlled invocation.

Required process variables are:

- `DATABASE_URL` (secret; never print or persist in shell history);
- `FOUNDER_APPOINTMENT_CONFIRMATION` with the exact value
  `RECORD-EXTERNALLY-APPROVED-FOUNDATIONAL-AUTHORITY`;
- `FOUNDER_APPROVAL_ISSUER` and `FOUNDER_APPROVAL_SUBJECT`;
- `FOUNDER_APPOINTEE_ISSUER` and `FOUNDER_APPOINTEE_SUBJECT`;
- `FOUNDER_AUTHORITY`, exactly `institution-admin` or `publisher`;
- `FOUNDER_AUTHORITY_TARGET`, the exact institution or publication scope;
- `FOUNDER_APPROVAL_REQUEST_ID`, the UUID of the external approval record;
- optionally `FOUNDER_AUTHORITY_VALID_UNTIL` as an ISO-8601 timestamp.

Run `npm run ops:record-founder-authority` once the environment is complete,
then clear the process variables. The command fails closed for missing or
disabled identities, self-appointment, invalid approval evidence, a past
expiry, or a duplicate active authority. The grant and canonical audit event
commit atomically; issuer and subject values are not copied into the audit
record. No web route exposes this operation.

After appointment, the recipient must sign in again and complete MFA. The
localized Operations Control Panel then exposes only the exact scopes granted
to that account. Within those scopes, Institution Admins may delegate the
seven operational Governance roles and Publishers may delegate Editor,
Reviewer, and Translator. Those web writes retain recent-MFA, no-self-grant,
exact-scope, canonical-audit, and domain separation requirements. The panel
cannot appoint or revoke Institution Admins or Publishers.

## Change and deprovisioning

Revoke the narrow grant before disabling the identity unless incident
containment requires immediate identity blocking. Record reason, actor,
timestamp, and review evidence. Do not delete the Person or AuditLog as an
identity-management shortcut. Lost-device, compromised-credential, and
departure cases follow the incident runbook and Auth0's approved recovery
process.
