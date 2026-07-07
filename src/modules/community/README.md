# Community

Foundation Build Order Step 5, MVP module #4.

## Purpose

Tracks, with explicit consent, where a person sits on the Community Journey ladder (anonymous → identified interest → first touch → contributing participant → recurring supporter), and generates per-language evangelism invitations.

## Integration with other modules

- **`consent.ts`** reuses `domain/consent` directly — no parallel consent mechanism.
- **`ladder.ts`** writes a real `domain/audit-log` entry on every stage transition.
- **`publishing-integration.ts`** derives a content-view touchpoint from a real Publishing `PublishCommit`.
- Touchpoints can reference a Knowledge Graph entity id (`relatedEntityId`) directly.

## Explicitly not integrated with AI Layer

The approved architecture (`mvp-module-blueprint.md`) states for this module: *"AI Features: None... this is the module where the standing 'no ML scoring, ever' principle matters most."* No file here calls the AI Layer — this is a deliberate scope boundary, not an oversight.

## Status

Ladder, consent, evangelism mechanics, and Publishing integration implemented and tested. Membership integration deferred until the Membership module exists.
