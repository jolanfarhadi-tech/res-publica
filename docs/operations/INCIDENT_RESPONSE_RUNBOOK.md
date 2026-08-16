# Production incident-response runbook

## Status and ownership gate

Implementation-ready technical draft, 2026-07-29. The board must name a
primary incident commander, deputy, data-protection contact, and external
communications owner before this runbook is operational. Names and private
contact details do not belong in Git.

## Detection

The scheduled `Production health` workflow checks the public liveness and
database-readiness contracts every fifteen minutes. Vercel, Neon, Auth0, and
GitHub security alerts are additional signals once their accountable
recipients and retention settings are approved. A failed workflow is evidence
of a signal, not proof of root cause.

## Initial response

1. Open a private incident record with UTC detection time, reporter, affected
   service, request IDs, and the least personal data necessary.
2. Assign severity and incident commander. Do not copy tokens, database URLs,
   identity claims, or profile payloads into tickets or chat.
3. Preserve relevant Vercel, Auth0, Neon, application, and canonical AuditLog
   evidence under the approved retention/access policy.
4. Contain using the smallest reversible action: disable the affected write or
   provider integration, revoke a specific credential, or roll back the
   deployment. Keep anonymous Tier-1 content available when safe.
5. For suspected personal-data compromise, notify the data-protection contact
   immediately. Legal notification duties and deadlines must be decided by
   qualified counsel, not inferred from this document.

## Technical triage order

1. Confirm deployed commit and Vercel deployment ID.
2. Check `/api/health/live` and `/api/health/ready`.
3. Correlate `X-Request-ID` with minimal structured logs.
4. Check Neon availability, connection saturation, and migration journal
   without changing data.
5. Check Auth0 tenant status, callback configuration, security events, and MFA
   enforcement without weakening authentication.
6. Compare the failing behavior with the last verified release.

For technical attribution, use `TECHNICAL_ATTRIBUTION_RUNBOOK.md`. Preserve the
strict A–D boundary, explicit contradictory evidence and alternative
explanations. A source address, authenticated account or behavioral cluster is
not a real-world identity and never authorizes active scanning or hack-back.

Use `DEFENSIVE_CORRESPONDENCE_RUNBOOK.md` for ordered Loops 1–5 and A→A′
evaluation. Its ledger authorizes only the bounded effect it records; it does
not substitute for provider-side containment, capability quarantine, secret
rotation or recovery approval.

## Recovery and closure

Recovery requires smoke tests for anonymous routes, authentication, the
affected protected flow, readiness, and audit continuity. Close only after
root cause, timeline, impact, evidence locations, corrective actions, owner,
and due dates are recorded. A post-incident review must explicitly assess
authorization, separation of duties, personal-data exposure, and whether an
ADR or legal review is required.

Use `CLEAN_RECOVERY_RUNBOOK.md` for a destructive or integrity-affecting event.
Recovery must select a supported last-known-good source and recovery point,
must not restore suspected secrets, roles, data mutations, dependencies or
build artifacts, and must verify that revoked access remains revoked. A
Production cutover remains explicit human/dual-control work.
