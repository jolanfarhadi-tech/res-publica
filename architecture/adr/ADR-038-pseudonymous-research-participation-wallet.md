# ADR-038: Pseudonymous Research Participation Wallet

## Status

Proposed — the repository contains a reviewable implementation behind a closed
real-data activation gate. This records the implemented design; it is not an
accepted ADR and does not authorize real-data activation.

## Classification

Shared Platform credential infrastructure with Civic-owned membership and
research-eligibility policy. It grants no Governance authority.

## Context

Verified members may need to prove project eligibility without disclosing name,
address, email, membership number, Auth0 identity, wallet identifier or a stable
cross-project identifier. Membership/issuer data and research/verifier data must
remain separated. Because Res Publica can associate issuance with a member, the
overall system is described as pseudonymous, not anonymous.

## Proposed Decision

### Conscious activation and local custody

Only a board-verified member receives a wallet offer. Activation is separate,
versioned and optional. A non-exportable device key and a distinct recovery key
are generated locally. The recovery private key is stored only in an AES-256-GCM
package protected by PBKDF2-HMAC-SHA-256 with 600,000 iterations. Private keys
and the recovery code are never sent to the server.

### Implemented credential protocol

The implementation selects W3C Verifiable Credentials Data Model 2.0 with the
`bbs-2023` cryptosuite. The reviewed Digital Bazaar implementation supports the
required Node issuer/verifier and browser holder runtimes; the evaluated
AnonCreds JavaScript binding did not provide that browser holder runtime.

BBS derived proofs randomize every presentation. Mandatory disclosure is limited
to project digest, consent digest, eligibility, a coarse validity window and a
project-specific P-256 public key. Credentials contain no credential or subject
identifier. Each project uses a newly generated holder key, preventing a stable
cross-project identifier. SD-JWT remains excluded because selective disclosure
alone does not meet the unlinkability objective.

### Issuer and verifier separation

Issuance requires session-derived identity, verified membership, current project
eligibility, current project consent/basis, an exact wallet capability and holder
device proof. The verifier uses a separate database/schema/runtime and has no
foreign key or identifier reference to Person, Member, Auth0, wallet, credential
or consent. Project clients are authorized by exact project digest, origin,
audience and token hash.

A verifier challenge is one-time and bound to audience, project, presentation
digest, expiry and project-key signature. A keyed project-local nullifier prevents
duplicate contribution. It cannot be compared across projects. A one-time intake
token is deleted when the anonymous contribution is accepted.

### Anonymous intake boundary

Exact submitter identity is removed locally before transmission. Institutional,
public-authority, company, university, healthcare, programme, procedure and unit
names required for HARM analysis are preserved. Background characteristics are
accepted only from categories in an approved project protocol. Contributions
store only project digest, protocol version, categories, text and date; release
is suppressed below the configured cohort minimum of ten.

### Recovery and revocation

Recovery requires MFA, exact wallet authority and a signature by the local
recovery key over a one-time audience-bound challenge. The old device is revoked
atomically before the new binding is accepted. Wallet revocation blocks all new
issuance and revokes every active device binding.

Issued project credentials are short-lived and cannot be renewed after consent,
eligibility, device or wallet revocation. Maximum residual validity is one
15-minute bucket. This bounded theft window avoids an issuer phone-home status
check but requires explicit independent acceptance.

### Production gate

Synthetic identities may exercise the complete cryptographic path without
persistence. Real credential and verifier endpoints remain fail-closed unless
`RESEARCH_REAL_DATA_ACTIVATION_APPROVED=true` and every architecture, security,
privacy, issuer, verifier and project-client dependency is present.

## Consequences

- The repository performs actual BBS issuance, selective disclosure,
  verification, holder proof, recovery, device rotation, revocation and isolated
  anonymous intake with synthetic data.
- Wallet evidence never creates application authorization or Governance power.
- Infrastructure logs, small cohorts and issuer/verifier collusion remain
  reidentification risks requiring independent assessment.
- Protocol implementation does not imply architectural, legal or Production
  approval.

## Validation Criteria

- No plaintext private key or recovery code reaches an API, database, audit or log.
- Unverified members and missing/withdrawn project basis cannot obtain credentials.
- Presentation, challenge and intake replays are rejected.
- Different projects use different holder keys and nullifier domains.
- Research contributions contain no member or wallet reference.
- Real-data operations remain unavailable until every named gate passes.

## Approval Required

Founder/architecture acceptance; independent cryptographic, application-security
and reidentification review; DPIA/legal review; issuer/verifier operations and key
custody; retention, recovery, incident response and per-project protocol approval.

## References

ADR-027, ADR-029, ADR-033 and ADR-037; W3C Verifiable Credentials Data Model 2.0;
W3C Data Integrity BBS Cryptosuites; OpenID4VCI and OpenID4VP.
