# ADR-008: AI Layer

## Context

Res Publica's entire institutional credibility rests on being independent, rigorous, and sourced. Any AI-facing feature that answers a civic question from the model's general background knowledge rather than the organization's own published, reviewed content would undermine that credibility on first contact — precisely the failure mode a democracy-focused nonprofit can least afford.

## Decision

Build one shared, grounded RAG service — the "Grounded Civic Copilot" — consumed by every other module rather than reimplemented per module. It enforces a hard citation-or-refuse rule (an answer with no supporting citation is suppressed, never shown as if confident), uses one multilingual embedding model spanning German, English, and Persian in a single semantic space, and operates under a tiered-model cost strategy with a hard monthly spend ceiling that falls back automatically to plain keyword search if exceeded.

## Alternatives Considered

- **A general-purpose chatbot answering from the model's background knowledge.** Rejected outright — explicitly named as out of scope in the MVP Module Blueprint's own "what must not be built" section; this is the single clearest line this project draws around AI behavior.
- **Let each module (Events, Publishing, Community) integrate its own AI calls independently.** Rejected — duplicates integration cost across modules and risks inconsistent grounding discipline, where one module's implementation might enforce the citation-or-refuse rule less strictly than another's.
- **No spend ceiling; pay-as-you-go model usage.** Rejected as incompatible with grant-funded nonprofit budgeting, where an unbounded, usage-driven bill is a real organizational risk, not just an engineering inconvenience.

## Consequences

Every module wanting AI capability must route through this one shared layer — a deliberate chokepoint that should never be bypassed even under deadline pressure, since bypassing it would mean bypassing the citation-enforcement and cost-governance guarantees at the same time. This also means an AI Layer outage or cost-ceiling trip has platform-wide reach; the Foundation Review noted that while query-answering has an explicit keyword-search fallback, Publishing's draft-authoring and Events' logistics Q&A do not yet have an equally explicit fallback behavior of their own.

## Future Impact

As model costs fall and multilingual quality improves industry-wide, the cost-governance ledger's tiering thresholds should be periodically revisited — explicitly the Eco Accountability Agent's (ADR-004) job — rather than left as a one-time configuration decision made at MVP launch and never revisited as the underlying economics change.

## Amendment (Foundation Stabilization)

Two clarifications, both closing ambiguity the Foundation Review found rather than changing this ADR's decision:

1. **AI Layer is the sole owner of raw cost/usage data.** Analytics reads and aggregates this ledger for reporting; it does not maintain an independent copy. The Operating System, Master Product Blueprint, and MVP Module Blueprint have been updated to state this explicitly, since both documents had independently defined overlapping ledger entities before this correction.
2. **The Moderator-Synthesis Assist endpoint is explicitly staff-only, not publicly accessible.** This was always the intent but was not stated as an access-control requirement anywhere in the original specification; it now is, across all three documents referencing this endpoint.
