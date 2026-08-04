# Internal DPIA Draft — Research Wallet and Anonymous Intake

**Status:** DRAFT FOR DPO/LEGAL REVIEW. This engineering assessment is not legal
approval and is not a public privacy notice.

## Processing boundary

Membership and issuer processing knows the authenticated person, verified
membership, project eligibility and project consent. It stores public device and
recovery keys, temporary hashed challenges, wallet state and canonical audit
evidence. Holder private keys and recovery codes remain local.

The separate verifier receives a randomized BBS presentation, project/consent
digests, a project-specific public key, challenge signature and anonymous
contribution. It stores a keyed project nullifier, one-time token,
protocol-defined background categories, contribution text and date-only receipt.
It stores no Person, Member, Auth0, wallet, credential, consent, email, address,
membership number, global key or cross-project identifier.

## Necessity and minimisation

- Membership identity is used only for account, board decision, eligibility and
  accountable issuance.
- BBS selective disclosure replaces direct membership disclosure to projects.
- Local redaction removes exact submitter identity before transfer while
  preserving institutions/procedures needed by HARM analysis.
- Required background categories must be enumerated in an approved protocol;
  free-form demographic fields are rejected.
- Release is suppressed below a project cohort minimum of ten.

## Risks and controls

| Risk | Engineering control | External decision |
|---|---|---|
| Issuer/verifier linkage | separate DB/runtime, no common ID | separate operators/network/log review |
| Timing correlation | quarter-hour credentials, date-only contribution | hosting/traffic audit |
| Cohort reidentification | fixed categories, minimum cohort | per-project statistical review |
| Theft/replay | project-key proof, nonce/audience, token/nullifier | accept 15-minute residual validity |
| Recovery takeover | MFA, exact scope, encrypted recovery key, signed challenge | ceremony/penetration test |
| Secondary use | project protocol and current consent/basis | lawful basis/purpose/retention approval |

## Rights and lifecycle

General readiness is optional and withdrawable without changing membership.
Project consent is separate; withdrawal invalidates future eligibility and
issuance. Wallet revocation blocks renewal and devices. Erasure, retention,
backup expiry and response periods require approved operations before real data.

## Conclusion

The architecture reduces disclosure but cannot prove anonymity against colluding
infrastructure, timing analysis, small cohorts or access to issuer records. Real
processing remains prohibited pending DPO/legal review, reidentification audit,
lawful basis, retention, processor agreements and rights procedures.
