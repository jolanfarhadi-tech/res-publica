# Processing inventory — implementation draft

**Technical inventory only; legal owner approval required.**

| Activity | Data subjects and data | Purpose evidenced by code | System/processor | Access boundary | Legal/retention gate |
|---|---|---|---|---|---|
| Public delivery | Visitors; IP/request metadata, user agent, requested path | Serve and secure public pages | Vercel | Provider and authorized operators | Legal basis, provider log retention and transfers |
| OIDC authentication | Account holders; issuer, subject, claims, assurance, flow/session IDs and timestamps | Authenticate and restore bounded sessions | Auth0, Vercel runtime, Neon | Identity administrators; self session | DPA, MFA, event export, session/flow retention |
| Identity linking and grants | Authorized participants; Person reference, external subject, capability, target, validity/revocation | Derive actors and enforce bounded authority | Neon | Authorized identity/grant operators; canonical audit | Provisioning ownership and retention |
| Membership application/profile | Applicants/members; name/contact, locale, membership type/status, registration date | Create and display a private membership relationship | Neon | Self-facing profile; capability-authorized operators | Admission workflow, lawful basis, correction/erasure policy |
| Profile confirmations | Applicants; two versioned purposes, granted timestamp, revoked state | Evidence separate data-protection and programme-use confirmations | Neon | Self and authorized compliance operators | Withdrawal activation blocked pending ADR/legal approval |
| Event registration | Participants; event/person reference, status, time, waitlist position | Capacity, waitlist and owner cancellation | Neon | Self and authorized event operators | Event retention and communication basis |
| Notifications | Authenticated recipients; recipient reference, channel, template, status, timestamps | Transactional status delivery and inbox history | Neon; no external provider active | Self and authorized operations | Provider/DPA and retry/retention policy |
| Newsletter request | Subscribers; email and confirmation state where implemented | Double-opt-in subscription | Application persistence; delivery provider not approved | Authorized communications operators | Provider and legal basis before activation |
| Authorization rate limiting | Authentication/write clients; pseudonymized identifier hash, scope, window, count, expiry | Abuse prevention | Neon | Runtime and restricted operators | Approved security retention |
| Operational diagnostics | Request users; generated request ID, method, path, timestamp | Diagnose failures without payload logging | Vercel logs | Restricted production operators | Log retention and security-event policy |
| Canonical audit | Participants/operators; actor reference, action, target, timestamp, hash chain fields | Accountability and immutable institutional memory | Neon | Explicit audit-inspection capability | Retention, access, pseudonymization/erasure legal gate |
| Publishing workflow | Authorized authors/reviewers/publishers; drafts, versions, assignments, decisions, locale, provenance | Human-reviewed multilingual publication readiness | Neon | Scoped Publishing capabilities and MFA | Content/record retention; no auto-publication |
| Governance/HARM | Authorized case roles; case/evidence/hearing/review/repair metadata | Accountable institutional workflow | Neon | Separation-of-duties capabilities and MFA | Sensitive operation remains gated; secure files unavailable |
| Client preferences | Visitors; necessary/functional/analytics preference flags, accessibility settings | Remember privacy and interface choices | Browser storage | The visitor's browser | Approved storage duration and exact cookie/storage list |

## Excluded or inactive

No public profile directory, automated membership decision, unrestricted
export, identity-document upload, activated external AI provider, activated
analytics provider, or Production file-upload service is represented as
operational.
