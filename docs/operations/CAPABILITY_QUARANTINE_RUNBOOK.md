# Capability Quarantine Runbook

Status: Repository procedure; Production changes require authorized operators

## When to use

Use the narrowest control when there is credible evidence of a compromised
capability, unexpected privileged write path, AI scope violation, or Research
security invariant failure. Quarantine is containment, not remediation or legal
approval.

## Controls

- Narrow one or more exact capabilities with
  `SECURITY_QUARANTINED_CAPABILITIES`, for example
  `civic:ai.rag.query`.
- Freeze one or more existing protected write scopes with
  `SECURITY_FROZEN_WRITE_SCOPES`, for example
  `publishing.privileged-write`.
- Force all Research wallet and real-data processing closed with
  `SECURITY_FORCE_RESEARCH_FAIL_CLOSED=true`.

Never place a person ID, email, IP address, session ID, token or free-text
incident narrative in these values. Values are exact capability/scope names.

## Controlled procedure

1. Open an incident record and appoint an authorized operator and independent
   reviewer outside the application.
2. Identify the narrowest exact capability or existing write scope supported by
   evidence. Use the Research override for any Research invariant failure.
3. Record the previous configuration without copying secret values.
4. Change only the server-only environment variable in the canonical project;
   do not expose it through `NEXT_PUBLIC_*`.
5. Redeploy through the approved workflow. A malformed configured value fails
   closed at that control boundary.
6. Verify affected requests return correlated `403` or
   `503 security_quarantine_active` before persistence. Verify unrelated public
   and protected flows remain available.
7. Review `security.quarantine.enforced` and `privileged_access.denied` events;
   these contain request metadata but no identity or body.
8. Rotate affected credentials and complete forensic/recovery procedures before
   removing quarantine. Two-person review is required for removal.

## Recovery and self-denial checks

Do not disable health/readiness evidence, immutable audit, rate limiting, MFA or
separation of duties. If an invalid capability list quarantines its boundary,
correct that one value; do not bypass authorization. If the main runtime itself
is credibly compromised, revoke its provider credentials and isolate/roll back
the deployment—the in-process quarantine cannot defend against arbitrary code
execution in the same process.

