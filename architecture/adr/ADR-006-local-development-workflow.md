# ADR-006: Local Development Workflow

## Context

Several MVP modules depend on real, potentially costly, or credential-gated services: the AI Layer's LLM/embedding API calls (governed by a hard monthly spend ceiling, per ADR-008), the Tier 3 EU-resident production database (holding real PII once Events and Membership are live), and Membership's payment-provider integration. Routine local development must not silently consume real budget or touch real personal/payment data.

## Decision

`respublica dev` (ADR-005) boots the local environment against a disposable, fixture-seeded database (`respublica seed-local`, populated with fake Person/ConsentRecord/Payment/Organization/Content records) instead of the real Tier 3 database; a mocked AI Layer that returns clearly-labeled "MOCK RESPONSE" answers instead of making real model calls; and a stubbed payment provider that simulates success/failure on command instead of a real payment gateway. Tier 1 content (MDX-in-Git) needs no special local handling, since it was already static-first by design.

## Alternatives Considered

- **Give every engineer a scoped-down but real API key.** Rejected — even a scoped-down key still risks consuming real budget against the shared monthly ceiling and still touches production-adjacent infrastructure, which the mock approach avoids entirely.
- **Run a genuinely offline, locally-hosted small model as a stand-in for the AI Layer.** Rejected as disproportionate infrastructure work for MVP-stage local development; a clearly-labeled mock achieves the same practical goal (develop without live-service dependency) at a fraction of the setup cost.
- **Skip a special local workflow and point local development at a staging environment instead.** Rejected — staging still spends against the same real cost ceiling and doesn't resolve the PII-handling concern, since staging would need to either use real data (unacceptable) or already be running its own fixture data (which is what the local workflow provides directly, without the staging deployment overhead).

## Consequences

Fixture data must be kept in sync with schema changes as the Core Domain Model (ADR-002) evolves, or local development silently breaks or becomes unrepresentative of production behavior — this is an explicit, ongoing Local Dev Agent (ADR-004) responsibility, not a one-time setup task. Mock responses that are too realistic risk an engineer mistaking mocked behavior for real production behavior during testing; the "MOCK RESPONSE" labeling must be impossible to miss.

## Future Impact

As Knowledge Graph and AI Layer grow more sophisticated in V2/V3 (richer entity types, more nuanced grounding), the mock's fidelity needs to grow correspondingly, or local development stops accurately representing what engineers are actually building against. This workflow is also the concrete instance of the broader Offline-first Development principle (ADR-010) — any future change to how AI Layer or Tier 3 behave in production should be reflected here first, since the local workflow is meant to mirror real degraded-mode behavior, not diverge from it.
