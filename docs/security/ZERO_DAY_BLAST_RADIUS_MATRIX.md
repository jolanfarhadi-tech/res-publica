# Zero-Day Blast-Radius Matrix

Status: Mandatory hardening Phase C repository boundary  
Default: deny by exact capability; assume one component may be compromised

## Enforcement model and limitation

The application is a modular Next.js monolith. Domain services, capability
authorization, route projections, separate Research-verifier persistence and
feature gates provide strong logical boundaries. They do **not** provide
process-level isolation: most server components execute with the same Vercel
runtime and main `DATABASE_URL`, and a server-side arbitrary-code-execution
zero-day could bypass TypeScript imports and application authorization. Full
service/credential isolation therefore requires a separately approved
deployment architecture; it is not claimed here.

Emergency controls are narrow and server-only:

- `SECURITY_QUARANTINED_CAPABILITIES`: comma-separated exact
  `domain:capability` keys denied by the shared authorization primitive;
- `SECURITY_FROZEN_WRITE_SCOPES`: comma-separated existing privileged-write
  limiter scopes rejected before runtime/database acquisition;
- `SECURITY_FORCE_RESEARCH_FAIL_CLOSED=true`: overrides every Research wallet
  and real-data approval gate.

Malformed configured values fail closed only at their own boundary, avoiding a
single malformed control globally disabling unrelated public functions.

## Component boundary inventory

| Component | Data read | Data written | APIs invoked | Credentials / secrets | Outbound network | Administrative authority | Kill switch | Quarantine |
|---|---|---|---|---|---|---|---|---|
| Public site | committed public MDX, dictionaries, public projections | none server-side | same-origin public/auth/form APIs from browser | no server credential in static output | browser same-origin; build-time approved fonts | none | deployment rollback | no component-wide in-app switch; protected calls remain independently gated |
| Public API | allowlisted, human-approved public Knowledge Graph projection | none | internal read application service | shared runtime can access main DB although route owns no write | none | none | Vercel route/deployment disable | no capability required; DTO and read-only tests limit ordinary code, process isolation absent |
| Membership | self profile, applications, acknowledgements, consent and bounded status | Membership/application/consent and approval-owned grants/audit | Auth/session and notification abstraction | main DB/session; no email provider secret unless separately activated | OIDC belongs to Auth; email provider disabled | exact self or board capabilities | existing activation/provider gates | exact capability quarantine; board write limiter remains separate |
| Academy | Academy aggregates and bounded Person references | Academy lifecycle, enrollment, review and audit | same-origin Academy APIs | main DB/session | none | exact Academy capabilities only | `ACADEMY_ENROLLMENT_ENABLED` | exact capability and `academy.privileged-write` scope |
| Fellowship | Fellowship aggregates and bounded Person references | candidacy/review/status and audit | same-origin Fellowship APIs | main DB/session | none | exact Fellowship capabilities only | `FELLOWSHIP_APPLICATIONS_ENABLED` | exact capability and `fellowship.privileged-write` scope |
| Knowledge Graph | committed sources, graph/candidate/provenance records | candidate ledger; human-approved graph/provenance/audit only | Knowledge Graph APIs | main DB/session for staff writes | none | exact KG review capabilities; no auto-verify | deployment disable | exact capability and `knowledge-graph.privileged-write` scope |
| Search | static localized index and public graph projection | none | same-origin search index/API | none in browser | same-origin only | none | deployment rollback | no sensitive write capability; KG quarantine protects governed source changes |
| AI/RAG | public Knowledge Graph projection only | privacy-minimized query provenance/cost log | local deterministic provider | main DB/session; no external AI key | none in implemented mode | exact `civic:ai.rag.query` only | external provider remains disabled | quarantine `civic:ai.rag.query` or `ai.rag.query` write scope |
| Integrated Operations | allowlisted Membership/Publishing/Academy/Fellowship/KG projections | delegates to owned domain APIs only | same-origin protected domain APIs | main DB/session | none | no universal admin; links/actions require each exact grant | deployment rollback | quarantine each exact capability or owned write scope |
| Security Operations | repository/gate/health evidence | reports only; provider changes are manual owner actions | GitHub/Vercel/Neon/Auth0 when separately authorized | operator CLI credentials, never application code | justified provider endpoints | no application admin capability | stop workflow/revoke operator credential | provider-side credential revocation and workflow disable; repository cannot activate it |
| Research/ZK | wallet state, consent/eligibility; isolated verifier sees minimal proof/contribution | wallet records in main DB; verifier records in separate DB | wallet/issuer/verifier APIs | main DB, issuer key; isolated verifier DB/pepper/client config | no arbitrary runtime egress implemented | exact wallet capability; verifier client allowlist | final real-data gate | `SECURITY_FORCE_RESEARCH_FAIL_CLOSED`; exact Research capability quarantine |
| Credential issuance | verified member/wallet/device/eligibility/consent | short-lived challenge and canonical issuance audit | BBS/local cryptographic services | issuer private key and main DB | none | exact wallet target plus recent MFA | real-data gate | force Research closed or quarantine `civic:research.wallet.credential.issue` |
| Authentication | OIDC flow/session/identity/grants | auth flow, session, identity provisioning and audit | approved OIDC discovery/authorize/token/JWKS | OIDC client secret, session secret, main DB | approved OIDC issuer only | identity resolution; no domain decision authority | remove/disable provider configuration | provider-side client disable; no repository component-wide switch |
| Database | all main records; verifier DB is separately configured | transactional application writes | PostgreSQL TLS | scoped database URLs | Neon PostgreSQL only | DB role privileges external to app | provider connection revoke/branch isolate | Neon role/network isolation; shared main-runtime credential is residual risk |
| Background jobs | repository, deployment health and gate evidence | CI reports/artifacts; no business data mutation by default | GitHub/npm/site/OIDC health endpoints | CI/provider credentials only when explicitly configured | documented task-specific destinations | workflow permissions are read-only by default | disable workflow/revoke credential | GitHub/provider controls; no hidden in-app job runner |

## Synthetic isolation evidence

Tests verify that an AI capability cannot decide Membership, alter Governance
roles or issue Research credentials; Academy cannot read Fellowship operations;
Fellowship cannot issue Research credentials; and Governance authority cannot
cross into Civic Publishing. Existing Public API DTO tests exclude private ORM
objects and writes, Knowledge Graph tests retain human verification, and the
isolated verifier migration/runtime remains distinct from Membership storage.

## Egress inventory

| Destination | Caller | Purpose | State / restriction |
|---|---|---|---|
| configured OIDC issuer | Auth runtime and health check | discovery, authorization, token and JWKS | required; issuer is operator configuration |
| Neon PostgreSQL endpoints | main and isolated verifier runtimes | TLS database access | required; verifier URL is separate |
| Buttondown or Mailchimp | Newsletter route | consented newsletter subscription | disabled unless provider and legal gate are explicitly activated; provider is allowlisted in code |
| Google Fonts | Next build only | compile-time font assets | build-time network, not request-time application egress |
| npm/GitHub/Vercel/Neon/Auth0 | CI/operations tools | supply chain, deployment and controlled operations | operator/workflow context only, not public request handlers |

No external AI provider, analytics, object storage or webhook runtime is active.
Vercel network-level egress policy and separate per-component service identities
are external infrastructure capabilities and remain unverified.

