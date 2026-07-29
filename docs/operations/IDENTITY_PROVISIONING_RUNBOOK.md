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

## Change and deprovisioning

Revoke the narrow grant before disabling the identity unless incident
containment requires immediate identity blocking. Record reason, actor,
timestamp, and review evidence. Do not delete the Person or AuditLog as an
identity-management shortcut. Lost-device, compromised-credential, and
departure cases follow the incident runbook and Auth0's approved recovery
process.
