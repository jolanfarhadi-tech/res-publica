# External Audit Package — Research Wallet

**Status:** REVIEW PACKAGE. No approval is implied.

## Inputs

- ADR-037 and ADR-038.
- Research Wallet Threat Model, internal DPIA draft and internal security review.
- Main migrations 0014–0018 and isolated `drizzle-research` chain.
- Wallet, issuer, verifier, intake, redaction, protocol and API source/tests.
- Production lockfile and zero-vulnerability runtime audit result.

## Required independent work

1. BBS cryptographic implementation and interoperability audit.
2. Browser custody, recovery, theft and device-change penetration test.
3. Issuer/verifier collusion, network, timestamp, logs, backups and cohort
   reidentification assessment.
4. API authorization, rate-limit, replay, race and denial-of-service testing.
5. DPO/legal DPIA, lawful basis, transparency, retention, erasure and DPA review.
6. Operational review of issuer key custody/rotation, verifier isolation,
   recovery, incident response and project onboarding.

## Required returned evidence

- Scope, versions, environment and reviewer independence.
- Findings with severity, reproduction and remediation verification.
- Accept/reject decision for the 15-minute bounded revocation design.
- Reidentification conclusion and safe cohort rules per project.
- Signed decision for each subordinate activation gate.

No result changes runtime automatically. An accountable owner must record all
approvals and explicitly set `RESEARCH_REAL_DATA_ACTIVATION_APPROVED=true`.
