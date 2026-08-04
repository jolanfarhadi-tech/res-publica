# Research Wallet Threat Model

**Status:** Engineering review draft. Real credentials and research data remain
disabled by `RESEARCH_REAL_DATA_ACTIVATION_APPROVED`.

## Protected properties

- Holder device/recovery/project private keys remain local.
- Projects receive no direct identity, Membership/Auth0/wallet identifier, global
  public key, cross-project identifier or traceable audit/transaction reference.
- Membership, readiness, consent, eligibility, withdrawal and contribution remain
  separate lifecycle facts.
- Wallet evidence never becomes an authorization grant.

## Implemented boundary

The repository implements local non-exportable device keys, encrypted recovery,
BBS issuance and randomized derived proofs, per-project keys, audience-bound
one-time challenges, an isolated verifier database, project-local duplicate
nullifiers, one-time intake tokens, local identity removal, protocol-defined
background categories, cohort suppression, device rotation and wallet revocation.

## Threats and controls

| Threat | Implemented control | Required external review |
|---|---|---|
| Silent activation | verified-member offer plus explicit opt-in | accessibility/usability test |
| Private-key exfiltration | strict request schemas; local WebCrypto/IndexedDB | browser/device penetration test |
| Cross-project correlation | new project key, randomized proof, project-keyed HMAC domain | multi-project traffic analysis |
| Issuer/verifier collusion | separate DB/runtime; no shared identifiers | separate operators/accounts/log audit |
| Small-cohort reidentification | fixed categories; cohort minimum >= 10 | statistical disclosure review |
| Timing correlation | quarter-hour credential window; date-only contribution | network/hosting log assessment |
| Replay/double submission | nonce, audience, holder signature, one-time challenge/token/nullifier | concurrency/clock-skew test |
| Recovery takeover | MFA, exact scope, encrypted recovery key, signed one-time challenge | recovery ceremony/penetration test |
| Lost/stolen credential | project key possession, duplicate block, <=15-minute validity | accept or replace bounded residual window |
| Stale consent | current consent checked at issuance; withdrawal invalidates eligibility and renewal | residual-window decision |
| Server/database compromise | no private keys; verifier has no identity refs; least-privilege schema | key custody/backup review |
| Governance escalation | Civic-only capabilities; verifier never accesses grants | authorization audit |

## Reidentification assessment

Res Publica can associate issuer-side wallet and eligibility records with a
Person. An infrastructure operator could also correlate issuer and verifier
traffic. The complete system is therefore pseudonymized, not proven anonymous.
The isolated contribution database has no direct lookup path, but distinctive
text/categories, timing, logs, backups or collusion can still reidentify.

## Residual risks

- Independent BBS cryptographic/interoperability review is absent.
- A stolen credential and project key can be used until its current 15-minute
  validity bucket expires, though duplicate contribution remains blocked.
- Same-platform access logs require separate operational controls and retention.
- IndexedDB inherits browser-profile/device compromise risk.
- Statistical reidentification must be assessed per project.

## Stop condition

Do not enable real issuance, verifier acceptance or research intake until
ADR-038 and the cryptographic, reidentification, DPIA, legal, key-custody,
retention, incident-response, verifier-isolation and project-protocol gates are
approved. Synthetic no-persistence smoke tests are permitted.
