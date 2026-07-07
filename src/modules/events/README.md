# Events

Foundation Build Order Step 5, MVP module #6.

## Purpose

Registration, waitlist/capacity management, event-scoped logistics Q&A, and post-event outcome publishing.

## The critical guardrail

`qa.ts` filters the Knowledge Graph down to only the querying event's own entities *before* passing it to the AI Layer's local provider — Event B's data is structurally absent, not merely filtered by convention. This is the spec's own stated "single most important guardrail."

## Integration with other modules

- **`registration.ts`** writes real `domain/audit-log` entries and `domain/notification` records.
- **`qa.ts`** reuses `ai-layer`'s `createLocalProvider`/`queryAILayer` with a scoped Knowledge Graph, not a reimplemented AI mechanism.
- **`outcomes.ts`** creates real `domain/notification` records for every confirmed registrant.

## Status

Registration, waitlist promotion, capacity checks, scoped Q&A, and outcome publishing implemented and tested. Dashboard/CRM/Analytics consumption deferred until those modules exist.
