# A→A′ defensive correspondence model

Status: repository implementation for Mandatory hardening Phase G. This model
does not authorize Production configuration changes or real Research data.

## Invariant and boundary

`A` is an observed adversarial action. `A′` is selected only by a frozen Res
Publica policy. Attacker-controlled text, payloads, model output and arbitrary
commands are not accepted as actions. A′ executes only inside authorized Res
Publica infrastructure. Counter-intrusion, source scanning, attacker-device
access and hack-back are prohibited.

The executable sequence is `normalize → classify → correlate → evidence check
→ policy match → A′ → execute → verify → append result`. All persisted signals,
decisions and state transitions are append-only. Canonical audit is written
atomically with each evaluation, review or rollback.

## Loops 1–5

1. Initial decoy signal: one bounded observation; no authority and no real data.
2. Controlled honeypot engagement: a second independent synthetic signal.
3. Independent high-value confirmation: inert assets only.
4. Adaptive attribution: bounded defensive hypothesis testing inside Res
   Publica; no access to a source system.
5. Defensive Shadow confirmation: behavior-derived synthetic evidence that can
   inform policy evaluation but cannot overwrite Membership, Fellowship,
   Research, Knowledge Graph or Publishing facts.

Events must be ordered, cannot skip a loop, cannot be replayed, and must retain
evidence references. Loop labels are evidence states, not proof of identity.

## Evidence and impact classes

- E0: isolated, duplicated or contradicted evidence. Class 0 `WATCH_ROUTE`.
- E1: at least two independent references through Loop 2. Class 1 inert
  `ACTIVATE_DECOY_BRANCH` state.
- E2: at least three independent references through Loop 3. Class 2
  `ALERT_OPERATOR`, requiring independent review.
- E3: at least five independent references, Loop 5 and explicit confirmed-
  compromise evidence. Class 3 `PREPARE_QUARANTINE`, requiring independent
  review.

Class 4 structural actions—secret rotation, Research activation, database
privilege, permanent policy and disaster-recovery cutover—are represented in
the allowlist but are not executable by this application service. They require
deterministic external procedure and the applicable human/dual approval.

The implementation deliberately does not automatically terminate sessions,
revoke tokens, isolate accounts, freeze writes, quarantine capabilities,
disable AI/RAG, close Research or rotate secrets. Existing deterministic
quarantine and Research fail-closed controls remain separate and operator-
controlled.

## Anti-poisoning and self-denial resistance

One malformed request, 403, decoy hit, suspicious prompt or spoofable network
signal cannot trigger high-impact containment. Contradictory evidence lowers
the decision to E0. Replayed, reordered, scope-mixed and loop-skipping events
are rejected. A single source cannot create permanent rules. Research, AI/RAG
and administrator-themed probes receive only Class 0/1 treatment without the
independent composite evidence and review required by higher classes.

The only automatic states are reversible observation and inert synthetic
branch activation. Optional Security Operations failure does not take down the
public website. Authorization uncertainty, Research uncertainty and issuer
uncertainty retain their existing fail-closed behavior.

## Effect verification and rollback

An action is not considered effective because a function returned success.
The append-only lifecycle is `PROPOSED → [APPROVED] → EXECUTED →
EFFECT_VERIFIED → ROLLED_BACK`; rejection is terminal. Rollback is impossible
before effect verification. Higher-impact preparation requires an independent
recent-MFA reviewer with exact action scope and separation from both incident
opener and evaluator.

The current verified effect is deliberately narrow: the Security Operations
ledger and protected overview reflect the selected observational, inert-decoy,
alert or quarantine-preparation state. Provider-side or cross-service effects
remain external procedures and must never be inferred from this ledger.

## Privacy and operations

The policy engine references minimized Phase-F evidence; it accepts no raw IP,
Auth0 ID, session secret, token, request payload or arbitrary prose. Operator
person IDs stay in protected database records and canonical audit but are not
returned by the Security Operations overview. Retention, incident holds,
Production migration, named operators and provider evidence remain external
gates.

## References

- `docs/security/TECHNICAL_ATTRIBUTION_MODEL.md`
- `docs/security/ZERO_DAY_BLAST_RADIUS_MATRIX.md`
- `docs/operations/CAPABILITY_QUARANTINE_RUNBOOK.md`
- `docs/operations/DEFENSIVE_CORRESPONDENCE_RUNBOOK.md`
- `src/modules/security-operations/defensive-correspondence.ts`
- `src/application/defensive-correspondence.ts`
