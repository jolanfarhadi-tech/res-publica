# ADR-007: Knowledge Graph

## Context

Today's search is a flat, per-locale keyword JSON index built at compile time. The AI Layer needs real grounding data to answer questions with genuine citations rather than guesses, and there is currently no way for the site to surface cross-collection "related content" (a research finding connected to the dialogue and policy position it actually informed) without an editor manually tagging every such connection by hand.

## Decision

Build a deterministic entity/relationship graph (people, organizations, topics, legislation, dialogues, findings), extracted automatically from Git-committed MDX at build/index time. No relationship goes live without appearing in the extraction pipeline's own output — there is no separate path where an AI system freely infers and publishes a connection without it passing through this deterministic process.

## Alternatives Considered

- **Hand-curate relationships editorially.** Rejected — this doesn't scale with content volume and duplicates work the automated extraction performs for free; it also doesn't get better as the corpus grows, whereas the automated approach does.
- **Let the AI Layer infer relationships live, at query time, with no persisted graph.** Rejected — this makes grounding non-auditable and non-reproducible; two identical queries at two different times could surface different, un-reviewable relationships, which is incompatible with the citation-and-provenance discipline the platform's credibility depends on.
- **A fully AI-generated graph, built once by a generative pass over the content with no deterministic extraction step.** Rejected — this reintroduces exactly the hallucination risk (an invented connection presented as fact) that the platform's core trust principle exists to prevent.

## Consequences

Entity-resolution quality — correctly matching name variants for the same person or organization across German, English, and Persian content — becomes an ongoing content-quality concern that needs monitoring, not a one-time build task that's solved once and forgotten.

## Future Impact

This graph is the substrate the Public API's (V3, per the Master Product Blueprint) read-only Content Graph endpoint will eventually expose to academic partners. Its quality bar should already anticipate that future, higher-scrutiny external audience — an entity-resolution error that's a minor inconvenience for on-site "related content" today becomes a credibility problem once the graph is queryable by outside researchers.
