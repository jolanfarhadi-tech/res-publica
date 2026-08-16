# Processing inventory — implementation-backed review draft

**Technical inventory only. Owner and qualified legal/data-protection approval
remain required.** The synchronized machine-readable source is
`PROCESSING_INVENTORY.json`; `npm run privacy:inventory:check` fails when a
current PostgreSQL table or activity is not represented.

This document does not assign a legal basis, retention period, erasure rule,
provider contract, or permission to activate real research/HARM processing.
Those fields remain explicitly `null` in the machine inventory. The inventory
describes implementation evidence and non-activation boundaries—not legal
conclusions.

## Active public and account processing

<!-- inventory:public-delivery -->
### Public delivery

- **Technical status:** active.
- **Data and purpose evidenced by implementation:** requested pages plus
  network/user-agent metadata controlled by Vercel, used to deliver and protect
  the public multilingual site.
- **Boundary:** hosting provider and restricted Production operators.
- **Unresolved:** provider DPA, log retention and transfer review.

<!-- inventory:oidc-authentication -->
### OIDC authentication

- **Technical status:** active through the approved EU Auth0 tenant.
- **Data and purpose:** issuer/subject, verified claims, assurance, flow/session
  identifiers and timestamps used to authenticate accounts and restore bounded
  server sessions.
- **Boundary:** Auth0, Vercel runtime and Neon; self session plus appointed
  identity/security operators.
- **Unresolved:** Auth0 DPA, MFA policy, security-event export and session/flow
  retention.

<!-- inventory:identity-authorization -->
### Identity linking and authorization

- **Technical status:** active.
- **Data and purpose:** canonical Person/Organization references and exact
  capability grants with validity/revocation, used to derive actors and enforce
  bounded authority.
- **Boundary:** session-derived actor and shared exact-target authorization; no
  universal administrator bypass.
- **Unresolved:** provisioning ownership, grant administration and identity
  lifecycle policy.

<!-- inventory:membership-application -->
### Membership Application

- **Technical status:** active.
- **Data and purpose:** name, email, postal address, requested membership form,
  status, versioned acknowledgements and board-decision evidence used to submit
  and review an application separately from account activation.
- **Boundary:** self submission/status; detail and decision require an exact
  application grant, MFA and a different actor. Research readiness is excluded
  from board review.
- **Unresolved:** ADR-037 acceptance, approved privacy wording and appointed
  board reviewers/grant operators.

<!-- inventory:membership-relationship-and-profile -->
### Membership relationship and private profile

- **Technical status:** active.
- **Data and purpose:** membership form/status/history, benefit and institutional
  relationship records, presented through the self-only allowlisted profile.
- **Boundary:** internal-administrative and governance-sensitive data are
  excluded at the data-access layer.
- **Unresolved:** correction/erasure policy and accountable lifecycle ownership.

<!-- inventory:consent-and-preferences -->
### Confirmations, consent records and interface preferences

- **Technical status:** versioned records and self display are active; broad
  withdrawal/mutation remains gated.
- **Data and purpose:** versioned purposes, grant/revocation state, locale and
  accessibility preferences used to evidence confirmations and remember the
  chosen interface.
- **Boundary:** self-facing projection; no broad consent-administration API.
- **Unresolved:** accepted ADR-035 or amendment plus approved withdrawal and
  data-subject-rights procedure.

<!-- inventory:payments-and-pledges -->
### Payments and recurring pledges

- **Technical status:** database records and allowlisted self history exist; no
  external payment provider is claimed active.
- **Data and purpose:** payer reference, amount/currency/purpose, provider
  reference, state/timestamps and pledge schedule used for membership-related
  records.
- **Boundary:** the Dashboard omits payer identifiers and provider references.
- **Unresolved:** accounting retention and provider/DPA approval before any
  provider activation.

<!-- inventory:event-participation -->
### Event participation

- **Technical status:** active.
- **Data and purpose:** event/person references, registration state/time,
  waitlist position, Q&A and outcome records used for capacity, waitlisting,
  cancellation and published outcomes.
- **Boundary:** session-derived participant plus bounded event operations.
- **Unresolved:** event retention and communication basis.

<!-- inventory:notifications -->
### Notifications

- **Technical status:** queue, attempts and self inbox are active; no external
  delivery provider is active.
- **Data and purpose:** recipient reference, channel/template, state, attempt and
  timestamps used to evidence transactional notifications.
- **Boundary:** self Dashboard and bounded delivery worker; contact data reaches
  an adapter only after an active purpose confirmation.
- **Unresolved:** provider/DPA, approved templates, worker ownership and
  retry/retention policy.

## Security and accountability processing

<!-- inventory:rate-limiting-and-operational-logs -->
### Rate limiting and operational diagnostics

- **Technical status:** active.
- **Data and purpose:** keyed identifier hash, scope/window/count/expiry and
  generated request ID/method/normalized path/allowlisted event fields used for
  abuse prevention and failure diagnosis.
- **Boundary:** raw IP addresses, request payloads, recipient addresses and
  arbitrary exception content are not stored by these application controls.
- **Unresolved:** security-log retention, recipients and incident-hold rules.

<!-- inventory:canonical-audit -->
### Canonical AuditLog

- **Technical status:** active and append-only.
- **Data and purpose:** actor reference, action, target, timestamp and
  pseudonymized flag used as institutional action evidence. The current schema
  does **not** contain a hash chain, and this inventory makes no such claim.
- **Boundary:** owning services write audit evidence atomically; no general
  public read is exposed.
- **Unresolved:** retention/access and ADR-029 pseudonymization/erasure approval.

## Internal governed workflows

<!-- inventory:publishing-authority -->
### Publishing Authority

- **Technical status:** active internal workflow.
- **Data and purpose:** submissions, drafts/citations, assignments, moderation,
  translation, human sign-off and readiness provenance used to prepare
  trustworthy multilingual publication.
- **Boundary:** exact publication scope, MFA roles and separation of duties.
  Ready does not auto-publish or write Git/public content.
- **Unresolved:** content/provenance retention and source-material rights.

<!-- inventory:newsletter -->
### Newsletter

- **Technical status:** server-disabled before input processing/provider transfer.
- **Potential data:** email, locale and versioned newsletter consent for a
  double-opt-in request.
- **Boundary:** `NEWSLETTER_ENABLED` and approved provider configuration are
  absent; the public interface truthfully offers no subscription.
- **Unresolved:** provider/DPA, approved wording, legal decision, withdrawal and
  retention operations.

<!-- inventory:research-participation-and-wallet -->
### Research participation and credential wallet

- **Technical status:** synthetic-only behind the closed
  `RESEARCH_REAL_DATA_ACTIVATION_APPROVED` gate.
- **Potential data:** readiness, project consent/eligibility, wallet/device
  public keys, challenges, activation, recovery and revocation evidence.
- **Boundary:** issuer and verifier are separated; project-bound proofs and
  anonymous intake are tested only with synthetic identities/data. No complete
  anonymity claim is made.
- **Unresolved:** ADR-037/038 acceptance, DPIA, independent cryptographic,
  penetration and reidentification audit, project protocol and accountable
  operators.

<!-- inventory:harm-governance -->
### HARM/Governance

- **Technical status:** server-disabled.
- **Potential data:** case, evidence, hearing, quality/scientific review and
  repair-planning records.
- **Boundary:** `HARM_OPERATIONS_ENABLED`, exact Governance capabilities, MFA
  and separation of duties; no approved secure evidence-upload service exists.
- **Unresolved:** secure storage, safeguarding, DPIA/DPA, retention and named
  operational/incident owners.

<!-- inventory:academy-learning-and-certification -->
### Academy learning and completion records

- **Technical status:** multilingual catalog and governed learning workflow are
  implemented; learner writes remain server-gated by
  `ACADEMY_ENROLLMENT_ENABLED`.
- **Potential data:** enrollment/application state, cohort, progress,
  assessment response, human review and completion record.
- **Boundary:** session-derived self access, exact-scope MFA staff authority,
  separation of duties and public certificate verification without person data.
- **Unresolved:** approved learner privacy notice, legal basis,
  retention/erasure and named Academy operators before real enrollment.

<!-- inventory:fellowship-candidacy-and-recognition -->
### Fellowship candidacy and recognition

- **Technical status:** the human-gated nomination/application, conflict,
  review, independent decision and private record workflow is implemented;
  self-applications remain server-gated by
  `FELLOWSHIP_APPLICATIONS_ENABLED`.
- **Potential data:** qualitative rationale, factual evidence references,
  reviewer conflict declaration, human review/decision, bounded role and
  status history.
- **Boundary:** no scoring, ranking, automated threshold, public member roster
  or public candidate detail; staff operations require exact-scope MFA.
- **Unresolved:** approved candidate transparency/legal basis,
  retention/erasure, named operators and real programme approval.

<!-- inventory:community-and-participation-models -->
### Community and participation models

- **Technical status:** implemented internal models; no public operational API.
- **Potential data:** community stage, touchpoint transition and invitation
  mechanism.
- **Boundary:** no public cohort or real-data activation is claimed.
- **Unresolved:** approved operating purpose, authority, privacy and retention.

<!-- inventory:knowledge-graph-and-ai-ledger -->
### Knowledge Graph and AI ledger

- **Technical status:** deterministic build, candidate ledger, independent
  human review, provenance and bounded public graph projection are implemented;
  versioned read-only Public API DTOs and authenticated local
  citation-or-refuse retrieval are implemented; no external AI provider is
  active.
- **Potential data:** entity names/aliases, deterministic relationships,
  source eligibility, build digest, human decisions, HMAC query digest,
  request/policy/provider provenance, public citations, answer digest and cost.
- **Boundary:** rebuild never publishes automatically; exact-scope MFA and
  separation of duties protect approval; public reads expose only allowlisted
  fields backed by currently public-eligible approved provenance. Authenticated
  retrieval requires exact verified Civic scope before graph access, stores no
  raw prompt or answer and rejects external provider mode. Public API v1
  serializes no private table or internal source path.
- **Unresolved:** retention for build/candidate/provenance records and ongoing
  source-eligibility governance. Partner capabilities require partner/legal/
  security approval; external AI still requires an approved provider/use case,
  DPIA and AI-governance activation.

<!-- inventory:funding-impact-and-partnerships -->
### Funding, impact and partnership models

- **Technical status:** implemented internal models; no public operational API
  or unrestricted export.
- **Potential data:** donor/partner/funder relationship, conflict disclosure,
  funding-source publication, impact evidence, metrics and funnel events.
- **Boundary:** none of these records enters the self-facing Dashboard.
- **Unresolved:** approved purposes, owners, disclosure governance, privacy and
  retention.

## Schema coverage and exclusions

The machine inventory currently covers all **98** PostgreSQL tables parsed from
`src/persistence/schema.ts` and `src/persistence/module-schema.ts`. Shared tables
may support more than one activity, but every current table must appear at
least once. A schema addition therefore fails the inventory drift check until
it is classified with source evidence and explicit gates.

Explicitly inactive or excluded: public profile directory, automated
membership decision, identity-document upload, unrestricted personal-data
export, Production file upload, activated analytics provider, activated
external AI provider, and real research credential/contribution processing.

## Required owner/legal completion

For each activity, accountable owners must approve or reject: legal basis;
data minimization; processor/DPA and transfer evidence; access roles; concrete
retention/erasure/pseudonymization; rights handling; incident responsibilities;
and public transparency wording. Engineering must not convert this draft into
an approval or activate destructive lifecycle jobs from it.
