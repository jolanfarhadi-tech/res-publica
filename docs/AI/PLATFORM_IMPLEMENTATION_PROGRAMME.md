# Platform Implementation Programme

Status: Active implementation programme  
Base commit: `6805f787e5525267496ef11db24c6db288f2b535`  
Implementation branch: `codex/platform-phase-1`

This programme converts the approved three-phase mandate into bounded,
reviewable vertical slices. It does not replace accepted ADRs, constitutional
domain ownership, or the repository memory system.

## 1. Dependency graph

```text
Accepted ADRs and constitutional domain boundaries
  |
  +-- Shared authentication and authorization
  |     +-- identity provisioning
  |     +-- verified sessions and MFA
  |     +-- capability grants
  |     +-- membership, profile, events, admin, HARM and publishing
  |
  +-- Canonical persistence and atomic AuditLog
  |     +-- consent history
  |     +-- event registration/cancellation
  |     +-- notifications and delivery attempts
  |     +-- rate limiting and operational state
  |     +-- content provenance
  |
  +-- Privacy and security gates
  |     +-- accurate legal drafts and processing inventory
  |     +-- retention/erasure approval
  |     +-- incident response and monitoring
  |     +-- provider activation
  |
  +-- Phase 1 operational foundation
        |
        +-- Phase 2 dashboard and bounded administration
        |     +-- governed content operations
        |     +-- transactional email and notifications
        |     +-- consent-gated analytics
        |
        +-- Phase 3 disabled advanced capabilities
              +-- secure media/files
              +-- community and CRM
              +-- bounded knowledge graph and AI
              +-- HARM operational UI
              +-- programmes and impact reporting
```

Critical path:

1. Correct authentication configuration and identity provisioning.
2. Preserve canonical actor, authorization, consent, and audit boundaries.
3. Complete membership/profile/events only within accepted ADR scope.
4. Add operational security, resilience, and truthful module exposure.
5. Activate Phase 2 only after Phase 1 foundations are stable.
6. Keep Phase 3 server-disabled until its provider and governance gates pass.

## 2. Branch and commit strategy

- Phase 1 branch: `codex/platform-phase-1`.
- Phase 2 and Phase 3 receive separate branches after the previous phase has a
  stable, reviewed commit boundary.
- Each vertical slice gets one atomic commit containing implementation, tests,
  migration (if any), and only the relevant incremental memory updates.
- No commit may include the unrelated `tsconfig.json` change or `tatus`.
- Production deployments use the existing Vercel project `res-publica`, never
  the duplicate `res-publica-tq5l`.
- Phase 2 or Phase 3 code may reach Production only when it is inaccessible
  behind a server-enforced disabled feature flag until approved.

Initial Phase 1 commit sequence:

1. `fix: expose only operational platform modules`
2. `feat: add production-safe request protection and diagnostics`
3. `feat: complete governed identity and consent operations`
4. `feat: complete event registration lifecycle`
5. `docs: add privacy and production operations drafts`

Commit boundaries may be split further when a migration or security-sensitive
change deserves independent review.

## 3. Migration plan

Migration rules:

- Use additive, forward-only migrations.
- Do not rewrite or delete existing audit evidence.
- Keep status history append-only.
- Use explicit foreign keys and uniqueness constraints for invariants that
  must survive concurrent requests.
- Run `db:check` and `db:check:fresh` for every migration.
- Inspect Production migration state and confirm a Neon snapshot before any
  authorized Production migration.
- Never test restore procedures against Production data.

Expected migration candidates, subject to schema inspection:

| Slice | Candidate persistence | Migration expectation |
|---|---|---|
| Platform truthfulness | None | No migration |
| Request protection | Distributed rate-limit windows if PostgreSQL-backed | Additive |
| Consent operations | Withdrawal/status history only after ADR/legal gate | Blocked |
| Events | Cancellation provenance and status history if absent | Additive |
| Email/notifications | Delivery attempts and idempotency if absent | Additive |
| Content operations | Review/publication provenance if existing Publishing tables cannot own it | Prefer reuse |
| Media/files | Object metadata, scan state, retention metadata | Phase 3, disabled |
| Programmes | Application/enrolment/session lifecycle | Phase 3, new domain slice |

No migration is created merely to satisfy documentation or UI presentation.

## 4. Vertical-slice acceptance criteria

### Shared authentication and identity

- OIDC Authorization Code Flow with PKCE remains intact.
- Login, callback, session restoration, expiry, revocation, logout, and
  provider failure are covered by tests.
- The session-derived actor cannot be overridden by request input.
- Identity links and grants are privileged, MFA-protected where required, and
  atomically audited.
- An invitation/provisioning runbook defines the accountable human steps.

### Membership and consent

- Membership creation remains atomic with exactly two versioned consent
  records and one canonical audit record.
- Both confirmations remain independent, required, and default-off in
  DE/EN/FA.
- A member sees only their own allowed projection.
- Consent withdrawal is not activated until the ADR-035/legal gate is accepted.

### Profile

- The accepted ADR-034 read-only self-profile remains self-only, private,
  no-store, and allowlisted.
- No Governance-sensitive or cross-person data is selected.
- Mutating self-service capabilities require a later accepted ADR amendment.

### Events

- Registration and cancellation are authenticated and session-derived.
- Capacity, duplicate registration, waitlist, cancellation, and concurrency
  invariants are enforced transactionally.
- Every institutional state change has an atomic canonical audit record.
- DE/EN/FA interfaces expose success, waitlist, cancellation, and error states.

### Privacy and legal consistency

- Public legal text never claims unapproved legal conclusions or fabricated
  retention periods.
- Drafts accurately enumerate implemented processors and data flows.
- Processing inventory and retention matrix distinguish verified facts,
  technical proposals, owner decisions, and legal-review requirements.
- The placeholder DPIA remains clearly non-final.

### Security and resilience

- Sensitive writes and authentication initiation have edge-compatible or
  shared-state rate limits.
- CSP, HSTS, framing, content-type, referrer, and permissions policies are
  verified in tests and at the Production edge.
- Error responses use a stable contract and correlation ID without exposing
  personal data, internals, or secrets.
- Operational logs are structured, minimal, and redact known secret fields.
- Health checks, incident response, backup assumptions, and restore drills are
  documented and testable without destructive Production actions.

### Platform truthfulness

- Public module metadata exposes only implemented public interfaces.
- Internal capabilities and future routes are not advertised as operational.
- Empty content states remain truthful.

### Dashboard

- Protected localized route; self-facing data only.
- Membership, consent, events, notifications, and permitted actions are
  composed from owning modules rather than duplicated.
- Server authorization, private caching, RTL, and empty/error states are
  tested.

### Bounded administration

- Every view and action requires an explicit capability.
- Sensitive actions require MFA.
- No universal super-admin bypass exists.
- Separation of duties and atomic auditability remain enforced.

### Content operations

- Draft, review, approval, withdrawal, and provenance are explicit.
- Publishing Authority remains the human accountability layer.
- Ready state never automatically writes public content or Git.

### Email and notifications

- Provider abstraction has a non-delivering test adapter.
- Idempotency, retries, failure state, and consent boundaries are tested.
- No provider is activated without credentials and approved legal basis.

### Analytics

- Disabled by default and server-enforced.
- No personal behavioral tracking or storage before consent and configuration.
- Operational aggregates do not expose person-level activity.

### Phase 3 capabilities

- Media/uploads, Community, CRM, Knowledge Graph, external AI, HARM operations,
  programmes, and impact reporting remain server-disabled until their specific
  gates pass.
- Storage, provenance, access, retention, human review, and audit invariants
  are covered before activation.
- AI cannot publish, decide eligibility, decide membership, or make
  disciplinary decisions.

## 5. Verification baseline

Every completed slice runs focused tests first, then as applicable:

```text
npm run check-structure
npm run lint
npm run typecheck
npm test -- --maxWorkers=1
npm run db:check
npm run db:check:fresh
NEXT_PUBLIC_SITE_URL=https://respublica-ev.de npm run build
git diff --check
```

Browser verification covers DE/EN/FA, Persian RTL, keyboard behavior, protected
failure states, and the relevant Production route after deployment.

