# Open Work — Evidence-Based Register

### OPEN-024 — Knowledge Graph Production migration and operational retention

- **Implemented locally:** additive migration 0021; deterministic rebuild and
  content digest; candidate/human-review separation; exact-scope MFA; domain
  boundaries; atomic graph/provenance/audit persistence; bounded public APIs;
  DE/EN/FA search enrichment and Operations UI.
- **Production status:** migration 0021 is not applied; Production remains at
  19 migrations / 66 tables and no Release-C code is deployed by this slice.
- **External/operational follow-up:** authorize Production migration after the
  standard backup/recovery verification; grant named independent operators the
  exact rebuild/read/candidate capabilities; approve retention/access rules for
  build, candidate and provenance ledgers; maintain editorial source-eligibility
  review.
- **Boundary:** no external AI provider is required or activated. ADR-035's
  reserved HARM graph lifecycle/deletion rules remain unavailable.

### OPEN-023 — Fellowship operational and real-data activation

- **Implemented locally:** additive migration 0020; governed role scopes;
  staff nomination and voluntary self-application; qualitative evidence;
  exact reviewer assignment; conflict declaration and recusal; human review;
  independent decision; private status/record views; DE/EN/FA public,
  dashboard and Operations surfaces; canonical audit and shared rate limits.
- **Deliberately absent:** scores, ranks, badges, leaderboards, automatic
  thresholds, public candidate/Fellow directories, invented Fellows, cohorts,
  dates, role assignments or programme claims.
- **External activation blockers:** approved candidate transparency and legal
  basis; retention/erasure and access rules; named nominators, reviewers,
  deciders and sponsors; approved real role scopes/source rights; Production
  migration authorization and backup verification; and explicit approval to
  set `FELLOWSHIP_APPLICATIONS_ENABLED=true`.
- **Operational follow-up:** existing accounts need an approved, audited
  backfill/provisioning path for the new self-service grants before activation.
- **Boundary:** code and truthful generic programme information may be
  deployed while all real candidacy writes remain closed.

### OPEN-022 — Academy enrollment activation and approved content

- **Implemented locally:** additive Academy persistence and migration 0019;
  governed programme/course publication; public/member/staff APIs and
  DE/EN/FA routes; public/member/invitation/application enrollment policies;
  progress; human assessment review; completion issue/revocation/verification;
  canonical audit; exact-scope MFA staff authority; and distributed abuse
  protection.
- **Deliberately absent:** invented courses, dates, cohorts, instructors,
  accreditation, credentials or completion claims. Public catalogue output is
  sourced only from records that complete the governed publication lifecycle.
- **External activation blockers:** approved learner privacy notice and legal
  basis; retention/erasure decisions; named Academy editor/reviewer/publisher
  and enrollment operators; approved actual curricula and source rights;
  Production migration authorization/backup verification; and an explicit
  owner decision to set `ACADEMY_ENROLLMENT_ENABLED=true`.
- **Boundary:** public catalogue and internal code may be deployed while
  learner writes remain closed. Do not activate enrollment or seed real learner
  data merely because migration 0019 and the UI exist.

### OPEN-020 — Membership application architecture and public wording approval
- **Implemented and deployed:** proposed ADR-037, verified-signup intent,
  application persistence, versioned acknowledgements, MFA/exact-scope board
  decision, status UI, and additive migrations 0014–0018. Production contains
  19 migrations and 66 tables.
- **Implemented in the bounded-administration slice:** a protected Membership
  queue/detail interface displays only exact-target assignments, keeps
  research readiness outside board review, and reuses the existing atomic
  approve/reject service. It creates no broad administrator authority.
- **External blockers:** ADR acceptance; approved privacy/retention wording; a
  confirmed versioned membership/contribution regulation if one is to be
  required; board reviewer/grant administration; Auth0 verification-email
  policy; an approved email-delivery provider for decision notifications; and
  a controlled authenticated Production E2E using genuine Auth0 email
  verification plus board MFA.
- **Boundary:** the signed Satzung exists and is hash-versioned. No separate
  membership regulation was found, so none was invented or required.

### OPEN-021 — Research wallet cryptographic activation
- **Implemented and deployed behind a closed gate:** local wallet custody and
  recovery, BBS issuance/selective disclosure, per-project holder proofs,
  revocation, a separate verifier, anonymous intake, duplicate prevention,
  redaction and synthetic smoke. This is reviewable implementation evidence,
  not acceptance or real-data approval.
- **Blockers:** ADR-037/038 acceptance; independent cryptographic, penetration
  and reidentification reviews; DPO/legal DPIA; lawful basis, transparency,
  retention/erasure and DPAs; issuer/verifier/key-custody, incident-response
  and per-project protocol owners; and explicit acceptance of the bounded
  15-minute revocation window.
- **Boundary:** `RESEARCH_REAL_DATA_ACTIVATION_APPROVED` remains absent/false.
  No real credential or real research contribution may be processed and no
  complete-anonymity claim is made.

### OPEN-019 — Phase 0 P3 Persian Open Graph prebuild uses an approved neutral fallback

**Status:** Resolved temporarily by explicit owner decision on 2026-07-30.
DE and EN retain localized generated cards. FA keeps its localized HTML title
and description but resolves to a prebuilt, language-neutral Res Publica card
containing only the approved visual identity, Latin brand name, and neutral
graphics. No Persian text is passed to ImageResponse/Satori.

This is the accepted deployment-safe resolution for P3 milestone 20 on the
current Next 15 line. Tests cover all three locale metadata boundaries and
non-empty image URLs; the Production build prebuilds all three image routes,
and local HTTP verification returns `200 image/png` for each. Revisit only
when a repository-owned Persian-capable renderer/font path with verified
license provenance is available. Until then, localized Persian HTML metadata
must remain in place and the neutral FA image must not be replaced by English
marketing copy.

## Safe implementation programme boundary reached

Phase 1–3 work that can be completed without inventing authority, activating a
provider, changing Production, or bypassing legal/safeguarding gates is
implemented and locally verified. Remaining work in this register requires
owner-side configuration, credentials, provider/DPA selection, accepted
architecture, legal approval, named responsibility, or Production migration
authorization. Advanced capabilities remain absent or server-disabled rather
than represented as operational.

### OPEN-018 — Development-only dependency advisory awaits compatible upstream

**Status:** Production dependencies are audit-clean. The remaining full-tree
`npm audit` finding is the current `brace-expansion` denial-of-service advisory
propagated through nine ESLint-related development nodes.

The patched `brace-expansion` major changes its CommonJS API and cannot safely
replace the version consumed by `minimatch@3`. ESLint 10 is not yet accepted by
the React/import/accessibility plugins shipped with the compatible Next 15
lint configuration. A Next 16 migration would additionally collide with
ADR-012's explicit root-`proxy.ts` boundary. Keep `npm run audit:production`
mandatory—the existing CI workflow now enforces it after `npm ci`—and
re-evaluate when the compatible ESLint/plugin chain receives an upstream patch
or an approved framework/ADR migration is available.

### OPEN-017 — Newsletter activation remains externally gated

**Status:** Default-deny server activation, explicit versioned consent, trusted
origin, and shared PostgreSQL abuse protection are implemented and locally
verified. The public form stays hidden while disabled.

Activation still requires an approved provider and DPA, legal basis and
approved text, retention/withdrawal operations, owner responsibility,
and credentials outside Git/chat. Migration 0012 is applied in Production;
no provider or newsletter activation setting was enabled.

### OPEN-016 — HARM operations safely disabled pending activation approval

**Status:** Resolved in code for default safety. All existing Governance writes
are server-disabled unless `HARM_OPERATIONS_ENABLED=true`.

Activation remains open and must not occur until secure evidence/case storage,
safeguarding, DPIA/DPA and retention rules, named administration and incident
ownership, Auth0 MFA, and operational approval are
verified. This implementation did not set the variable or change any external
service.

### OPEN-015 — Resolved in code: governed Publishing operations workflow

**Status:** The exact-scope, MFA-protected, role-filtered workspace now has a
localized internal client for all seven accepted ADR-036 workflow actions.
The client reuses the existing protected route and does not change its
authorization, persistence, audit, provenance or separation-of-duties rules.

The lifecycle ends at `ready` with `commitHash: null`. There is deliberately no
UI or unattended worker for public files, Git, deployment, `published` or
`archived`; those remain separate explicit repository/release actions.
Operational use still requires real staff appointments, exact grants and MFA.

### OPEN-014 — Notification provider activation remains externally gated

**Status:** Delivery persistence, consent checks, idempotency, retries, and the
non-delivering adapter are implemented and locally verified. Real delivery is
intentionally disabled.

Activation requires an approved provider and DPA, credentials supplied outside
Git/chat, approved template content and legal basis, an operational worker
schedule. Migration 0013 is applied in Production; no public delivery endpoint
or provider was activated.

### OPEN-013 — Resolved and deployed: protected self-facing Dashboard

**Status:** Implemented, verified, and deployed. The public page renders its
anonymous state while `/api/dashboard` and `/api/membership/profile` return
private `401` responses without a valid session.

The Dashboard composes only the authenticated actor's account assurance,
Member Profile, consent receipts, self-only allowlisted payments, event
registrations, notifications, and capability-derived actions. Consent
mutation remains unavailable pending
ADR-035 and legal approval. Production activation remains subject to the OIDC,
MFA, migration, legal, and operational gates in
`SECURITY_LEGAL_GATE_REGISTER.md`.

## Active platform implementation programme

### OPEN-012 — Phase 1 operational foundation

- **Task:** execute the bounded Phase 1 slices in
  `PLATFORM_IMPLEMENTATION_PROGRAMME.md`.
- **Completed first slice:** anonymous `/api/platform/modules` no longer
  exposes internal or merely declarative manifest metadata.
- **Completed security slices:** authentication request diagnostics, hardened
  response headers, and shared PostgreSQL rate limiting for login, membership
  creation, event registration, and all Governance/Publishing privileged
  writes.
- **Completed event backend slice:** authenticated owner cancellation now
  atomically persists cancellation, waitlist cleanup/promotion, notification,
  and audit evidence.
- **Completed event frontend slice:** DE/EN/FA interaction states now cover
  success, waitlist, cancellation, login, duplicate, unavailable, and error.
- **Still open for Events acceptance:** end-to-end browser coverage requires
  an independently approved event record; truthful empty-state policy remains
  in force and no event was fabricated for testing.
- **Architecture gates:** ADR-034 permits read-only self-profile only; consent
  withdrawal/pseudonymization remains blocked by the absent ADR-035 and the
  legal gate preserved in ADR-029.
- **External blocker:** Auth0 currently rejects the configured Production
  redirect URI with `Callback URL mismatch`.
- **Operational drafts completed:** production health monitor; incident,
  restore, identity-provisioning and Vercel-consolidation runbooks; processing
  inventory, retention matrix, DPIA technical appendix, privacy replacement
  and service-rules assessment drafts.
- **Owner/legal actions still open:** assign operational roles, perform and
  evidence an isolated restore drill, approve RPO/RTO and retention decisions,
  retain provider DPAs, approve the real DPIA, and review the replacement
  privacy notice before public publication.

*Only items with direct evidence of being unfinished. Aspirational ideas and reserved ADRs are listed separately (§"Reserved decisions") and are explicitly **not** active engineering tasks.*

---

## Active worktree work

### OPEN-001 — Resolved: Publishing Authority committed
- **Resolution:** committed at `09c160bb7e56a7bd9e5b9039e2f12de49ae727bf`
  (`feat: complete Publishing Authority backend`). The frontend treats this
  commit as a stable boundary.

### OPEN-010 — Frontend owner decisions before public launch
- **Task:** confirm any real identities, partnerships, contact route,
  newsletter provider, and collection entries intended for publication.
- **Evidence:** placeholder people/partners and unreviewed MDX were removed
  from public rendering; contact and newsletter now show truthful unavailable
  states when no confirmed delivery path is configured.
- **Safe next action:** provide explicit provenance and publication approval.
  For collection entries, add `visibility: public`, `reviewed: true`, and a
  non-empty `source` only after review.
- **Blocker:** owner authorship/approval; it does not block review of the
  implemented website architecture.
- **Incremental status 2026-07-29:** HARM is now the one explicitly reviewed
  and provenance-gated public project in DE/EN/FA. Team identities,
  partnerships, publications, events, research entries, and news remain
  suppressed until independently approved. Contact remains a truthful email
  action and no research-participation intake form is exposed because no
  verified receiving workflow, collection purpose, retention path, or consent
  record exists.

### OPEN-011 — Production runtime deployed; authenticated operational E2E remains open
- **Resolved:** the canonical Vercel project `res-publica` has its verified
  Production database and OIDC variable names. The exact committed release is
  deployed, database readiness returns `200`, and Production has 19 migrations
  and 66 tables. Auth0 discovery and login initiation use the approved EU
  tenant, exact callback, PKCE, state and nonce; the prior callback mismatch is
  resolved.
- **Remaining blocker:** complete the read-only controlled Membership E2E with
  an owner-approved synthetic Auth0 session and complete a separate genuine-MFA
  board boundary check. No session cookie or test identity is stored in Git.
- **Safe next action:** use
  `docs/operations/MEMBERSHIP_PRODUCTION_E2E.md`; never introduce an auth or MFA
  bypass for automation.

## Documentation gaps

### OPEN-002 — Two Foundation-era source artifacts have no surviving original text
- **Task:** none actionable without new information — this is a documented, accepted content gap, not a task to "fix" by writing replacement text.
- **Evidence:** `brain/PROJECT_BRAIN_STATUS.md` §3 (read in full, prior session): neither the original Engineering/Security Audit report nor the original 9-stage Experience Blueprint survives anywhere in this repository; only compressed summaries in `brain/CHANGELOG.md` and `FOUNDATION_REVIEW_FINAL.md` remain.
- **Prerequisite:** locating the original text externally, or an explicit stakeholder decision to accept the compressed summary as the permanent record.
- **Blocker:** no such decision or located text exists in this repository as of this compilation.
- **Safe next action:** do nothing without a human decision. **Do not regenerate this content from scratch and present it as the migrated original** — `brain/PROJECT_BRAIN_STATUS.md` §3 explicitly calls this "regeneration, not migration."
- **Non-goals:** writing a new audit report or a new experience-journey narrative under either document's name.

### OPEN-003 — Resolved: `docs/source/communication/` is committed separately
- **Evidence:** commit `890f97f` includes `brand-identity.md` and `pitch-arsenal.md`; they are no longer untracked and are outside the Publishing Authority commit boundary.
- **Resolution:** no Publishing action required.

## Technical debt (see `WARNINGS_AND_DEBT.md` for the full risk register; cross-listed here only where it constitutes unfinished work, not merely risk)

### OPEN-004 — Member Profile: unchecked TODO items in the canonical spec
- **Task:** the specific unchecked items in `docs/source/projects/MEMBER_PROFILE.md`'s own TODO list.
- **Evidence:** direct quotes, read in full: unchecked items include the Codex Potential/Hearing Candidate approval workflow and consent-capture UX, integration with `RESPONSIBILITY_EVIDENCE_MODEL.md` §6, "Next Recommended Steps" generation logic, remaining Identity view fields, Community Participation/Systems views, Application History view, Payments/Notifications views.
- **Incremental status 2026-07-29:** purpose-scoped consent capture for initial
  Membership/profile creation is implemented and locally verified. This does
  not complete or authorize the distinct Codex Potential/Hearing Candidate
  disclosure workflow or its Governance-sensitive consent.
- **Incremental status 2026-08-04:** the deployed protected Dashboard now
  completes the Payments/Notifications view with a self-only, allowlisted
  Payment projection. Provider references and other people's records are
  excluded at the query/projection boundary; no provider or mutation was
  activated.
- **Incremental status 2026-08-10:** the existing Membership Application is
  now represented in the protected Profile as a self-only history containing
  requested tier, status and submission/decision timestamps. Contact/address,
  decision actor, audit references and board deliberation are excluded. This
  completed only the implemented Membership Application source at that time.
  Academy and Fellowship now have separately owned, governed application
  models; Volunteer and Project applications remain absent.
- **Prerequisite:** the first slice (ADR-034) is checked done in the same document — this is additive work, not a fix.
- **Blocker:** one item is explicitly blocked in the source document itself: *"Blocking on the future Civic Contribution Framework (CCF), not on this document"* — CCF does not yet exist / is not yet ratified.
- **Safe next action:** map remaining Identity fields to implemented and
  ADR-permitted sources. Academy and Fellowship history must be projected from
  their owning modules; do not invent absent Community, Volunteer or Project
  application/status models.
- **Non-goals:** defining a new Contribution Record Lifecycle, Membership taxonomy, or any of the six explicitly-unratified "Community Systems" wishlist items (AI Mentor, Skill Graph, etc.) — the source document explicitly forbids treating those as buildable without their own future ADR.

### OPEN-005 — AI Layer external provider not started
- **Task:** none active — explicitly deferred.
- **Evidence:** `src/modules/ai-layer/README.md`, direct quote: *"Real external provider (grounded RAG, embeddings, LLM calls) is separate, later, infrastructure-dependent work — not started."*
- **Prerequisite:** infrastructure decision (which LLM/embedding provider, cost model) not evidenced anywhere in this repository.
- **Blocker:** infrastructure dependency, per the module's own README.
- **Safe next action:** none until a provider decision is made; the `AIProvider` interface (`src/modules/ai-layer/types.ts`) is already the documented extension point.
- **Non-goals:** implementing a real LLM call without a prior infrastructure/cost decision.

### OPEN-006 — Resolved: ADR-029 explicitly has no event bus in M1
- **Evidence:** ADR-029 was read in full on 2026-07-24 and explicitly states “No event bus in M1.” The implemented canonical append-only audit repository is the accepted M1 boundary.
- **Resolution:** absence of an event-bus dependency or implementation is conformant, not unfinished work. Do not build one as part of M1 Publishing.

### OPEN-007 — ADR-031 Project lifecycle is confirmed unimplemented and not build-ready
- **Evidence:** targeted source, schema, route, module, and identifier searches
  found no `Project` aggregate, Project table, Civic lifecycle service, or
  Governance reference contract. Existing public project pages are
  provenance-gated content collections, not the ADR-031 domain aggregate.
- **Architecture state:** ADR-031 settles ownership and cross-domain rules but
  deliberately adds no fields to the locked Core Domain Model. No accepted
  implementation blueprint defines Project attributes, lifecycle states,
  authorization capabilities, persistence, or APIs.
- **Blocker:** a concrete Civic-owned Project aggregate/application blueprint
  and its accepted authority/persistence contract are required before code can
  be written without inventing architecture.
- **Safe next action:** owner/architecture scoping of that implementation
  contract; do not infer it from the public `/projects` content collection.

## Reserved decisions requiring a new ADR (explicitly not active engineering tasks)

### OPEN-008 — ADR-035 is reserved, not written
- **Evidence:** `architecture/adr/ADR-019-civic-intelligence-layer-and-knowledge-graph-relationship.md` reserves "Innovations 6/7 and new operational graph rules" for ADR-035; `brain/DECISIONS.md`'s ADR-035 row: *"no ADR file or decision exists yet... Status: Pending."* Directory listing confirms no `architecture/adr/ADR-035-*.md` file exists.
- **This is explicitly not a task.** Per the repository's own ADR Governance Workflow (Constitution §17, cited in `brain/DECISIONS.md`), building Innovations 6/7 or the reserved operational Governance/status/retention/withdrawal/deletion rules requires writing and accepting ADR-035 first — do not implement code against this reservation.

## Roadmap items not yet at build-ready depth (aspirational — not tasks)

Per `brain/ROADMAP.md` (read in full, prior session): Speech Academy, Writing
Academy, News Analysis Lab, Research Lab, Store, full Admin Portal (V2 tier)
and Public API (V3 tier) remain deferred in that roadmap. Academy and
Fellowship were subsequently scoped and implemented under owner-approved
Releases A and B; this historical roadmap paragraph no longer describes those
two modules as absent.

## CLA / contribution process

### Additional evidence for OPEN-021 — External approval for real research credentials and contributions
- **Implemented:** local wallet custody/recovery, BBS issuance and selective
  disclosure, project holder proof, separate verifier persistence, anonymous
  intake, duplicate prevention, redaction and synthetic smoke.
- **Closed runtime gate:** `RESEARCH_REAL_DATA_ACTIVATION_APPROVED` must remain
  absent/false.
- **External blockers:** ADR-037/038 acceptance; independent cryptographic,
  penetration and reidentification reviews; DPO/legal DPIA; lawful basis,
  transparency, retention/erasure and DPAs; issuer/verifier/key-custody,
  incident-response and per-project protocol owners; explicit decision on the
  bounded 15-minute revocation window.
- **Safe work completed:** internal DPIA/security drafts and external audit
  package. Do not infer approval from their existence.

### OPEN-009 — CLA text not yet published
- **Evidence:** `CONTRIBUTING.md` (read in full): "The canonical CLA text will be published separately... contributions are accepted only by prior arrangement."
- **Safe next action:** none for an engineering agent — this is a legal/process artifact outside code scope.
- **Non-goals:** drafting CLA legal text as an engineering task.
