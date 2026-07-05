# ADR-010: Offline-first Development

## Context

Res Publica's core mission — keeping citizens informed — should not become dependent on every external service being simultaneously available. This matters for civic-trust reasons (a citizen should not lose access to previously-published research because a vector store happens to be down) and for practical operational reasons (a 1–3 engineer nonprofit team cannot realistically guarantee 24/7 uptime of every dependency it introduces).

## Decision

Adopt "offline-first" as a platform-wide architectural principle, not merely a local-development convenience. Tier 1 static content remains fully readable with zero live service dependencies, by construction (ADR-001). The AI Layer degrades to plain keyword search rather than failing outright when its cost ceiling is reached or the service is unavailable (ADR-008). The Local Development Workflow (ADR-006) is designed to mirror this same degradation path deliberately, so that what engineers routinely test locally is the same resilience behavior real users would experience during a genuine production outage — not a fundamentally different, untested code path that only runs when something has already gone wrong.

## Alternatives Considered

- **Treat "offline" as purely a local-development nicety with no production implication.** Rejected — this would miss the opportunity to make the platform's actual production resilience match its development experience, meaning the degraded-mode code path would rarely be exercised or trusted, since it would only run during real incidents rather than routinely during normal development.
- **Require live AI/database connectivity for any page to render at all.** Rejected — this directly contradicts the Static Core's speed and reliability guarantee (ADR-001) and the organization's civic-access mission, which depends on published information remaining accessible independent of the health of newer, added-on services.

## Consequences

Every new module must define its own answer to "what happens when my dependency is unavailable," not just its happy-path behavior — this becomes a standing item the Review & Validation Agent (ADR-004) checks before any module is considered complete, per the Foundation Review's own recommendation that fallback behavior needs to be explicit for every AI-consuming module, not just the query-answering path that currently has it.

## Future Impact

As the platform adds more live, real-time services in V2/V3 (the Public API, real-time multilingual dialogue bridging), this principle should be the first question asked of each new capability: what does degraded-but-functional look like, not only what does fully-operational look like. A feature that has no coherent answer to that question should be treated as architecturally incomplete, regardless of how well its happy path works.
