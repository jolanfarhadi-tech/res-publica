# Neon backup and restore-drill runbook

## Safety boundary

This is a non-destructive technical procedure. Never run a restore drill
against Production, never overwrite the Production branch, and never expose a
connection string in a terminal transcript, ticket, or Git. A Production
restore requires explicit owner authorization and an incident record.

## Unapproved service objectives

RPO and RTO have not been approved. Before launch, the owner must select them
from the contracted Neon plan's actual point-in-time recovery and operational
limits. Until then, neither recoverability time nor acceptable data-loss
window may be claimed.

## Pre-migration evidence

1. Confirm the exact Neon Production project and EU region.
2. Confirm TLS, active backup/branch history, and the latest restorable point
   in the Neon console.
3. Record the deployed commit, current Drizzle migration journal, table count,
   and snapshot/branch identifier without recording credentials.
4. Obtain explicit migration authorization.
5. Run only the repository's journaled forward migrations.

## Safe restore drill

1. Create an isolated non-Production branch from an owner-approved restore
   point in the same EU project.
2. Create a temporary least-privilege test role for that branch.
3. Supply its direct TLS URL only through a local secret file or ephemeral
   environment variable.
4. Verify migration journal, expected table count, foreign keys, and a
   read-only sample of non-sensitive integrity checks.
5. Run the application readiness query and repository database checks against
   the isolated branch.
6. Record elapsed recovery time, restore point, checks, deviations, and
   reviewer approval without values or personal records.
7. Delete the isolated branch and temporary role only after explicit owner
   confirmation that evidence is retained. This deletion is destructive and
   is not authorized by the runbook itself.

The repository provides `npm run ops:restore-drill` for step 4. It refuses the
Production branch ID, requires a `restore-drill-` branch name, obtains the
connection only from an ephemeral environment secret, enforces a Neon host,
certificate-authorized TLS and a read-only SQL transaction. It does not invoke
or download a mutable provider CLI. Required environment names are
`NEON_RESTORE_DRILL_PROJECT_ID`, `NEON_RESTORE_DRILL_BRANCH_ID`,
`NEON_RESTORE_DRILL_BRANCH_NAME`, `NEON_PRODUCTION_BRANCH_ID`,
`NEON_PRODUCTION_DATABASE_HOST`, `NEON_RESTORE_DRILL_DATABASE_URL`,
`NEON_RESTORE_EXPECTED_MIGRATIONS`, and `NEON_RESTORE_EXPECTED_TABLES`. The
non-secret Production hostname is required so the verifier rejects a restore
URL aimed at that endpoint. Never place the URL in shell history or Git.

The completed 2026-08-10 drill is recorded in
`NEON_RESTORE_DRILL_EVIDENCE_2026-08-10.md`. The current schema restored as 19
migrations and 66 tables. This evidence does not approve RPO/RTO.

The repeatable local Phase-E drill is separately available as
`npm run ops:recovery-drill:local`. It validates the current 25-migration,
102-table repository state with synthetic revoked-access and audit fixtures. It
does not replace or overstate the historical Neon provider evidence.

## Production recovery decision

Prefer a corrective forward migration when safe. A restore is justified only
when the incident commander, database owner, and data-protection owner accept
the recovery point and loss window. Canonical AuditLog evidence must not be
silently rewritten or selectively removed.
