# Technical attribution security model

Status: repository implementation for Mandatory hardening Phase F; provider,
retention and operational-owner evidence remains external.

## Purpose and non-goals

The Security Operations module supports defensive analysis of activity against
Res Publica-controlled systems. It does not identify attackers, scan source
systems, access attacker devices, or perform hack-back. An IP address is not a
person; a compromised account is not proof that its owner performed an action;
a VPN exit is not an attacker location; and a shared technique is not proof of
common authorship.

The implemented levels are:

- A — technical source;
- B — bounded digital actor or session;
- C — behavioral cluster;
- D — campaign hypothesis.

Level E, real-world identity, cannot be created by the module or its HTTP
schemas. Independent lawful evidence and a separately governed human process
would be required outside this automated boundary.

## Data minimization

Raw source addresses, Auth0 subjects, session identifiers and API credential
identifiers may enter the protected ingestion boundary when technically and
lawfully available. They are transformed before persistence with HMAC-SHA-256
and a server-only secret. Handles rotate by UTC observation day, allowing
bounded same-day technical correlation without creating a permanent
cross-incident identifier. The secret and raw input are never returned or
logged by application code.

Query strings are removed from routes. Full User-Agent strings are reduced to
the coarse families Chromium, Firefox, Safari or other. Observation arrays use
allowlisted assets and techniques and are bounded. Attribution prose rejects
obvious raw IP, email, Auth0-subject, bearer-token and query-secret literals.
Evidence, claims and correlations are append-only at the PostgreSQL trigger
boundary.

The repository does not perform ASN, provider, cloud, VPN/proxy, Tor, coarse
region, reverse-DNS or reputation lookups. Such passive enrichment may be added
only with an approved source, DPA/transfer review, legal basis, retention,
access owner and source timestamp. Unauthorized active scanning is prohibited.

## Evidence contract

Every stored attribution claim contains the claim, observation references,
explicit inferences, contradictory evidence, alternative explanations,
qualitative confidence (`LOW`, `MODERATE`, `HIGH`), source and timestamp. The
system has no numerical confidence model.

Each observation has a SHA-256 evidence hash and a canonical audit append in
the same transaction as incident creation. Each claim and correlation also has
an atomic canonical audit append, including session, server request ID,
capability and bounded reason. The incident opener cannot author its
attribution claim or correlation; exact Governance capability and current MFA
remain mandatory.

## Temporal correlation

Correlation consumes independent allowlisted signal classes: infrastructure,
route order, timing, retry behavior, protocol, session transition, source
switching, deception/canary interaction, technique sequence, error pattern,
defensive response and targeting preference.

- one signal: `INSUFFICIENT EVIDENCE`;
- two independent signals: `POSSIBLY RELATED`;
- three or more independent signals without contradiction: `LIKELY RELATED`;
- a decisive mutually exclusive contradiction: `NOT RELATED`.

Outputs always retain alternative explanations and never state “same person.”
The deterministic thresholds are conservative policy categories, not a
validated probability model.

## Access and activation

Reads require exact `security.operations.read` authority for
`security-operations` plus MFA. Incident creation requires exact
`security.incident.record` authority and recent MFA. Claims and correlations
require exact incident-scoped attribution authority and recent MFA. All writes
use the distributed PostgreSQL limiter, declared-body budget, trusted-origin
check and capability quarantine.

The module is deployed safely with no grants and no
`SECURITY_ATTRIBUTION_CORRELATION_SECRET`; ingestion then fails closed while the
public site remains available. Provider security-event export, approved
retention, named Security Operations roles and Production migration remain
explicit external gates.
