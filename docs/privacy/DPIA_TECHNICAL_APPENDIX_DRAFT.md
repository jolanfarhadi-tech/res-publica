# DPIA technical appendix — review draft

**This does not complete the legal DPIA.** It records implemented controls and
open technical dependencies for qualified review.

## Data flow

1. Anonymous browser requests reach Vercel and receive Tier-1 content.
2. Login initiation creates bounded PKCE/OIDC flow state, then redirects to
   Auth0.
3. Auth0 returns an authorization code only to the configured callback.
4. The server validates state/nonce/PKCE and links the immutable OIDC subject
   to a Person before issuing an encrypted, HTTP-only session.
5. Protected writes derive the actor from that session, apply shared
   capability authorization, trusted-origin checks and rate limits, then
   persist domain state and canonical audit evidence atomically in Neon.
6. Self-facing reads query only the actor's tier-authorized records.

## Implemented measures

- EU-resident managed PostgreSQL configuration previously verified; TLS 1.3
  and migrations verified in the controlled infrastructure setup.
- OIDC Authorization Code with PKCE, encrypted server session, expiry and
  revocation state, issuer/subject identity linking, and no caller-supplied
  actor.
- Capability authorization, target scope, assurance requirements, MFA gates
  for sensitive domains, and separation of duties.
- Two default-off versioned profile confirmations written atomically with
  membership creation.
- Append-only hash-linked canonical AuditLog for accountable state changes.
- PostgreSQL-backed pseudonymized rate limiting for login, membership and
  event writes.
- CSP, HSTS, framing, MIME, referrer, permissions and cross-origin headers.
- Minimal request IDs and structured failure logging without payloads or
  exception details.
- No analytics or external AI provider active; no Production upload service;
  no auto-publication or automated eligibility decision.

## Open risks and gates

| Risk | Existing mitigation | Required closure |
|---|---|---|
| Auth0 callback mismatch blocks protected flows | Authentication fails closed | Correct and verify exact callback/logout/origin settings |
| Sensitive-role account compromise | Capability/assurance checks | Approve and verify Auth0 MFA and security-event export |
| Undefined retention causes over-retention | No destructive lifecycle jobs | Approve retention matrix and provider settings |
| Audit evidence conflicts with erasure | ADR-029 prevents silent deletion | Legal approval for access, retention and pseudonymization |
| Provider/transfers not fully documented | Minimal provider set | Retain DPAs, subprocessors, region and transfer evidence |
| Database disaster recovery not evidenced | Managed backups and runbook | Complete isolated non-Production restore drill and approve RPO/RTO |
| Incident handling lacks named owners | Technical runbook | Assign commander, deputy, privacy and communications owners |
| Advanced sensitive workflows | Server-side non-activation boundaries | Approve storage, safeguarding, DPIA and operating roles before activation |

## Review evidence required

The approved DPIA must reference the final processing inventory, data-flow
diagram, provider contracts, threat/risk assessment, retention schedule,
rights procedures, incident ownership, restore-drill evidence, residual-risk
acceptance, and review date.
