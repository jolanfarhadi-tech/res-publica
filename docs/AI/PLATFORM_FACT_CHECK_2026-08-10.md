# Independent Platform Fact Check — Pre-remediation

Date: 2026-08-10  
Scope: deployed Production first, then Vercel/provider configuration, database evidence, Git, tests, and source code  
Production deployment inspected: `dpl_DvaqWsnqcqepogEeh36PgjevWmPc`  
Deployed Git revision: `54eaa60de717e533a533214872763e8d52e7ab28`

This is the required pre-remediation record. It does not rely on prior session
summaries as proof. No finding was silently fixed while this evidence was being
collected.

## Classification

- **VERIFIED** — directly reproduced from Production, Git, executable tests, or
  current source.
- **PARTIALLY VERIFIED** — a real implementation exists, but an operational,
  authenticated, provider, or end-to-end property could not be fully proven.
- **UNVERIFIED** — claimed by documentation without sufficient independent
  evidence.
- **CONTRADICTED** — direct evidence disproves the claim.
- **NOT TESTABLE WITH CURRENT ACCESS** — the necessary owner/provider session or
  non-readable secret is unavailable.

## Evidence baseline

- Git: `codex/platform-phase-3` is synchronized with
  `origin/codex/platform-phase-3`; `origin/main` points to the same revision.
  Only the pre-existing unrelated `tsconfig.json` newline delta and untracked
  `tatus` are present.
- Vercel: authenticated read access found project `res-publica`
  (`prj_zivxMCHSLlTkr4V2xK91Cg2HnUXD`). The production alias
  `https://respublica-ev.de` resolves to the Ready deployment above. Its build
  log proves `main`, commit `54eaa60`, Next.js 15.5.22, and 122 generated pages.
- Production browser: `/de`, `/en`, and `/fa` render with correct language and
  direction; Persian is RTL; no horizontal overflow or browser console warning
  was observed; canonical and `de`/`en`/`fa`/`x-default` alternates exist.
- Production runtime: `/api/health/live` and `/api/health/ready` return 200;
  protected Operations, Dashboard, and Profile APIs fail closed anonymously.
- Tests: 81 files and 334 tests passed under pinned Node 20.20.2 with one worker
  thread. No `.skip`, `.todo`, `xit`, `xtest`, or `xdescribe` was found. The
  suite contains 938 assertions across 79 files, PGlite persistence integration
  tests, route contract tests, and mocked provider tests. Mocked provider tests
  are not treated as Production provider evidence.
- Local schema: all 19 main migration journal entries create 66 tables on a
  disposable fresh database; the isolated research-verifier migration creates
  6 tables. `drizzle-kit check`, structure, lint, typecheck, processing inventory
  (18 activities/66 tables), and `npm audit --omit=dev` all pass; the latter
  reports 0 known vulnerabilities.
- Production database: readiness proves the configured runtime can execute
  `select 1`. Vercel exposes sensitive variables only as non-decryptable
  placeholders to this CLI identity; no local `DATABASE_URL` or Neon API key is
  present. Therefore current Production migration/table/index/grant counts are
  not independently queryable in this audit. The temporary Vercel env file was
  deleted.
- Auth0: OIDC discovery, issuer, client ID, Authorization Code flow, PKCE S256,
  state, nonce, and production callback URL are verified from the live login
  redirect. Auth0 Management access is logged out, so allowed callback/logout/
  origin lists, MFA policy, security-event export, and tenant logs are not
  independently inspectable.

## Adversarial claim matrix

| Area / expected property | Actual evidence | Status | Severity |
|---|---|---|---|
| Exact Production revision is deployed | Vercel build log clones `main` at `54eaa60`; active alias resolves to the resulting Ready deployment | VERIFIED | — |
| Public DE/EN/FA site is operational | All three locales return 200; language, RTL, canonical, alternates, and no-overflow checks pass | VERIFIED | — |
| Production database connectivity | `/api/health/ready` executes `select 1` successfully | VERIFIED | — |
| Production has exactly 19 migrations and 66 tables | Repository and disposable database prove the intended state, but Production cannot be queried with current access | NOT TESTABLE WITH CURRENT ACCESS | High evidence gap |
| TLS, indexes, constraints, runtime grants, and least privilege are current in Production | Prior evidence files exist, but current direct database inspection is unavailable | UNVERIFIED | High |
| Production backup/restore is currently recoverable | A runbook, verifier, and dated evidence artifact exist; Neon state and recovery point cannot be independently inspected now; RPO/RTO remain unapproved | PARTIALLY VERIFIED | High |
| Auth0 runtime contract is correct | Discovery and live login redirect contract pass | VERIFIED | — |
| Auth0 administrative security configuration is complete | Management session unavailable; callback/logout/origin lists, MFA and event export cannot be inspected | NOT TESTABLE WITH CURRENT ACCESS | High |
| Shared authorization, exact scope, MFA, and separation of duties exist | Source and PGlite integration tests cover Membership, Governance, Publishing and Operations; anonymous Production boundaries fail closed | VERIFIED | — |
| Authenticated/MFA Production workflows work end to end | No controlled authenticated administrator session was available for this audit | NOT TESTABLE WITH CURRENT ACCESS | High |
| Canonical audit is append-only and atomic | Repository tests prove rollback, append-only persistence, and same-transaction state/audit behavior | VERIFIED | — |
| Academy is implemented | No Academy module, persistence, application service, API, member/ops UI, or `/de/academy`; Production returns 404. Only proposal/content references exist | CONTRADICTED | High |
| Fellowship workflows are implemented | No Fellowship module, persistence, application service, API, or `/de/fellowships`; Production returns 404. Public copy describes it as in development | CONTRADICTED | High |
| Knowledge Graph is operational | Deterministic in-process graph and tests exist; manifest routes are declarative and absent; Production `/api/knowledge-graph/search` returns 404; current real content yields zero declared entities | PARTIALLY VERIFIED | High |
| Grounded RAG is operational | Local deterministic keyword provider enforces citation-or-refuse and cost checks; no embedding, LLM provider, or HTTP RAG route exists; Production `/api/ai/rag` returns 404 | PARTIALLY VERIFIED | High |
| Public API v1 and public projection exist | No source route or DTO/projection package; Production `/api/public/v1` returns 404 | CONTRADICTED | High |
| Integrated Operations exists | Protected Membership and Publishing console exists at `/[locale]/operations`; Academy, Fellowship, graph, AI, public-API, and security operations are absent | PARTIALLY VERIFIED | High |
| Defensive Security Operations pipeline and Loops 1–5 exist | No security domain/module/API/UI for normalization, E0–E3 evidence, A/A′ actions, attribution, deception, quarantine, canaries, or rollback | CONTRADICTED | Critical against the new mandate |
| No hack-back boundary is preserved | No counter-intrusion implementation exists. New work is explicitly constrained to Res Publica-controlled infrastructure | VERIFIED | — |
| Research real-data gate is closed | Production has no `RESEARCH_*` variables; anonymous synthetic route fails closed; source requires all approvals; wallet UI removes mutation paths while closed | VERIFIED | — |
| ZK research wallet is Production-ready for real data | BBS credentials, local keys, recovery, project pseudonyms, isolated verifier, revocation and synthetic tests exist; external audit/legal gate and real-data activation remain closed | PARTIALLY VERIFIED | Critical external gate |
| Publishing no-auto-publish boundary holds | Ready state keeps `commitHash: null`; public frontend has no write calls; human scoped sign-off tests pass | VERIFIED | — |
| CI supply chain is hardened | Lockfile and dependency audit exist, but GitHub Actions use mutable `@v4` tags, the main CI job has no explicit least-privilege permissions, and no secret/SAST/provenance job is present | PARTIALLY VERIFIED | High |
| Runtime version is deterministic | `package.json` allows any Node `>=20.9.0`; Vercel currently selects Node 24 while tests require Node 20 to avoid the local PGlite/V8 failure | CONTRADICTED | High |
| Browser CSP is restrictive | Deployed CSP blocks objects, framing and foreign form targets, but omits `default-src`, `script-src`, `style-src`, `img-src`, `font-src`, and `connect-src` | PARTIALLY VERIFIED | High |
| DDoS/WAF configuration is known | Vercel confirms no custom firewall rules. Firewall overview is unavailable on the current plan; automatic mitigation state cannot be read without invoking a mutating command | NOT TESTABLE WITH CURRENT ACCESS | High |
| Public static core is CDN-cacheable | Production repeatedly returns `Cache-Control: private, no-cache, no-store` and `X-Vercel-Cache: MISS` for `/de`, despite static generation in build output | CONTRADICTED | Medium/High |
| EU-aligned application execution is configured | Vercel build/runtime evidence shows functions in `iad1`; no `preferredRegion`/region configuration exists. Database residency is documented as EU but not directly inspected in this audit | PARTIALLY VERIFIED | High privacy/performance |
| Central monitoring and durable security logs exist | Scheduled health workflow and structured `console.error` events exist; no verified alert recipient, central log retention, Auth0 export, SIEM, or security-event pipeline exists | PARTIALLY VERIFIED | High |
| Email/notification delivery is operational | Provider abstraction, idempotency and retry persistence exist; default provider is deliberately non-delivering and no Production provider is verified | PARTIALLY VERIFIED | Medium |
| Upload/media boundary is operational | No public upload or media persistence route exists, which is safe but not an implemented product capability | UNVERIFIED / unavailable | Low until required |
| Legal/privacy production approval is complete | DPIA, retention, DPA, audit erasure/pseudonymization, and named operational responsibilities remain draft/open in the gate register | CONTRADICTED | Critical external gate |
| EAO “100% / Go” means full platform production readiness | The report scans documentation connectivity and five narrow gates only; it misses the contradictions above and explicitly lacks a full governance audit | CONTRADICTED | High governance/tooling |

## Test-quality assessment

- Route tests mock authentication/runtime/application dependencies, which is
  appropriate for HTTP mapping but does not prove provider or Production E2E.
- PGlite integration tests independently exercise transactions, persistence,
  scope, MFA, separation of duties, audit rollback, research isolation, replay,
  revocation, and BBS cryptography.
- The Production health and membership E2E script unit tests use mocked fetch;
  the live HTTP/OIDC checks recorded above are therefore separate evidence.
- The restore-drill test uses a mocked query client and proves only fail-closed
  verifier logic; the dated restore evidence remains externally unverified in
  this audit.
- No skipped tests were found. The absence of Academy, Fellowship, Security,
  RAG, and Public API tests reflects missing implementations, not successful
  coverage.

## Ranked remediation programme

Ranking combines production risk, architectural importance, user value,
security impact, and maintainability. The owner-approved release sequence is
retained; it is not renamed as a new project phase.

1. **Release A — Core architecture and Academy.** Add bounded Academy domain,
   canonical references, migrations, application/API/member/operations surfaces,
   lifecycle, provenance, authorization, audit, and DE/EN/FA UI without making
   accreditation claims.
2. **Release B — Fellowships.** Add human-gated nomination/application/review/
   decision lifecycle with conflict declarations, recusal, separation of duties,
   exact scopes, and no rank/gamification semantics.
3. **Release C — Knowledge Graph and Search.** Make the accepted generic graph
   boundary real: owned schemas, candidate/human-verification path, provenance,
   deterministic rebuild, authorized APIs, and truthful public projection.
4. **Release D — Governed AI/RAG.** Add auth-before-retrieval, domain policy,
   citation/refusal, prompt-injection isolation, cost ceilings, and provider
   interfaces. External model activation remains closed without approved
   provider, DPIA, residency, credentials, and budget.
5. **Release E — Public API and Public Knowledge Projection.** Add explicit
   allowlisted DTOs, versioning, pagination, cache/ETag, rate limits, provenance,
   no private-table serialization, and cross-locale tests.
6. **Release F — Integrated Operations, content governance, observability, and
   security foundation.** Compose the new domains under exact capability/MFA
   controls and correct the narrow EAO readiness model.
7. **Mandatory hardening A–G.** Supply chain/Tier-0, privileged access/dual
   control, capability quarantine, endpoint resource controls, clean recovery,
   evidence-bounded technical attribution, then the allowlisted A/A′ defensive
   engine and synthetic Loops 1–5. All actions remain inside Res Publica-owned
   infrastructure; attacker-controlled input can never become executable code,
   SQL, shell, template, or model/tool commands.

## External stop conditions preserved

- No real research data or real ZK credential issuance until
  `RESEARCH_REAL_DATA_ACTIVATION_APPROVED` and every independent legal/security/
  operational approval is evidenced.
- No external AI provider activation without owner-approved provider, budget,
  EU processing terms, DPIA/DPA, credentials, and model/data policy.
- No paid-provider activation, destructive Production action, Production
  restore, or legal-text substitution without the required approval.
- Auth0 Management configuration, named incident/administration ownership,
  RPO/RTO, DPAs, retention, and AuditLog erasure/pseudonymization remain owner/
  legal work, not facts an implementation agent may invent.

## Post-audit remediation note — Release A Academy

The Academy contradiction recorded above has been remediated in the local
Release-A worktree. The repository now contains a bounded Academy module,
additive migration 0019, governed public/member/staff APIs, DE/EN/FA routes,
exact-scope MFA authority, shared rate limiting, atomic canonical audit, and
synthetic regression coverage. This note does not retroactively alter the
pre-remediation evidence in this report and does not claim Production
activation: migration 0019 is not applied to Production and real learner
writes remain closed by `ACADEMY_ENROLLMENT_ENABLED` plus OPEN-022/WARN-020.
