# Recovery Control Matrix

Status: Mandatory hardening Phase E engineering inventory. It distinguishes
repository evidence from provider configuration and owner approval.

## Recovery objectives

Organizational RPO and RTO are **OWNER DECISION REQUIRED**. Candidate planning
ranges, subject to actual contracted provider capabilities and owner approval,
are: database/identity/security evidence RPO from continuous history to 15
minutes and RTO from 1 to 4 hours; public source/configuration RPO at the last
verified commit and RTO from 1 to 2 hours; optional AI/search capabilities may
recover later while public pages remain available. These are proposals, not
commitments or evidence of current service levels.

## Backup inventory and independence

| Asset | Recovery source | Repository evidence | Backup independence / open boundary |
|---|---|---|---|
| Main PostgreSQL data | Neon history/snapshot restored to an isolated branch | 2026-08-10 provider drill at 19 migrations/66 tables; current synthetic drill at 26/105 | provider retention and deletion authority share the Neon control plane; independent owner/access evidence required |
| Anonymous research verifier | separate migration chain and gated database URL | fresh isolated check applies 1 migration/6 tables | real provider backup is not activated while the real-data gate is closed |
| Application source | private Git repository and immutable commit | CI source-SHA and supply-chain checks | branch protection, recovery owner and independent provider access evidence required |
| Deployment/configuration | Vercel project plus documented environment names | build, health and project-boundary checks | secret values are not in Git; independent inventory/export and restore procedure require provider evidence |
| Auth0 configuration | EU tenant application configuration | OIDC contract and callback tests | tenant export/recovery, MFA and security-log retention require owner/provider evidence |
| Content/Knowledge Graph | versioned source plus PostgreSQL governed graph | source provenance and migration checks | current provider snapshot covers Production data; independent content export policy is unapproved |
| Audit/incident evidence | append-only AuditLog plus approved provider logs when configured | atomic audit tests and request correlation | retention, external log export and access-separated evidence store remain open |
| Issuer/recovery keys | server secret store and holder-controlled device material | code excludes private holder keys from server persistence | escrow/rotation/recovery ownership and independent secure storage require approval |

Provider snapshots are not treated as a complete backup of Git, Auth0, Vercel
configuration, secrets or external logs. No recovery credential should exist
only inside the Production system it must recover.

## Credential rotation dependency map

| Credential class | Consumers | Rotation / revocation order | Verification | Rollback boundary |
|---|---|---|---|---|
| PostgreSQL migration role | authorized migration operator only | create/verify replacement, perform approved migration, revoke old role | TLS, journal, grants and old-login failure | restore access only through database owner; never grant runtime DDL |
| PostgreSQL runtime role | Vercel server runtime | create least-privilege replacement, update Production secret, deploy, revoke old role | readiness, write/read boundaries, old-login failure | redeploy prior verified secret only while still valid and incident-approved |
| Auth0 client secret | server callback only | rotate in Auth0, update Vercel, deploy, revoke predecessor | discovery, login initiation, controlled callback, old-secret failure | Auth0 grace/rollback requires tenant administrator approval |
| Session/HMAC secret | authentication and privacy-preserving rate keys | incident-approved rotation invalidates sessions/buckets as documented | old session failure, new login, rate-limit operation | do not rotate blindly; user impact and incident evidence must be accepted |
| Research issuer/verifier secrets | gated issuer and isolated verifier | keep issuance closed, replace keys/config, revoke affected credentials, verify synthetic proof | old proof/credential rejection and project isolation | real-data gate remains closed until independent approval |
| Vercel/GitHub operator tokens | deployment/source automation | revoke compromised token, issue narrowly scoped replacement | audit event, exact project/repository access, old-token failure | human break-glass process only; no token values in evidence |

Named owners, custodians, rotation periods and private recovery contacts remain
outside Git and require organizational approval.

## Critical paths and residual single points

- Neon control-plane access can affect both Production and same-provider
  history; stronger access separation and independent exports require owner and
  provider decisions.
- One Vercel runtime still shares the main database credential across the
  modular monolith; Phase-C logical quarantine is not process isolation.
- Auth0, Vercel, Neon and GitHub recovery ownership is not yet independently
  assigned or evidenced.
- Audit evidence is durable in PostgreSQL but provider log export/retention is
  not verified; a control-plane compromise could reduce external evidence.
- Destructive Production recovery remains Class-4 human/dual-control work.
