# Privileged Access and Insider-Threat Model

Status: Implemented repository controls; provider and owner evidence remains external  
Applies to: Mandatory hardening Phase B

## Threat assumption

A privileged account may be legitimate but compromised, coerced, misused or
over-provisioned. Authentication alone is therefore insufficient. Sensitive
operations must re-establish current assurance and the exact authority for the
operation immediately before state is changed.

## Server-side control chain

The protected operation order is:

1. trusted-origin validation;
2. privacy-preserving distributed PostgreSQL rate limiting;
3. session-derived actor resolution;
4. exact domain, capability and target authorization;
5. recent MFA for the high-impact transition;
6. operation-specific bounded reason code;
7. existing separation-of-duties and state checks;
8. atomic state and canonical AuditLog persistence.

The application never accepts a caller-supplied actor, session ID or request
ID. Recent MFA expires five minutes after the provider-authenticated instant;
future, invalid and stale authentication times fail closed. Step-up uses the
standard OIDC `prompt=login` and `max_age=0` request. The application does not
claim MFA unless the provider's signed claims contain a recognized MFA method.

## Covered high-impact operations

- Governance and Publishing role grant/revocation;
- Membership board approval/rejection and its bounded grant issuance;
- Fellowship role-scope approval, candidacy decision and status transition;
- real-data-gated research credential issuance.

Governance and Publishing remain separate authorization domains. No universal
administrator is introduced. Existing initiator/reviewer, applicant/decider,
publisher/reviewer and Fellowship conflict boundaries remain authoritative.

## Evidence and privacy

Accepted transitions add nullable `session_id`, `request_id`, `capability` and
`reason_code` fields to the canonical append-only `audit_log`. Existing rows
remain valid. Denied `401`/`403` operations emit a structured operational event
containing only server request ID, method, path, status and limiter scope. Raw
IP addresses, tokens, identity payloads, request bodies and reason prose are not
stored by these controls.

## Residual external controls

Repository code cannot prove provider MFA enrollment/policy, named role owners,
periodic access review, Auth0 security-event export, alert delivery/retention,
or Production migration/deployment. These remain explicit external gates. The
research real-data gate remains closed and this implementation does not approve
real credential issuance.

