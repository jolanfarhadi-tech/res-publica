# Open Work — Evidence-Based Register

### OPEN-014 — Notification provider activation remains externally gated

**Status:** Delivery persistence, consent checks, idempotency, retries, and the
non-delivering adapter are implemented and locally verified. Real delivery is
intentionally disabled.

Activation requires an approved provider and DPA, credentials supplied outside
Git/chat, approved template content and legal basis, an operational worker
schedule, and authorization to apply migrations 0012–0013 to Production. No
public endpoint or provider was activated by the implementation slice.

### OPEN-013 — Resolved locally: protected self-facing Dashboard

**Status:** Implemented and fully locally verified on
`codex/platform-phase-2`; not pushed or deployed.

The Dashboard composes only the authenticated actor's account assurance,
Member Profile, consent receipts, event registrations, notifications, and
capability-derived actions. Consent mutation remains unavailable pending
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

### OPEN-011 — Production runtime configuration blocks deployment
- **Task:** configure the existing Vercel project `res-publica` for database
  readiness and protected OIDC authentication.
- **Evidence:** production has only `NEXT_PUBLIC_SITE_URL`;
  `https://respublica-ev.de/api/health/ready` returns 503 with
  `{"status":"not_ready","dependency":"database","configured":false}`.
- **Required values:** `DATABASE_URL`, `OIDC_ISSUER`, `OIDC_CLIENT_ID`, and
  `OIDC_REDIRECT_URI`; add `OIDC_CLIENT_SECRET` when the selected provider
  requires a confidential client.
- **Safe next action:** add verified values with
  `npx.cmd --yes vercel@latest env add <NAME> production --project res-publica`,
  then recheck readiness/auth before deploying the exact pushed commit.
- **Blocker:** production owner credentials and provider values; values must not
  be invented.

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
- **Prerequisite:** the first slice (ADR-034) is checked done in the same document — this is additive work, not a fix.
- **Blocker:** one item is explicitly blocked in the source document itself: *"Blocking on the future Civic Contribution Framework (CCF), not on this document"* — CCF does not yet exist / is not yet ratified.
- **Safe next action:** pick the next unchecked item that is *not* CCF-blocked (e.g., Payments/Notifications views over the already-implemented `Payment`/`Notification` entities) if this becomes the task focus.
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

### OPEN-007 — ADR-031 (Project ownership / cross-domain collaboration) implementation not confirmed
- **Task:** none active — verification gap, not a confirmed missing feature.
- **Evidence:** no `Project`-named entity found in `src/persistence/schema.ts` or `module-schema.ts` (both grepped for `pgTable` this session); no dedicated cross-domain-collaboration code path found distinct from the module manifest/registry system.
- **Prerequisite:** targeted search for "project ownership" concepts before concluding anything is missing.
- **Blocker:** none identified.
- **Safe next action:** if this becomes a task focus, search specifically for how ADR-031's concepts map to existing code before assuming greenfield work is needed.
- **Non-goals:** building new project-ownership infrastructure without first confirming none exists.

## Reserved decisions requiring a new ADR (explicitly not active engineering tasks)

### OPEN-008 — ADR-035 is reserved, not written
- **Evidence:** `architecture/adr/ADR-019-civic-intelligence-layer-and-knowledge-graph-relationship.md` reserves "Innovations 6/7 and new operational graph rules" for ADR-035; `brain/DECISIONS.md`'s ADR-035 row: *"no ADR file or decision exists yet... Status: Pending."* Directory listing confirms no `architecture/adr/ADR-035-*.md` file exists.
- **This is explicitly not a task.** Per the repository's own ADR Governance Workflow (Constitution §17, cited in `brain/DECISIONS.md`), building Innovations 6/7 or the reserved operational Governance/status/retention/withdrawal/deletion rules requires writing and accepting ADR-035 first — do not implement code against this reservation.

## Roadmap items not yet at build-ready depth (aspirational — not tasks)

Per `brain/ROADMAP.md` (read in full, prior session): Fellowship System, Academy, Speech Academy, Writing Academy, News Analysis Lab, Research Lab, Store, full Admin Portal (V2 tier), Public API (V3 tier) — explicitly deferred, no build-ready blueprint exists for any of these. **These are not active tasks** and should not be started without a scoping/blueprint pass first, per the roadmap's own explicit sequencing.

## CLA / contribution process

### OPEN-009 — CLA text not yet published
- **Evidence:** `CONTRIBUTING.md` (read in full): "The canonical CLA text will be published separately... contributions are accepted only by prior arrangement."
- **Safe next action:** none for an engineering agent — this is a legal/process artifact outside code scope.
- **Non-goals:** drafting CLA legal text as an engineering task.
