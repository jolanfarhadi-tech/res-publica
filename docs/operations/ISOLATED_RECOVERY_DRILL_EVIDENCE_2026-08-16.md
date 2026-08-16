# Isolated Recovery Drill Evidence — 2026-08-16

## Scope and result

`npm run ops:recovery-drill:local` completed successfully against two isolated
temporary PGlite directories using synthetic data only. The source applied all
24 journaled main migrations and contained the expected 98 public tables. It
then produced a non-empty compressed in-memory backup and restored that backup
into a separate target.

The restored target verified:

- the exact ordered migration-hash set and public table-name set matched the
  source and current repository migration chain;
- 24 migrations and 98 tables were present;
- zero PostgreSQL constraints were unvalidated;
- the synthetic canonical audit record was byte-stably represented by the
  same digest before and after restore;
- a revoked authentication session did not become active;
- a revoked authorization grant did not become active;
- a revoked research wallet did not become active;
- the real-research activation gate remained an independent prerequisite;
- no Production connection or real personal/research data was used.

The backup was hashed in memory for the run and deleted with both temporary
directories after verification. The command emits no row contents, temporary
paths or secret material.

## Provider evidence boundary

This is real backup→restore execution of the current repository schema, but it
is not a new Neon provider restore and does not prove current provider RPO/RTO,
backup independence, retention or destructive cutover authority. The separate
2026-08-10 Neon drill remains valid historical evidence for its named 19/66
Production recovery point. A current 24/98 Neon drill requires an authorized
isolated branch and secret connection supplied outside source control.
