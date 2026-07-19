# ADR-033: Delegation of Authority for Governance Operations

## Status

Accepted — explicitly approved by the Founder on 2026-07-19.

## Authorship

Prepared on 2026-07-19 at the Founder's explicit instruction to define the
Governance Domain roles, powers, grant rules, and revocation rules before any
protected Governance API is implemented. This is a proposal, not an accepted
institutional decision.

## Classification

Governance authorization and accountability decision. This ADR specializes
the shared authorization mechanism accepted in `ADR-027` for Governance Domain
operations. It does not amend the Constitution, delegate Founder authority, or
choose an identity provider.

## Context

- `ADR-026` assigns Evidence, Hearing, Review, Harm, and Repair policy to the
  Governance Domain.
- `ADR-027` provides deny-by-default, session-based authorization and requires
  MFA for Governance-sensitive capabilities, but deliberately leaves role and
  capability semantics to the owning domain.
- `ADR-029` requires every institutional state transition and its canonical
  `AuditLog` append to commit atomically, and prohibits audit update/delete
  operations.
- `ADR-030` disables Governance AI until separately approved use cases exist.
- The HARM workflow requires human intake, evidence assessment, hearing,
  quality review, scientific review, and repair planning.
- The next M5 slice is intentionally narrower than the eventual identity
  architecture: only authenticated Institution Admin sessions may access its
  protected Governance API. Jomhoor-DID must remain an unimplemented boundary.

## Proposed Decision

### 1. Authority is explicit, scoped, and deny-by-default

A Governance role is a persisted, auditable delegation to one canonical
`Person.id`. Every delegation has an institution scope, optional narrower
resource scope, grantor, grant time, and optional expiry. Absence, expiry, or
revocation means denial. A role name in a request body, UI, identity-provider
claim, or DID credential never grants application authority by itself.

The Human Approval Authority defined by the Constitution is not a Governance
role and cannot be delegated through this model. Founder approval, ADR
acceptance, constitutional amendment, production release approval, and legal
or DPIA approval remain outside the role matrix.

### 2. Governance roles and powers

| Role | Permitted powers | Explicit exclusions |
|---|---|---|
| Institution Admin | View the institution's Governance work queue; create, grant, time-limit, and revoke operational Governance role assignments within that institution; suspend protected access; inspect authorized audit evidence | Cannot grant or revoke Institution Admin; cannot grant itself a role; cannot accept ADRs, approve releases/legal matters, perform scientific approval merely by being Admin, delete audit evidence, or activate Governance AI |
| Intake Moderator | Register and update AHIP intake; collect evidence metadata; request missing information; submit a case to Basic Validation | Cannot decide Scientific Review, assign legal responsibility, or approve repair |
| Validation Officer | Record Basic Validation decisions and missing-information or duplicate findings | Completeness gate only; cannot determine truth or scientific validity |
| Evidence Reviewer | Record Evidence Quality criteria, contradictions, corroboration links, and preliminary Evidence Confidence | Cannot assign Scientific Confidence or silently discard contradictory evidence |
| Hearing Moderator | Prepare and document a Structured Hearing after current participant consent is confirmed | Cannot scientifically validate the account or perform its own HQC approval |
| Quality Reviewer | Perform DQR and/or HQC when the assignment explicitly names the review type and target | Cannot review an artifact or hearing they authored/moderated; cannot perform Scientific Review through a quality role |
| Scientific Reviewer | Perform an assigned Scientific Review, declare conflicts, record confidence, findings, recommendations, and the human decision | Cannot review with an unresolved conflict; cannot make legal, political, ethical-board, Founder, or release decisions |
| Repair Coordinator | Create and maintain a Repair Plan only for a case with an accepted Scientific Review; record monitoring and evaluation evidence | Cannot create the scientific approval that enables the plan or rewrite the underlying review |

Roles are capabilities, not ranks, reputation, certification, or gamification.
Holding multiple roles creates no additional implicit authority. Each operation
must independently satisfy its named capability, scope, separation-of-duty
rule, and assurance requirement.

### 3. Granting rules

1. The Founder/Human Approval Authority appoints and removes Institution
   Admins through an explicit, recorded process outside the Institution Admin
   API. The application persists the resulting grant and audit evidence but
   does not infer the decision.
2. An active Institution Admin may grant operational roles only inside the
   admin's institution and only within the target scope carried by the grant.
3. Self-granting is prohibited. The grantor and grantee must be different
   people.
4. Institution Admin may not grant Institution Admin or any Founder,
   constitutional, legal, release, or policy-approval authority.
5. Grants must identify the exact role, institution, optional target, grantor,
   start time, and optional expiry. Wildcard cross-institution grants are
   prohibited in this slice.
6. Identity-provider groups and future DID credentials may supply evidence for
   an administrator to inspect, but never auto-create a grant.
7. Every grant is appended to `AuditLog` in the same database transaction as
   the persisted authorization grant.

### 4. Revocation and suspension rules

- An Institution Admin may immediately revoke an operational grant within its
  institution, except its own grant. Revocation is effective for every new
  authorization decision and is append-only audit evidence.
- Only the Founder/Human Approval Authority, through the external recorded
  appointment process, may revoke an Institution Admin grant.
- Account disablement or security suspension blocks protected operations but
  does not erase the historical grant or its audit trail.
- Expired and revoked grants are retained as history; they are never deleted or
  rewritten.
- Active sessions must not preserve authority after a grant is revoked. The
  authorization service reloads or revalidates grants for every protected
  Governance operation.

### 5. Authentication boundary for this M5 slice

The protected Governance API in this slice accepts only a locally verifiable,
unexpired, non-revoked application session resolving to a canonical person and
an active Institution Admin grant. Trusted-origin/CSRF protection applies to
state-changing browser requests. Missing session, insufficient assurance,
missing grant, wrong institution scope, expiry, or revocation fails closed.

Operational role endpoints and role-specific user interfaces are not exposed
in this slice. Their role policies may be implemented in later slices using
this ADR, without widening the Institution Admin-only API now authorized.

### 6. Jomhoor-DID boundary

The application may define a provider-neutral `GovernanceIdentityEvidence`
interface that can later carry a Jomhoor-DID subject, issuer, verification time,
and credential references. The current implementation must provide no DID
resolver, wallet flow, credential verifier, network call, persistence table,
authorization mapping, or automatic grant conversion.

No DID claim is trusted for authorization until a later accepted ADR or
approved amendment defines verification, issuer trust, revocation, privacy,
recovery, assurance, and mapping to canonical `Person.id`.

### 7. Append-only Governance audit enforcement

Governance state transitions, grant/revocation events, evidence assessments,
quality reviews, Scientific Reviews, and Repair Plan changes use the one
canonical `audit_log` table from `ADR-029`. No parallel Governance event log is
created.

The database must enforce immutability, not merely the TypeScript repository:

- PostgreSQL rejects `UPDATE` and `DELETE` on `audit_log` through database
  trigger/rule enforcement applying independently of application code;
- the application database role has append/read privileges only and no general
  update/delete privilege on `audit_log`;
- state mutation and audit append occur in the same transaction;
- a PostgreSQL integration test attempts direct update and delete statements,
  proves both fail, and proves the original row remains unchanged;
- a rollback test proves neither state nor audit row survives when either half
  of the transaction fails.

The unresolved, legally gated pseudonymization/erasure path remains disabled.
This ADR does not create an exception to DB immutability.

### 8. Human decisions and AI boundary

Scientific Review, Evidence Confidence confirmation, quality outcomes, role
grants, revocations, and Repair Plans always identify an authenticated human
actor. Governance AI remains unavailable under `ADR-030`. No endpoint in this
slice calls the AI Layer or accepts an AI-originated institutional decision.

## Alternatives Considered

### One Institution Admin role performs every Governance decision

Rejected. Administration authority is not scientific, evidential, hearing, or
repair expertise and would defeat separation of duties and named-human
accountability.

### Identity-provider or DID roles become application grants automatically

Rejected. External claims do not carry the institution scope, appointment
record, revocation semantics, or constitutional authority required here.

### Implement Jomhoor-DID together with the protected API

Rejected for this slice. Verification and recovery policy is not yet approved;
an interface preserves replaceability without pre-empting that decision.

### Enforce append-only behavior only through repository interfaces

Rejected. A migration, maintenance path, defect, or compromised application
credential could bypass TypeScript. The invariant is constitutional and must
also hold at the PostgreSQL boundary.

## Consequences

- The first Governance API remains deliberately narrow: Institution Admin
  sessions only.
- Operational role semantics are decided before their endpoints are exposed.
- Institution Admin cannot bootstrap or preserve its own authority.
- Audit immutability becomes independently testable below the application
  layer.
- Jomhoor-DID can be integrated later without coupling Governance policy to a
  specific credential system.
- Founder, constitutional, legal, release, and policy approval gates remain
  human processes outside ordinary application delegation.

## Validation Criteria

- Every protected Governance request fails without a valid Institution Admin
  session and matching institution scope.
- Request bodies cannot select the accountable actor or grantor.
- Self-grant, cross-institution grant, and Institution-Admin grant attempts are
  rejected.
- Revocation takes effect on the next protected operation without deleting
  grant history.
- A moderator cannot approve their own HQC; unresolved conflicts block
  Scientific Review.
- Repair Planning cannot precede an accepted human Scientific Review.
- No Governance AI capability or DID implementation is present.
- Direct PostgreSQL `UPDATE` and `DELETE` attempts against `audit_log` fail and
  leave the row intact.
- Transaction failure rolls back both Governance state and its audit append.

## Human Approval Required

Founder approval is required for all proposed decisions before implementation,
specifically:

1. the eight-role Governance model and its explicit exclusions;
2. Founder-only appointment/removal of Institution Admins;
3. Institution-Admin delegation of scoped operational roles, with no
   self-grant or cross-institution wildcard;
4. immediate, historical revocation with per-request grant revalidation;
5. Institution-Admin-session-only API scope for this M5 slice;
6. Jomhoor-DID as an interface only, with no implementation or automatic grant;
7. PostgreSQL-enforced append-only `AuditLog` plus direct DB integration tests;
8. continued human-only Governance decisions and disabled Governance AI.

## Human Approval Record

The Founder accepted all eight proposed decisions on 2026-07-19 with the
explicit instruction: “ADR‑033 mit den acht vorgeschlagenen Entscheidungen als
Founder-Entscheidung akzeptiert. Status darf auf Accepted gesetzt und die
Implementierung begonnen werden.” Implementation is authorized only within the
boundaries recorded in this ADR.

## References

`architecture/adr/ADR-002-domain-model.md`;
`architecture/adr/ADR-026-constitutional-domain-architecture.md`;
`architecture/adr/ADR-027-identity-authentication-authorization.md`;
`architecture/adr/ADR-029-audit-and-event-bus-boundary.md`;
`architecture/adr/ADR-030-ai-runtime-boundary.md`;
`brain/00_constitution/00_constitution.md`;
`docs/source/methodology/AHIP.md`;
`docs/source/methodology/EVIDENCE_MODEL.md`;
`docs/source/methodology/STRUCTURED_HEARINGS.md`;
`docs/source/methodology/DOCUMENTATION_QUALITY_REVIEW.md`;
`docs/source/methodology/HEARING_QUALITY_CHECK.md`;
`docs/source/methodology/SCIENTIFIC_REVIEW.md`;
`docs/source/methodology/REPAIR_FRAMEWORK.md`.
