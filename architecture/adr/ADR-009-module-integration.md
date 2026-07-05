# ADR-009: Module Integration

## Context

The Master Product Blueprint defined each of the 20 modules' dependencies and connections independently, module by module. No single document showed the whole system's actual data flow in one place — and the Foundation Review found that this gap was not merely theoretical: the first attempt at drawing that unified picture (Foundation Architecture, Section 7) itself contained a directional error (the Events/Community connection was written backwards) and a missing connection (Membership → Analytics, despite Analytics' own dependency list naming Membership System).

## Decision

Maintain one integration map (Foundation Architecture, Section 7, as corrected by this Foundation Review) with an explicit architectural rule: Website & CMS, Knowledge Graph, and AI Layer form the "content and grounding" spine; Community, Membership, and Events form the "participation and relationship" spine; Dashboard, CRM, and Analytics are downstream consumers of both spines and must never block either one.

## Alternatives Considered

- **Let each module's own dependency list stand alone, with no unified map.** Rejected — this is exactly the state that let the directional error and missing connection go unnoticed until an explicit review pass looked at the whole system at once; per-module lists alone don't surface cross-module inconsistencies.
- **A fully synchronous, request/response integration style throughout the platform.** Rejected — this would let a Dashboard, Analytics, or CRM outage block core content publishing or participation tracking, directly contradicting the "downstream never blocks upstream" guarantee the tiering (ADR-001) exists to provide.

## Consequences

The map's async, event-driven connections are only real if a genuine event/queue mechanism is built to implement them; if implemented instead as direct synchronous calls under time pressure, the stated resilience guarantee becomes false without anyone having decided that on purpose. This is flagged as an open architectural risk in the Foundation Review and should be resolved with an explicit choice of event/queue technology before Phase 1 modules that rely on async connections are built.

## Future Impact

Every future V2/V3 module must be checked against the "downstream never blocks upstream" rule and added to this map explicitly before being considered integrated — not simply assumed compatible because its own module-level spec lists a dependency. The pattern that produced this ADR's own corrections (an independent review pass catching what individual module specs missed) should be repeated at each major module-count milestone, not treated as a one-time Foundation-phase exercise.

## Amendment (Foundation Stabilization)

The two specific errors named in this ADR's Context have been corrected in the integration map (Foundation Architecture, Section 7): the Events/Community row now correctly reads Events → Community (a registration originates in Events and signals Community, not the reverse), and the previously-missing Membership → Analytics row has been added, matching Analytics' own declared dependency on Membership System. No other rows were changed.
