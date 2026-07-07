# Analytics (core scope)

Foundation Build Order Step 5, MVP module #9 — the final MVP module.

## Purpose

The single authoritative internal measurement surface for civic effect. Explicitly excludes any attention/engagement metric.

## Integration

`metrics.ts` derives real `Person`/Community data, no parallel tracking. `ai-spend-status.ts` reads `ai-layer`'s own ledger directly — no independent usage record. `impact-feed.ts` surfaces Dashboard's own evidence records faithfully, never re-derived.

## Status

Metrics, funnel reporting, AI spend status, and impact feed implemented and tested. Report export deferred (no persistence/export format decided yet).
