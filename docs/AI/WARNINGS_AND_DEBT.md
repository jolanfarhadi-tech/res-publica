# Warnings and Debt — Verified Risk Register

### WARN-026 — Repository supply-chain controls do not activate Tier-0 provider controls

- **Evidence:** CI now pins Actions, enforces least privilege and checks source,
  dependencies, secrets and CodeQL configuration. The Tier-0 inventory still
  identifies GitHub, Auth0, Neon, Vercel, secret-store and recovery controls
  whose settings and accountable owners cannot be proven from source.
- **Impact:** treating a green repository build as proof of branch protection,
  provider audit export, secret rotation or Production separation of duties
  would create an unverified control-plane trust claim.
- **Severity:** **High / supply-chain and privileged-control boundary**.
- **Safe handling:** complete OPEN-028 with provider evidence and named owners;
  retain immutable pins, read-only defaults, explicit allowlists and human
  approval for permanent containment or recovery decisions.

### WARN-025 — Integrated Operations is navigation, not universal authority

- **Evidence:** Release F derives its area list solely from active exact Civic
  grants at MFA assurance; each linked domain API independently reauthorizes
  the session actor. Academy aggregate reads require the dedicated exact
  `academy.operations.read:academy` grant.
- **Impact:** treating the Operations index as an administrator role, accepting
  wildcard/null targets, or authorizing a domain from a different domain's
  grant would expose private operational records.
- **Severity:** **High / privileged-access and data-minimization boundary**.
- **Safe handling:** retain server-derived area projection, exact targets, MFA,
  domain reauthorization and existing separation-of-duties/audit rules. EAO
  `No-Go` refers to full-platform activation and must not be relabelled as a
  general Production approval.

### WARN-024 — Public projection is not partner-platform activation

- **Evidence:** Release E adds only anonymous, read-only grounded Content Graph
  DTOs and no partner account, key, agreement, usage, embed or Event store.
- **Impact:** direct ORM serialization, private-table expansion, unsupported
  reuse/licensing claims or representing partner capabilities as active would
  violate Constitution §19 and the verified implementation boundary.
- **Severity:** **High / privacy, attribution and external-contract boundary**.
- **Safe handling:** retain DTO allowlists, public source URLs, rate limits and
  versioning; require explicit partner/legal/security/operational approval for
  every deferred capability.

### WARN-023 — Governed local retrieval is not external-AI activation

- **Evidence:** Release D adds the authenticated `/api/ai/rag` boundary and
  migration 0022, but the only accepted runtime provider is deterministic
  local keyword retrieval. External provider mode and Governance use cases
  throw before provider execution.
- **Impact:** describing the feature as LLM-generated RAG, activating a provider
  without approved DPIA/residency/security/budget/credentials, or broadly
  granting access would overstate capability and bypass accepted governance.
- **Severity:** **High / AI governance and privacy activation gate**.
- **Safe handling:** keep external provider mode closed; retain exact verified
  Civic scope, auth-before-retrieval, query-specific citation enforcement and
  privacy-minimized logs; apply migration/provision grants only through the
  normal approved Production process.

### WARN-022 — Knowledge Graph code completion is not Production activation

- **Evidence:** Release C adds additive migration 0021 and complete deterministic
  candidate/review/public-projection code, while Production remains 19
  migrations / 66 tables and ledger retention/operational grants are not
  approved.
- **Impact:** applying the migration or granting graph authority without named
  independent operators, retention/access rules and backup verification would
  cross the documented operational boundary.
- **Severity:** **Medium / operational and provenance governance gate**.
- **Safe handling:** deploy only through the verified migration process; keep
  rebuild and approval roles separate; expose only current public-eligible
  approved provenance; do not implement ADR-035-reserved deletion/lifecycle
  rules or activate an external AI provider here.

### WARN-021 — Fellowship code completion is not candidacy activation

- **Evidence:** Release B adds migration 0020, nine Fellowship tables and
  complete nomination/application/review/decision code, while the processing
  inventory keeps legal basis, retention and erasure null and real data false.
- **Impact:** enabling real candidacy processing without transparency,
  retention, named accountable operators and approved role scopes would cross
  the documented privacy and governance boundary.
- **Severity:** **High / privacy and institutional activation gate**.
- **Safe handling:** keep `FELLOWSHIP_APPLICATIONS_ENABLED` absent/false,
  deploy no public roster, seed no real candidates or Fellows, and complete
  OPEN-023 before activation.

### WARN-020 — Academy code completion is not learner-data activation

- **Evidence:** Release A adds migration 0019, 20 Academy tables and complete
  public/member/staff code, while `docs/privacy/PROCESSING_INVENTORY.json`
  leaves legal basis, retention and erasure null and declares real Academy
  learner data impermissible before `ACADEMY_ENROLLMENT_ENABLED` approval.
- **Impact:** enabling the flag or entering real learner/assessment data before
  transparency, retention and named operational ownership are approved would
  cross the documented privacy gate.
- **Severity:** **High / privacy and operational activation gate**.
- **Safe handling:** deploy the code with the flag absent/false, publish only
  reviewed source-grounded catalogue records, and complete OPEN-022 before
  enabling enrollment.

### WARN-018 — Proposed membership/wallet architecture is not Production approval

- **Evidence:** ADR-037 and ADR-038 are `Proposed`; the public privacy notice is
  already incomplete under WARN-016; AnonCreds v1.0 remains Draft and W3C BBS
  remains Candidate Recommendation Draft.
- **Impact:** deploying migrations does not authorize public self-registration,
  legal wording, research processing, recovery, proof issuance, or wallet
  verification.
- **Severity:** **High / architecture, legal, and security activation gate**.
- **Safe handling:** actual BBS issuance, selective disclosure, recovery,
  revocation and isolated verification now exist and are synthetic-tested.
  Retain every fail-closed flag, keep
  `RESEARCH_REAL_DATA_ACTIVATION_APPROVED` absent/false, and obtain the
  approvals and operational ownership listed in OPEN-020/021 before any real
  credential or contribution is processed.

### WARN-017 — Development lint chain retains an upstream advisory

- **Evidence:** after the Phase 0 P3 dependency patch,
  `npm run audit:production` reports zero vulnerabilities; full `npm audit`
  reports the `brace-expansion` resource-exhaustion advisory through nine
  ESLint-related development nodes.
- **Impact:** no affected package is installed in the Production dependency
  tree. The residual risk is limited to repository tooling processing
  developer-controlled glob patterns.
- **Severity:** **Low operational / upstream development debt**.
- **Safe handling:** retain the Production audit gate, do not run lint against
  untrusted repository content, and do not force `brace-expansion@5` into
  `minimatch@3` or ESLint 10 into plugins whose peer ranges stop at ESLint 9.
  Recheck on each dependency update.

### WARN-016 — Public privacy notice understates deployed processing

- **Evidence:** `datenschutz.md` states that no user profiles are formed and
  describes only hosting and email contact, while the deployed architecture
  includes Auth0 identity/session data, private membership/profile records,
  two ConsentRecords, event registration, authorization grants, rate limiting,
  canonical AuditLog, and Neon persistence.
- **Impact:** the public transparency text is technically incomplete.
- **Severity:** **High / legal publication gate**.
- **Safe handling:** an accurate implementation-backed replacement draft,
  processing inventory, retention matrix, and DPIA appendix exist under
  `docs/legal/` and `docs/privacy/`. Do not publish them or claim legal
  completeness until owner/legal review approves bases, periods, processor
  language, rights handling, and controller details.
- **Incremental control:** the machine-readable inventory and CI drift check
  now cover all 86 current PostgreSQL tables and require source evidence while
  rejecting non-null legal-basis, retention, or erasure conclusions. This
  improves technical completeness but does not resolve the publication gate.

### WARN-015 — Drizzle snapshot history skipped migrations 0008–0011

- **Evidence:** generating migration 0012 from the latest stored snapshot
  initially reproduced already-applied HARM and Publishing schema changes.
- **Impact:** unreviewed future generation can duplicate historical DDL even
  when `db:check` passes.
- **Severity:** **High / migration-generation hazard**.
- **Safe handling:** inspect every generated migration against the immediately
  preceding SQL chain. Migration 0012 was reduced to its single intended table
  and index; no historical migration was changed. The new 0012 snapshot records
  the current complete schema for subsequent generation.

### WARN-013 — Platform activation gates are not interchangeable with code completion

- **Evidence:** `SECURITY_LEGAL_GATE_REGISTER.md`; ADR-027 requires a real
  DPIA/security review before Production identity processing, ADR-029 keeps
  AuditLog pseudonymization legally gated, and ADR-034 authorizes only a
  read-only self-profile.
- **Impact:** implementing profile mutation or consent withdrawal without an
  accepted policy would cross explicit architecture and legal boundaries.
- **Severity:** **High / activation and architecture gate**.
- **Safe handling:** implement independent Phase 1 work, keep blocked
  capabilities unavailable, and do not represent draft legal material as
  approval.

### WARN-014 — Resolved: Production Auth0 callback configuration

- **Evidence:** live Auth0 discovery and login initiation now resolve through
  the approved EU tenant and exact
  `https://respublica-ev.de/api/auth/callback` with PKCE, state and nonce. The
  former `Callback URL mismatch` no longer occurs.
- **Remaining handling:** callback configuration is not proof of complete
  account/application/board operation. Use only the controlled synthetic E2E
  runbook and genuine MFA; never weaken OIDC or substitute caller-provided
  identity.

*Only verified risks with evidence. Being "incomplete" alone is not listed here unless it carries a specific, evidenced risk — see `OPEN_WORK.md` for incompleteness that is simply unfinished work.*

---

### WARN-001 — Resolved: Publishing Authority is committed
- **Evidence:** commit
  `09c160bb7e56a7bd9e5b9039e2f12de49ae727bf`
  (`feat: complete Publishing Authority backend`).
- **Remaining handling:** preserve this as the stable backend boundary; do not
  rewrite it while integrating the later frontend commit `afa2207`.

### WARN-011 — Legacy/demo MDX lacks publication provenance
- **Evidence:** existing collection entries do not contain the explicit
  `visibility`, `reviewed`, and `source` fields required by the public loader.
- **Impact:** entries are intentionally absent from indexes, details, search,
  RSS, generated static params, and sitemap until reviewed.
- **Severity:** **Low / intentional safeguard**.
- **Safe handling:** do not bypass the loader or bulk-mark entries public.
  Confirm provenance, authorship, dates, claims, and publication rights first.
- **Incremental status 2026-07-29:** `harm-research` is the only newly public
  exception and carries explicit public visibility, review, and canonical
  source in DE/EN/FA. All other unreviewed legacy/demo collection content
  remains suppressed.

### WARN-012 — Resolved: Production database and OIDC variables configured
- **Evidence:** canonical Vercel project `res-publica` serves commit `7d2bb07`;
  `/api/health/ready` returns `200`; Neon has 19 migrations and 66 tables; the
  required OIDC variable names are present without values being recorded; and
  the callback mismatch is resolved.
- **Remaining handling:** configured variables and valid initiation do not
  prove authenticated Membership or MFA board E2E. Do not record values or
  claim that unperformed operational verification passed.

### WARN-002 — Five stale worktree-agent branches
- **Evidence:** `git branch -a` lists `worktree-agent-{a41b2f98bb4889568,ac265ef0dcfbd1d11,aca5f3876aea4f4e9,adee0af9fffa74fc8,afb36aeffa2f75bec}`, all physically backed by `.claude/worktrees/agent-*/` directories (`git worktree list`, prior session). **Directly verified this session:** all five are at commit `af64931` with zero commits ahead of `main` (`git log main..<branch>` empty for each).
- **Impact:** low — these are inert, contain no unique work, and do not affect build/CI. Mild repository clutter only.
- **Severity:** **Low**.
- **Safe handling:** do not delete without the repository owner's explicit instruction — this documentation task is read-only and does not authorize branch/worktree deletion.
- **Resolution condition:** repository owner runs `git worktree remove` and `git branch -D` for each, at their discretion, outside any documentation task.

### WARN-003 — The `tatus` file (root-level, untracked)
- **Evidence (read-only inspection, this session and the prior one):** `tatus`, 6491 bytes, sits at the repository root, untracked (`git status --short` shows `?? tatus`). Its content (first ~40 lines read) is plain-text, ANSI-color-coded `git log` output — specifically `git log --oneline --decorate` style output showing commits from `3b5fbe9` ("Snapshot Bevor Codex changes") backward, i.e., a snapshot of `main`'s history from before the 2026-07-19 module sprint completed. **No Git history or terminal evidence in this repository directly explains how this file was created** — it is not the output of any tracked script or commit; its content is consistent with a shell redirection mistake (e.g., a `git log` command whose intended output filename was truncated), but this is an inference, not a confirmed fact.
- **Impact:** none to build, tests, or application behavior — it is not imported, referenced, or read by any code or script found this session. Purely a stray artifact.
- **Severity:** **Low / informational**.
- **Safe handling:** **do not delete, rename, truncate, or `git add` it.** Leave it exactly as found.
- **Resolution condition:** repository owner confirms its origin and decides whether to remove it — outside the scope of any documentation-only task.

### WARN-004 — Resolved: Membership README reflects accepted shared auth
- **Evidence:** `src/modules/membership/README.md` now records ADR-027 as
  accepted, names `src/auth/` as the shared implementation, and preserves
  Membership's non-ownership/session-derived actor boundary.
- **Resolution condition:** satisfied; future auth state changes still require
  source/ADR verification rather than relying on cross-module summaries alone.

### WARN-005 — Resolved: Production baseline synchronized to remote main
- **Evidence:** local `main`, `origin/main`, and the release branch were all
  verified at deployed commit `fc09d8d` before subsequent local slices began.
- **Remaining handling:** newer local commits remain ordinary unpublished work
  until their own verification and approved push; this is not the historical
  `5212636` divergence.

### WARN-006 — Resolved 2026-07-24: migration `0011` verified against a fresh database
- **Evidence:** `npm run db:check` passed. `npm run db:check:fresh` applied 12 journaled migrations and created 53 tables.
- **Remaining handling:** migration `0011` is committed at `09c160b`; CI will
  independently re-run both checks after a future approved push/PR.
- **Resolution condition:** satisfied for local verification; CI will independently re-run both checks after a future approved push/PR.

### WARN-007 — Confirmed: ADR-031 is accepted but unimplemented
- **Evidence:** targeted schema, module, service, route, and identifier searches
  found no Civic `Project` aggregate or Governance reference contract; see
  `OPEN_WORK.md` OPEN-007.
- **Impact:** acceptance settles ownership but supplies no build-ready fields,
  lifecycle, capabilities, persistence, or API contract.
- **Severity:** **Medium / architecture scope required**.
- **Safe handling:** do not infer the domain aggregate from public project
  content or invent an implementation before its Civic contract is accepted.

### WARN-008 — Resolved: `docs/source/communication/` committed separately
- **Evidence:** commit `890f97f` includes both communication documents. They are no longer untracked and are outside the Publishing Authority commit boundary.
- **Resolution condition:** satisfied; no Publishing action required.

### WARN-009 — Two Foundation-era documentation artifacts have no surviving original text
- **Evidence:** `brain/PROJECT_BRAIN_STATUS.md` §3 — the Engineering/Security Audit report and the 9-stage Experience Blueprint originals do not exist anywhere in this repository, only compressed summaries.
- **Impact:** any future work citing "the audit" or "the experience blueprint" for exact detail cannot do so — only the summary-level facts in `brain/CHANGELOG.md`/`FOUNDATION_REVIEW_FINAL.md` are available.
- **Severity:** **Low** — a permanent, already-accepted documentation gap, not a live blocker for any currently-active engineering task.
- **Safe handling:** cite only the surviving summaries; do not present a regenerated version as the original (see `OPEN_WORK.md` OPEN-002).
- **Resolution condition:** either the original text is located, or stakeholders formally accept the summary as the permanent record (both outside this task's scope).

### WARN-010 — Environment-dependent behavior: local dev database differs from production
- **Evidence:** `@electric-sql/pglite` (in-memory/embedded Postgres) for local dev vs. `pg` (real Postgres) in production, per ADR-010 and `package.json` dependencies.
- **Impact:** standard, accepted risk class for offline-first architectures — behavior differences between `pglite` and a real Postgres instance (extensions, exact query planner behavior) are possible in principle. No specific incident evidencing an actual divergence was found this session.
- **Severity:** **Low** (architectural pattern is deliberate and documented, not an oversight) — flagged for awareness, not as a defect.
- **Safe handling:** do not assume local-dev test passes guarantee identical production-database behavior for anything exercising Postgres-specific features.
- **Resolution condition:** none required — this is accepted, documented architecture (ADR-010), not unresolved debt.

---

## Not included here (evidence insufficient to call these verified risks)

### WARN-019 — Research wallet is reviewable but not approved for real data
- **Evidence:** actual BBS proof and verifier tests pass with synthetic data;
  ADR-038, the threat model, internal DPIA and security review identify absent
  independent review and residual timing/cohort risks.
- **UI containment 2026-08-10:** the protected Dashboard derives Wallet
  activation availability from the existing server-side approval gate. While
  closed, no activation, recovery, upload or revocation control is rendered and
  no browser wallet storage is inspected.
- **Impact:** activating real issuance/intake could expose members to
  reidentification or unreviewed cryptographic/operational risk.
- **Severity:** **High while the final gate is closed; prohibited if bypassed.**
- **Safe handling:** deploy code only with
  `RESEARCH_REAL_DATA_ACTIVATION_APPROVED` unset/false; use synthetic smoke only;
  never describe the system as anonymous.
- **Resolution:** all OPEN-020 evidence is approved and recorded by accountable
  owners, followed by an explicit activation change.

- **GitHub integration / permissions blockers** — no evidence found either way this session; not listed as a risk without evidence.
- **Deprecated terminology still in active use** — the only confirmed terminology retirement (`Validation Framework` → retired, per commit `83cde16`) appears fully applied per that commit's own message ("synchronize repository architecture"); no residual usage was found this session, so this is not listed as an active risk. If a future search finds lingering references, add them here with citations.
