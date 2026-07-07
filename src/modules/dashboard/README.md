# Dashboard

Foundation Build Order Step 5, MVP module #7.

## Purpose

The personalization home: one shared, segment-ordered module manifest, personalized digest, and evidentiary Impact Tracker.

## Integration with other modules

- **`preferences.ts`** requires active `domain/consent` before personalizing.
- **`digest.ts`** reuses `knowledge-graph`'s `lookupEntity`/`relatedEntities` directly.
- **`impact-tracker.ts`** derives evidence from real Community `LadderStageTransition` and Events `OutcomePublication` records — never a computed score.

## Status

Manifest composition, preferences, digest, and impact tracker implemented and tested. Fellow-segment content, RTL/date-rendering verification, and CRM/Analytics consumption deferred (no UI layer exists yet to verify against).
