# Neon Restore Drill Evidence — 2026-08-10

## Scope and result

**Verified:** a non-destructive restore drill was completed in Neon project
`noisy-scene-43693651` (`res-publica-production`, `aws-eu-central-1`). The
protected default branch `br-cool-wind-asz1jijh` (`production`) was never the
verification target and no restore was finalized onto it.

The newest pre-existing automated snapshot (`snap-square-base-asa773a1`) was
first restored to an isolated branch. It correctly exposed that the snapshot
contained only 14 migrations and 55 tables and therefore could not evidence
recovery of the current schema. No application write was made.

A new manual snapshot of the current Production head was then created as
`snap-blue-bird-asw89bor` (`production 19 migrations restore drill
2026-08-10`) and restored without `--finalize` to the isolated branch
`br-icy-voice-as3i80db` (`restore-drill-20260810-0122`).

## Verification evidence

- client transport: encrypted, certificate authorized, TLS 1.3;
- Drizzle migration journal: 19 entries;
- public base tables: 66;
- unvalidated PostgreSQL constraints: 0;
- application readiness query: successful;
- repository expected state: 19 migrations / 66 tables;
- Production branch: still protected, default and not targeted.

Only read-only `SELECT` checks were executed against the restored branch. The
connection value was held in process memory and was not written to a file or
recorded in this evidence. The two agent-created drill branches
`br-lively-cloud-as6cti61` and `br-icy-voice-as3i80db` were deleted after the
evidence was retained. The manual snapshot remains as a recoverable reference.

## Important limitation

This proves technical restoration of the current database schema at the named
point. It does not approve an organizational RPO or RTO, does not prove every
business record semantically correct, and does not authorize a destructive
Production restore. RPO/RTO, incident authority and any real Production
replacement remain owner decisions.
