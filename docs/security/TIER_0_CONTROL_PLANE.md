# Tier-0 Control Plane Review

Status: Engineering inventory. Named owners, provider configuration and
Production operational approval remain external gates.

## Tier-0 assets

| Asset | Authority and failure impact | Existing repository control | Remaining external control |
|---|---|---|---|
| Authorization engine | Can admit or deny every protected capability | session actors, exact domain/capability/target, assurance and expiry checks | named owner; Production grant review |
| Auth0 configuration | Establishes authentication and MFA evidence | OIDC discovery, Authorization Code + PKCE/state/nonce, exact callback | MFA policy, event export, tenant-admin SoD |
| Production DB privilege model | Can read/write durable platform state | TLS runtime, additive migration checks, bounded application role evidence | periodic grants review; named DB administrator |
| GitHub source/workflows | Defines build inputs and CI authority | immutable Action SHAs, read-only defaults, dependency/secret/SAST gates | branch protection; required reviews/checks |
| Vercel deployment control | Selects code and Production environment | source-SHA check and existing project boundary documentation | protected Production environment and named deploy approver |
| Secret store | Authorizes database, OIDC and provider access | secrets excluded from repository; high-confidence tree/history scan | inventory, rotation ownership, access logs |
| Security event pipeline | Preserves incident evidence and drives containment | canonical AuditLog and structured request IDs; no broad security automation yet | Auth0 export, durable retention, alert recipient |
| A/A′ policy engine | Could select defensive actions | not implemented in Phase A; no autonomous authority exists | later allowlist/evidence/anti-poisoning gates |
| Security Operations | Could expose or change containment state | protected Operations patterns; dedicated security domain not yet implemented | exact roles, dual control and operator appointment |
| Backup/recovery control | Determines recoverable state | migration verifier and isolated restore-drill tooling | independent backup authority, RPO/RTO and destructive-cutover approval |

## Invariants

- No universal administrator is introduced.
- Authentication alone never grants operational authority.
- Workflow tokens default read-only; write permissions are job-specific.
- Attacker, model or untrusted content cannot define executable policy.
- Research and optional subsystems fail closed without making static public
  content unavailable.
- A code-complete control is not evidence of provider or Production activation.

## Change control

Changes to a Tier-0 asset require a stated reason, narrow reviewer scope,
immutable source commit, full CI evidence and rollback path. Research
activation, issuer-key policy, major secret rotation, DB privilege changes,
monitoring disablement, permanent defensive policy and recovery cutover require
the existing human/dual-approval boundary; repository code cannot self-approve
them.

## Egress inventory

Current runtime destinations are limited by function to Auth0 discovery/token
exchange, PostgreSQL, optional disabled email/provider abstractions and public
source links. External AI, analytics, uploads and real research processing stay
disabled. Vercel network egress allowlisting is not configured or claimed; its
availability and cost require owner/provider review.

## References

`docs/security/SOFTWARE_SUPPLY_CHAIN_POLICY.md`;
`docs/AI/SECURITY_LEGAL_GATE_REGISTER.md`;
`architecture/adr/ADR-027-identity-authentication-authorization.md`;
`architecture/adr/ADR-029-audit-and-event-bus-boundary.md`
