# Security and Legal Gate Register

Status: Active  
Applies to: Platform implementation programme

This register distinguishes implementation authority from external, legal, and
operational approval. A code-complete feature is not automatically approved for
Production activation.

| Gate | Current evidence | State | Blocks |
|---|---|---|---|
| OIDC callback configuration | Production Auth0 discovery and login initiation use the approved EU tenant, exact `https://respublica-ev.de/api/auth/callback`, PKCE, state and nonce; the former callback mismatch is resolved | Verified 2026-08-10 | — |
| Controlled Membership authentication E2E | Repeatable check verifies anonymous/OIDC and read-only private boundaries without bypass; no approved synthetic session is stored | Controlled Auth0 session and genuine MFA verification required | Evidence for authenticated application and board operation |
| Identity invitation/provisioning ownership | Separation-of-duties runbook exists; accountable administrator/reviewer not appointed | Owner assignment required | External user onboarding |
| Auth0 MFA plan | ADR requires MFA for sensitive capabilities; Production policy not verified | Open | Admin, Governance, Publishing operations |
| Auth0 security-event export | Required by ADR-027; not verified | Open | Production security operations |
| Real DPIA | Repository DPIA remains a placeholder; technical appendix and processing inventory draft exist | Legal/DPO approval required | Approved real-person processing |
| Processor DPAs | Vercel, Neon and Auth0 agreements not evidenced in repository | Owner/legal evidence required | Approved real-person processing |
| Record of processing activities | Machine/human technical inventory covers 20 activities and all 95 repository-schema tables, including local Academy and Fellowship migrations; CI detects schema/source/legal-field drift | Owner/legal approval required | Privacy governance |
| Retention schedule | Decision matrix exists without invented periods | Owner/legal approval required | Withdrawal, erasure, operational data lifecycle |
| AuditLog pseudonymization | Engineering pattern exists; ADR-029 keeps activation legally blocked | Blocked by legal approval | Erasure workflow |
| Consent withdrawal policy | Canonical entity supports revocation but operational ADR-035 is absent | Architecture/legal gate | Withdrawal UI/API |
| Profile mutation policy | ADR-034 authorizes read-only self-service only | Architecture gate | Profile edits |
| Terms/membership rules | Legal necessity and approved text not determined | Legal review required | Public service-rule publication |
| Privacy notice | Accurate replacement draft identifies current technical processing; live notice remains unchanged | Human/legal publication approval required | Accurate transparency |
| Incident-response ownership | Technical runbook exists; named commander, deputy, privacy and communications owners absent | Owner assignment required | Operational launch assurance |
| Production administrator responsibility | No verified named operational responsibility | Open | Privileged administration |
| Security logging/retention | Minimal request logging and incident evidence procedure exist; retention/recipients unapproved | Owner/legal approval required | Monitoring and incident evidence |
| Browser security headers | CSP/HSTS/cross-origin policy implemented and verified at the Production edge; browser console and Vercel error-log checks are clean | Verified 2026-07-30 | — |
| Distributed rate-limit store | Migration 0012 is applied in Production; PostgreSQL buckets protect auth login, membership creation, event registration, and all 15 Governance/Publishing writes without raw client addresses | Verified 2026-07-30 | — |
| Production migration state | Protected EU Neon branch contains all migrations through 0018: 19 journal entries and 66 public tables | Verified 2026-08-10 | — |
| Transactional email provider | Provider abstraction, consent gate, idempotent retry evidence and non-delivering adapter implemented; no provider, credentials, worker or approved templates configured | Intentionally disabled | Real delivery |
| Newsletter legal basis/provider | Exact server activation gate, versioned explicit consent and PostgreSQL abuse protection implemented; provider, DPA, approved text and withdrawal/retention operations remain absent | Intentionally disabled / owner activation required | Newsletter activation |
| Analytics provider/legal basis | No provider; disabled by default | Intentionally disabled | Analytics activation |
| Object storage | No approved EU storage or malware scanner | Intentionally disabled | File uploads |
| External AI provider | No approved provider/DPIA/governance activation | Intentionally disabled | External AI |
| Research real-data activation | BBS issuance, project proof, isolated verifier and anonymous intake are implemented and synthetic-tested; external DPIA, cryptographic/reidentification audit, operators and project approval are absent | Closed: `RESEARCH_REAL_DATA_ACTIVATION_APPROVED` remains unset/false | Real ZK credentials and real research contributions |
| HARM evidence/case Production operation | All Governance writes are server-disabled by default; activation requires exact `HARM_OPERATIONS_ENABLED=true`; secure storage and safeguarding remain unapproved | Intentionally disabled / owner activation required | Sensitive case processing |
| Programme operational approval | Staffing, dates, and approved content not established | Intentionally disabled | Public programme opening |
| Academy enrollment activation | Additive migration 0019 and public/member/staff code are implemented and synthetic-tested; learner legal basis, transparency, retention/erasure, approved curricula, named operators, Production migration authorization and real enrollment approval are absent | Closed: `ACADEMY_ENROLLMENT_ENABLED` remains unset/false | Real learner enrollment, progress, assessment and completion processing |
| Fellowship candidacy activation | Additive migration 0020 and human-gated nomination/application/review/decision code are implemented and synthetic-tested; candidate transparency/legal basis, retention/erasure, named independent operators, approved role scopes and Production migration authorization are absent | Closed: `FELLOWSHIP_APPLICATIONS_ENABLED` remains unset/false | Real Fellowship candidacies, decisions and role records |
| Neon restore drill | Current Production snapshot restored without finalize to an isolated branch; TLS 1.3/certificate, 19 migrations, 66 tables, constraints and readiness verified; temporary branches removed | Technical drill verified 2026-08-10; RPO/RTO still require owner approval | Organizational recovery objectives and destructive Production restore authority |
| Duplicate Vercel project | `res-publica-tq5l` exists but is not the custom-domain project; safe consolidation procedure documented | Owner approval required for deletion | Cleanup only; must avoid wrong deployment |

## Gate-handling rules

1. Never represent an open gate as approved.
2. Implement independent safe work while an external gate remains open.
3. Keep blocked providers and advanced modules disabled on the server, not only
   hidden in the interface.
4. Legal drafts must say that legal review is required.
5. Destructive Production restore, external-project deletion, paid-provider
   activation, and public programme opening require explicit owner approval.
6. Accepted ADRs take precedence over product-memory aspirations. Where an ADR
   explicitly excludes a mutation or disclosure, implementation stops at that
   boundary until a new accepted decision exists.
