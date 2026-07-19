# ADR-034: Member Profile Visibility and Self-Service Authorization

## Status

Accepted — explicitly approved by the Founder on 2026-07-19.

## Authorship

Prepared on 2026-07-19 at the Founder's explicit instruction to define the
Member Profile visibility and self-service authorization boundary before API
implementation.

## Classification

Civic Domain authorization, privacy, and presentation-boundary decision. This
ADR specializes the shared authentication and authorization mechanism accepted
in `ADR-027` for a member reading their own profile. It does not approve a new
identity provider, legal assessment, Governance disclosure workflow, or AI use
case.

## Context

- `ADR-026` assigns Membership and Community policy to the Civic Domain while
  keeping Governance Domain data under a separate peer boundary.
- `ADR-027` permits verified sessions for ordinary self-service participation,
  requires deny-by-default server authorization, and prohibits request data
  from overriding the authenticated actor.
- `MEMBER_PROFILE.md` defines three visibility tiers and prohibits the member
  interface from exposing internal reviewer notes, risk flags, evidence
  assessment, harm classification, scientific-review information, or
  Governance reasoning.
- The Membership module already implements the documented lifecycle and a
  presentation-ready `MembershipJourneyView`, but no protected self-service
  profile API exists.
- The profile is an integration and transparency surface, not a second owner of
  Membership logic and not a Governance decision interface.

## Proposed Decision

### 1. The first slice is authenticated self-service only

The first Member Profile API resolves the canonical person exclusively from a
locally verifiable, unexpired, non-revoked application session. The subject is
always `actor.personId`. A path, query, header, or request body cannot select a
different member. Staff access, delegated access, impersonation, household
access, exports, and support tooling are outside this slice and require a later
approved policy.

A verified assurance level is sufficient for this read-only self-service view,
consistent with `ADR-027`. Missing or invalid sessions fail closed. MFA remains
required for staff, payment-adjacent, export, identity-administration, and
Governance-sensitive operations, none of which this API provides.

### 2. Authorization is enforced at the query boundary

Repositories and application services query Member Profile data using the
authenticated `personId` as a mandatory predicate. They do not load an
arbitrary profile and filter it only in the route or UI. The API exposes no
general `findByMemberId` or cross-person list operation to the self-service
route.

UI hiding is not an authorization control. Every request repeats session
resolution and the self-subject check on the server. A caller cannot gain
access by changing locale, URL, JavaScript state, or serialized identifiers.

### 3. The response is an explicit member-facing projection

The API returns a purpose-built allowlisted projection rather than serializing
raw `Person`, Membership, authorization, payment, notification, evidence, or
Governance rows. The first slice may contain only:

- canonical member identifier needed by the interface;
- Membership tier and current status;
- Membership registration date;
- previous status, most recent status-change date, and a member-facing
  triggering-activity explanation; and
- valid next Membership statuses already produced by the Membership module.

Unavailable optional values are represented as absent or `null`; the service
does not infer them from unrelated activity. Internal database identifiers that
are not needed by the member interface are omitted.

### 4. Internal and Governance-sensitive data are excluded by construction

The self-service query and projection must not select or return duplicate
detection notes, reviewer comments, risk flags, evidence assessment,
contradiction analysis, harm classification, Scientific Review status or
outcome, Governance referral reasoning, Ethics Board reasoning, sensitive
evidence notes, authorization grants, session secrets, or audit internals.

`CODEX POTENTIAL` and `HEARING CANDIDATE` are not part of the first slice. Their
future disclosure requires the separately defined safe-disclosure, consent,
and Governance-approval workflow required by `MEMBER_PROFILE.md`; absence from
the response must not reveal whether such a flag exists.

### 5. The profile reuses Membership ownership and lifecycle

The API consumes the existing Membership tables, domain types, transition
rules, and `MembershipJourneyView`. It creates no duplicate lifecycle, profile
status, score, rank, reputation value, or parallel person record. Membership
state changes remain outside this read-only endpoint and continue through the
owning Membership application service with its existing audit discipline.

The independent future Civic Contribution Framework remains the owner of
contribution retention, archival, anonymization, transfer, preservation, and
recognition. This ADR does not define that lifecycle.

### 6. AI and automated recommendations remain absent

The first slice contains no Opportunity Engine, generated “Next Recommended
Steps,” inference, prediction, ranking, personalization model, AI call, or
Governance AI integration. Any later recommendation mechanism requires its own
approved rules and must remain advisory, non-comparative, and unable to infer
or expose Governance-sensitive information.

### 7. Failure behavior minimizes disclosure

Unauthenticated requests return an authentication failure. An authenticated
person without a Membership record receives a stable empty/not-enrolled result
that reveals nothing about any other person. Responses are private and must not
be stored in shared caches. Logs and error messages must not contain profile
payloads, session tokens, internal notes, or hidden Governance attributes.

The public website and anonymous Tier 1 routes remain available when the
identity provider or protected profile dependencies are unavailable. The
Member Profile fails closed and non-destructively.

### 8. Tests prove the boundary, not only the happy path

Integration tests must prove that the session actor can read only their own
projection; caller-supplied subject identifiers cannot override the actor;
missing, expired, and revoked sessions fail; a person without Membership is
handled without enumeration; and forbidden internal/Governance fields are
absent even when representative sensitive records exist in the database.

## Alternatives Considered

### Return the complete joined person and membership records

Rejected. A denylist is easy to bypass when schemas grow and would couple the
member interface to internal and Governance-owned fields.

### Accept a member identifier in the request

Rejected for self-service. It creates an avoidable insecure-direct-object
reference risk and contradicts `ADR-027`'s actor rule.

### Load broadly and filter in the route or browser

Rejected. Sensitive data would cross the query or server boundary before the
visibility policy is applied, and UI filtering is not authorization.

### Include Governance disclosure flags now

Rejected. Their consent and human-approval workflow is not yet defined, and
their presence or absence can itself reveal sensitive Governance activity.

### Generate recommended next steps with AI in the first slice

Rejected. No approved recommendation policy or data boundary exists, and the
current slice can deliver useful transparency from deterministic Membership
state alone.

## Consequences

- Members gain a narrow, explainable view of their own Membership journey.
- The route cannot become a generic person-directory or staff lookup endpoint.
- New fields require explicit projection and policy review before exposure.
- Governance-sensitive data remains outside the Civic self-service query.
- Payments, Notifications, application history, contributions, recommendations,
  staff tooling, and Governance-approved disclosures remain future slices.
- The existing Membership lifecycle becomes the single implemented source
  consumed by the profile.

## Validation Criteria

- A valid verified session can retrieve only its own Membership projection.
- No request input can change the accountable actor or profile subject.
- Data ownership is constrained in the repository/application query, not only
  in the route or UI.
- Forbidden internal and Governance-sensitive field names and values never
  appear in the response.
- Missing, expired, and revoked sessions fail closed.
- A missing Membership record does not disclose another person's existence.
- Responses are private and not shared-cacheable.
- The endpoint performs no mutation, AI call, or Governance query.
- Existing Membership lifecycle and journey-view tests remain valid.

## Human Approval Required

Founder approval is required before API implementation for these eight proposed
decisions:

1. authenticated, verified-session, self-service-only scope;
2. mandatory actor-person predicate at the query boundary;
3. explicit member-facing allowlist projection;
4. construction-level exclusion of internal and Governance-sensitive data;
5. reuse of the existing Membership lifecycle with no duplicate ownership;
6. no AI or automated recommendations in the first slice;
7. privacy-preserving failure, caching, and logging behavior; and
8. integration tests covering ownership, session failure, enumeration, and
   forbidden-field suppression.

## Human Approval Record

The Founder accepted all eight proposed decisions on 2026-07-19 and explicitly
authorized the protected Self-Service API slice. Implementation remains bounded
by this ADR: no Governance disclosure, AI, Payments, Notifications, delegated
access, staff lookup, or Member Profile mutation is authorized.

## References

`architecture/adr/ADR-002-domain-model.md`;
`architecture/adr/ADR-026-constitutional-domain-architecture.md`;
`architecture/adr/ADR-027-identity-authentication-authorization.md`;
`architecture/adr/ADR-029-audit-and-event-bus-boundary.md`;
`architecture/adr/ADR-030-ai-runtime-boundary.md`;
`docs/source/projects/MEMBER_PROFILE.md`;
`docs/source/governance/DATA_POLICY.md`;
`docs/source/governance/DPIA.md`;
`src/modules/membership/lifecycle.ts`;
`src/modules/membership/view.ts`.
