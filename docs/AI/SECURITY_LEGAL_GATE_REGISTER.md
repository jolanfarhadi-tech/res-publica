# Security and Legal Gate Register

Status: Active  
Applies to: Platform implementation programme

This register distinguishes implementation authority from external, legal, and
operational approval. A code-complete feature is not automatically approved for
Production activation.

| Gate | Current evidence | State | Blocks |
|---|---|---|---|
| OIDC callback configuration | Correct Vercel project has all required OIDC variable names; Production Auth0 reports callback mismatch; management dashboard access is not authenticated | Open | Login and authenticated operations |
| Identity invitation/provisioning ownership | No approved operational workflow found | Open | External user onboarding |
| Auth0 MFA plan | ADR requires MFA for sensitive capabilities; Production policy not verified | Open | Admin, Governance, Publishing operations |
| Auth0 security-event export | Required by ADR-027; not verified | Open | Production security operations |
| Real DPIA | Repository DPIA explicitly identifies itself as a placeholder | Open | Approved real-person processing |
| Processor DPAs | Vercel, Neon and Auth0 agreements not evidenced in repository | Owner/legal evidence required | Approved real-person processing |
| Record of processing activities | No complete approved RoPA found | Open | Privacy governance |
| Retention schedule | No approved periods; repository forbids invention | Open | Withdrawal, erasure, operational data lifecycle |
| AuditLog pseudonymization | Engineering pattern exists; ADR-029 keeps activation legally blocked | Blocked by legal approval | Erasure workflow |
| Consent withdrawal policy | Canonical entity supports revocation but operational ADR-035 is absent | Architecture/legal gate | Withdrawal UI/API |
| Profile mutation policy | ADR-034 authorizes read-only self-service only | Architecture gate | Profile edits |
| Terms/membership rules | Legal necessity and approved text not determined | Legal review required | Public service-rule publication |
| Incident-response ownership | No verified accountable Production owner/runbook | Open | Operational launch assurance |
| Production administrator responsibility | No verified named operational responsibility | Open | Privileged administration |
| Security logging/retention | Canonical audit exists; operational security policy absent | Open | Monitoring and incident evidence |
| Browser security headers | CSP/HSTS/cross-origin policy implemented and locally tested; Production edge not yet verified | Pending deployment verification | Production security assurance |
| Distributed rate-limit store | PostgreSQL bucket and auth-login enforcement implemented and locally verified; migration not applied to Production; remaining sensitive writes not yet integrated | Partial | Abuse-resistant writes |
| Transactional email provider | No activated approved provider | Intentionally disabled | Real delivery |
| Newsletter legal basis/provider | Optional UI exists; provider unavailable | Intentionally disabled | Newsletter activation |
| Analytics provider/legal basis | No provider; disabled by default | Intentionally disabled | Analytics activation |
| Object storage | No approved EU storage or malware scanner | Intentionally disabled | File uploads |
| External AI provider | No approved provider/DPIA/governance activation | Intentionally disabled | External AI |
| HARM evidence/case Production operation | Secure storage and safeguarding not approved | Intentionally disabled | Sensitive case processing |
| Programme operational approval | Staffing, dates, and approved content not established | Intentionally disabled | Public programme opening |
| Neon restore drill | Backups/snapshots exist; no non-Production restore evidence | Open | Demonstrated recoverability |
| Duplicate Vercel project | `res-publica-tq5l` exists but is not the custom-domain project | Owner approval required for deletion | Cleanup only; must avoid wrong deployment |

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
