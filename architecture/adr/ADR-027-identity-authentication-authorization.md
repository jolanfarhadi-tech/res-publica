# ADR-027: Identity, Authentication, and Authorization

## Status

Accepted — explicitly approved by the Founder on 2026-07-19.

## Authorship

Prepared on 2026-07-19 by the implementation agent after the Program Director
approved preparation of the ADR. This is an authored proposal, not a discovered
repository fact. The Founder subsequently approved all six decisions listed in
the Human Approval Record with the explicit response “genehmigt”.

## Classification

Joint architectural and accountability decision. It defines technical identity
and access-control boundaries and carries forward the Constitution's named-human
accountability rule without changing that rule.

## Context

- The Constitution requires every institutional output to resolve to a named
  human and forbids attribution to “the system” or an AI alone.
- `ADR-001` places opt-in identity in Tier 3 and requires Tier 1 anonymous use
  to remain independent.
- `ADR-002` defines one minimal canonical `Person`; role-specific state belongs
  to modules rather than `Person`.
- `ADR-026` makes Civic Domain and Governance Domain peers and permits Shared
  Platform Services to own mechanisms but no business policy.
- Governance workflows process more sensitive evidence and participant data
  than ordinary Civic participation and therefore require domain-owned policy.
- Membership already defines an `ActorResolver` extension point but deliberately
  provides no implementation.
- M2 cannot expose accountable write routes while callers may supply an
  unverified `personId`.

## Decision

### 1. Authentication is a Shared Platform Service

One authentication service verifies human sessions for both Civic and
Governance Domain. The modular monolith uses one session model; no module stores
passwords, validates tokens, reads authentication cookies, or implements a
second login system.

Production authentication uses OpenID Connect Authorization Code Flow with
PKCE against a configured identity provider. The application stores no user
passwords. Provider procurement and hosting are operational decisions, but a
production provider must support EU data residency, MFA, account disablement,
session revocation, security-event export, and a signed data-processing
agreement where required.

Authentication failure yields no actor. Development-only resolvers must be
structurally unavailable when `NODE_ENV` is `production`.

### 2. External identity is linked to canonical Person

An infrastructure-owned `AuthIdentity` mapping links the stable tuple
`(issuer, subject)` from the identity provider to exactly one canonical
`Person.id`. Credentials, provider tokens, roles, membership state, contributor
state, and reviewer state are not fields on `Person`.

`AuthIdentity` is authentication infrastructure, not a seventh canonical
business entity. Shared Platform Services owns its schema and lifecycle.
Linking, unlinking, account recovery, and conflict resolution are privileged,
audited actions.

The canonical `Person` record is owned by Shared Platform Services as the
minimal cross-domain person directory already required by `ADR-002`. This
ownership conveys no authority over what a person means inside either business
domain. Civic and Governance Domain reference `Person.id` and own their own
profiles, roles, and lifecycle semantics.

### 3. Authorization mechanism is shared; policy is domain-owned

Shared Platform Services supplies a deny-by-default authorization mechanism
that evaluates an authenticated actor, requested capability, target context,
and domain policy. It does not define which actions a member, reviewer,
moderator, or staff person may take.

- Civic Domain owns Membership, Community, Events, and related capability
  policies.
- Governance Domain owns Evidence, Hearing, Review, Harm, Repair, and related
  capability policies.
- Cross-domain operations must satisfy the policy of every affected domain;
  one domain cannot grant itself access to the other's protected data.

Roles and grants are explicit, persisted, time-bounded where appropriate, and
audited. Absence of a grant means denial. UI visibility is never treated as an
authorization control; every protected server operation checks policy again.

### 4. ActorResolver contract

The application-level resolver returns a verified actor with:

- canonical `personId`;
- provider-neutral session identifier;
- authentication time and assurance/MFA status; and
- domain grants loaded through the authorization service.

Request bodies and query strings may never choose or override the accountable
actor. A route may name a different subject or target only when its domain
policy explicitly permits acting on that target; the audit actor always remains
the authenticated human.

Institutional transitions execute the authorization decision, business state
change, and `AuditLog` append through the accepted shared transaction boundary.
Authentication events such as identity linking, privilege change,
revocation, and recovery also append audit evidence.

### 5. Assurance levels

- Anonymous read access requires no session and remains the Tier 1 default.
- Ordinary self-service participation requires a verified provider identity.
- Staff, moderator, reviewer, payment-adjacent, export, identity-administration,
  and Governance-sensitive capabilities require MFA.
- Particularly sensitive Governance operations may require recent MFA and
  explicit human re-authentication as defined by Governance Domain policy.

No authentication factor, role, or participation activity becomes a score,
rank, reputation signal, or engagement metric.

### 6. Sessions and failure behavior

Browser sessions use secure, `HttpOnly`, `SameSite=Lax` cookies and HTTPS in
production. State-changing requests additionally enforce trusted-origin/CSRF
protection. Session duration is bounded; privilege changes and account disable
events invalidate affected sessions.

If the identity provider is unavailable, Tier 1 and other anonymous read paths
remain functional. New login and protected writes fail closed with a clear,
non-destructive response. Existing sessions are accepted only while locally
verifiable and unexpired; no protected operation falls back to a caller-supplied
identity.

### 7. Service-to-service identity

No service-to-service credential system is introduced for M2/M3 because the
accepted runtime is a modular monolith. Internal function calls do not
impersonate humans. If later deployment boundaries require workload identity,
a dedicated ADR must define it; workload identity may never satisfy a
named-human sign-off requirement by itself.

### 8. Privacy and legal gates

Authentication introduces personal-data processing. Before production use,
the provider, data flows, retention, security controls, subprocessors, and
international transfers must be included in the real DPIA/processing records
and receive the required legal/data-protection review. The current placeholder
DPIA does not constitute production approval.

The existing AuditLog erasure/pseudonymization stop condition remains in force.

## Alternatives Considered

### Authentication implemented separately by each module

Rejected. It duplicates credentials and sessions, fragments revocation, and
makes one accountable person appear as multiple security identities.

### Roles stored directly on Person

Rejected. Roles are domain-specific, change independently, and would turn the
minimal canonical person directory into a cross-domain policy object.

### One global role matrix owned by Shared Platform Services

Rejected. It would place Civic and Governance business semantics in the shared
mechanism, contrary to ADR-026, and could flatten Governance protections to the
least-sensitive domain.

### Caller-provided personId until authentication is built

Rejected. It permits impersonation and produces audit evidence that names an
unverified actor.

### Application-managed passwords

Rejected for the current 1–3 engineer nonprofit team. Credential storage,
recovery, MFA, breach monitoring, and secure lifecycle management add risk and
operational scope without unique civic value.

### Authentication required for all content

Rejected. It violates anonymous access, offline-first behavior, and the Tier 1
trust boundary.

## Consequences

- M2 write routes depend on a real ActorResolver and domain policy, not request
  identity fields.
- Shared authentication can be replaced at the OIDC/provider boundary without
  rewriting module logic.
- Governance Domain may impose stronger policies without forking login/session
  infrastructure.
- New persistence tables are required for identity links, sessions, and grants;
  security-relevant transitions use the canonical `AuditLog` rather than a
  parallel security-event ledger.
- Provider outage cannot take down public static content.
- Production activation remains blocked by provider configuration, security
  review, and real DPIA/legal review.

## Validation Criteria

- Anonymous Tier 1 pages work with no identity provider or database available.
- Protected writes reject missing, expired, revoked, or caller-forged identity.
- Request payloads cannot override the audit actor.
- Every protected operation is denied without an explicit domain grant.
- MFA is enforced for staff and Governance-sensitive capabilities.
- Identity linking, privilege changes, recovery, and institutional writes are
  auditable and person-attributable.
- No module reads authentication cookies or provider tokens directly.
- Civic and Governance policies are independently testable.
- Provider outage produces fail-closed protected writes and leaves anonymous
  reads functional.

## Human Approval Record

Approved by the Founder on 2026-07-19 before implementation:

1. OIDC/PKCE authentication through a configurable external provider;
2. `Person` and `AuthIdentity` as Shared Platform Services infrastructure;
3. shared deny-by-default authorization with domain-owned policies;
4. MFA for staff and Governance-sensitive operations;
5. no service-to-service identity in the modular monolith; and
6. production activation remaining subject to security and legal/DPIA review.

## References

`architecture/adr/ADR-001-core-platform.md`;
`architecture/adr/ADR-002-domain-model.md`;
`architecture/adr/ADR-026-constitutional-domain-architecture.md`;
`brain/00_constitution/00_constitution.md`;
`brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED, referenced only);
`brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md`;
`docs/source/governance/DATA_POLICY.md`;
`docs/source/governance/DPIA.md`;
`src/modules/membership/auth-extension-point.ts`.
