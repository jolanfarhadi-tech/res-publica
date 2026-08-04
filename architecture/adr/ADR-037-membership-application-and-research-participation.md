# ADR-037: Membership Application and Research Participation Boundaries

## Status

Proposed — prepared from the owner's revised implementation instruction on
2026-08-04. Production activation remains subject to explicit architectural,
legal, and data-protection approval.

## Classification

Civic Domain membership, Shared Platform identity, consent, authorization, and
accountability decision. This ADR does not amend the signed Vereins-Satzung or
create binding membership rules.

## Context

The existing application creates a `Member` immediately after an authenticated
person submits a tier and two mandatory profile confirmations. That behavior
does not represent the board decision required by §6 of the signed Satzung and
incorrectly makes a general programme/research confirmation a condition of
membership. ADR-027 also requires OIDC-managed credentials, session-derived
actors, explicit grants, MFA for privileged decisions, and atomic audit evidence.

## Proposed Decision

### 1. Account and membership are separate

Auth0 owns password handling and email verification. The application stores no
password. A verified OIDC identity may be linked to a canonical `Person` through
an audited self-registration flow only when the provider supplies a stable
issuer/subject and a verified email address. Ambiguous existing email matches
fail closed for human identity review; they are never merged automatically.

An activated account is not membership. A person submits a distinct
`MembershipApplication` with status `application_pending`. Only a board decision
may move it to `approved` or `rejected`. A `Member` is created or verified only
after approval.

### 2. Technical protocol

The versioned technical sequence is:

1. Auth0 signup;
2. Auth0 email verification;
3. local account activation and membership application;
4. `application_pending`;
5. board review;
6. MFA-protected, capability-authorized, audited decision;
7. `approved` or `rejected`;
8. creation or verification of Membership;
9. release of separately defined member rights; and
10. an optional offer to activate the research wallet.

This sequence is implementation protocol, not Vereinsrecht. It must not be
presented as replacing the Satzung or a separately approved contribution or
membership regulation.

### 3. Versioned acknowledgements

The application records separate, versioned acknowledgements for the signed
Satzung, the technical application protocol, and the privacy notice. A privacy
acknowledgement records that the notice was read; it is not blanket consent.
No checkbox for a membership regulation may be required until an approved,
versioned regulation actually exists and is directly available to the applicant.

### 4. Research participation is independent

General research readiness is optional and never gates account creation,
application submission, board approval, membership, or general member functions.
It is a revocable preference that may affect eligibility for a research project.
It never replaces project-specific information, consent, or another reviewed
lawful basis.

Membership state, general research readiness, project-specific consent,
project eligibility, withdrawal, and exclusion are persisted and evaluated as
separate facts. Withdrawal affects future processing and participation under the
affected purpose; it does not terminate membership.

### 5. Board authority and audit

The board decision capability is `civic/membership.application.decide`, scoped
to the exact application, and requires MFA. The applicant may not decide their
own application. The decision, resulting Membership mutation, notification
record, and canonical `AuditLog` append commit atomically. Request bodies never
choose the accountable actor.

### 6. Existing data

Existing `members` rows remain unchanged. The additive migration does not infer
applications or decisions for them. A missing application for an existing
member means “legacy membership provenance not represented by this protocol,”
not pending, approved, or rejected.

### 7. Activation boundary

No email-delivery provider is invented. The application may enqueue a governed
notification, but it may claim delivery only after the existing delivery system
records success. Production self-registration requires approved Auth0 email
verification policy, privacy text, retention rules, administration ownership,
and incident-response ownership.

## Consequences

- The existing immediate membership-creation API is replaced for new applicants
  by an application API while legacy member data remains readable.
- Board decisions are explicit institutional actions rather than side effects of
  login or email verification.
- Research participation can be withdrawn without altering membership.
- Additional additive tables and an OIDC flow intent are required.

## Implementation Evidence (2026-08-04)

The proposed boundary is implemented in migrations 0014–0018 and the current
membership/auth/research services: Auth0 email verification activates only the
account; application submission remains separate; the board decision requires
MFA, exact capability scope and a different actor; membership, wallet offer,
notifications, grants and canonical audit evidence commit atomically. General
research readiness remains optional. Project consent, eligibility, withdrawal,
credential issuance and anonymous contribution are separate records and APIs.

This evidence does not change the ADR status or approve public legal wording,
retention periods, real research processing or the wallet activation gate.

## Validation Criteria

- Email verification never confirms membership.
- An application cannot be approved without MFA, capability, exact scope, and a
  different accountable actor.
- Rejected or rate-limited decisions persist no member, decision, notification,
  consent, or audit mutation.
- Missing optional research readiness never blocks membership.
- Project eligibility cannot imply project consent and vice versa.
- Existing members are not backfilled or reclassified.

## Approval Required

Founder/architecture acceptance, board-process confirmation, and legal/data-
protection approval of public wording and retention are required before
Production activation.

## References

`architecture/adr/ADR-027-identity-authentication-authorization.md`;
`architecture/adr/ADR-029-audit-and-event-bus-boundary.md`;
`architecture/adr/ADR-034-member-profile-visibility-and-self-service-authorization.md`;
signed Res Publica e.V. Satzung, §6 and §8.
