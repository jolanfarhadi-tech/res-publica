# Security Operations

This Governance-domain module records privacy-minimized technical incident
observations, evidence-bounded attribution claims and human-reviewed incident
correlations. It uses exact capability grants, MFA, separation of duties and
the canonical append-only `AuditLog`; it is not a parallel administrative or
audit authority.

Levels A–D cover technical source, bounded digital actor/session, behavioral
cluster and campaign hypothesis. The implementation cannot create Level E
real-world identity claims. One shared IP, endpoint, user agent or technique is
insufficient to establish incident relatedness, and a compromised account does
not identify the person who performed an action.

Raw network addresses, Auth0 subjects, session IDs and API credential IDs are
transient inputs only. A deployment secret creates incident-scoped HMAC
handles before persistence. Query strings and full User-Agent strings are not
stored. Provider enrichment is not performed by this module and requires a
separately approved passive provider, DPA, source record and retention policy.

The module performs no source scanning, counter-intrusion or hack-back. Its
records describe defensive evidence and hypotheses only.

The Phase-G correspondence engine connects ordered, synthetic Loops 1–5 to a
fixed A→A′ policy allowlist. E0/E1 may execute only reversible observation or
inert-decoy state; E2/E3 create bounded operator-reviewed alert/quarantine
preparation. They do not terminate sessions, change provider configuration,
disable Research or AI, rotate secrets, or create permanent policy. All
signals, decisions and state transitions are append-only and evidence-linked.
