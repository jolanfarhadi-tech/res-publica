# M1 Persistence

## Status

Implementation baseline, 2026-07-19. Production activation remains subject to
deployment configuration, ADR-027 authorization, and the outstanding legal
approval for the GDPR erasure/pseudonymization path.

## Architecture

- Production database: EU-resident managed PostgreSQL.
- Schema source: `src/persistence/schema.ts` and
  `src/persistence/module-schema.ts`.
- Migration history: `drizzle/`.
- Runtime adapter: `src/persistence/database.ts` using `node-postgres` and
  Drizzle ORM.
- Transaction boundary: `inUnitOfWork()` in
  `src/persistence/repositories.ts`.
- Local integration verification: file-backed PGlite, used only by tests.

The schema contains all six canonical domain tables and every table declared
by the nine MVP module manifests. `src/persistence/schema.test.ts` enforces
manifest-to-schema equivalence.

## Configuration

Set `DATABASE_URL` to the PostgreSQL connection string in the deployment
environment. Never commit credentials. Production must use TLS and an
EU-resident database endpoint.

The application database role must be scoped to the application schema. The
`audit_log_no_update_or_delete` trigger provides database-level protection in
addition to the repository API, which exposes append and read operations only.

## Migration workflow

1. Change the Drizzle schema files.
2. Run `npm run db:generate -- --name=<descriptive-name>`.
3. Review the generated SQL, especially destructive statements and any change
   affecting `audit_log`.
4. Run `npm run db:check`.
5. Run `npm test`, `npm run typecheck`, and `npm run build`.
6. Back up the target database and verify the backup before production
   migration.
7. Run `npm run db:migrate` with the target `DATABASE_URL`.
8. Verify the Drizzle migration journal and execute the persistence smoke tests
   against the migrated environment.

Migrations are forward-only in production. A corrective forward migration is
preferred to destructive rollback. No rollback may delete or rewrite audit
evidence. Restore from a verified backup is the recovery path when a forward
correction is unsafe.

## Atomic audit rule

Every status-relevant domain transition and its audit append must execute in
one `inUnitOfWork()` callback. If either write fails, the complete transaction
rolls back. No caller may write to `audit_log` outside the shared repository
boundary.

## Verification

`src/persistence/persistence.integration.test.ts` applies the real migration
history to a PostgreSQL-compatible file-backed database and proves:

- persisted data survives database shutdown and restart;
- failed state/audit transactions commit neither record; and
- update and delete operations against `audit_log` fail.

These tests validate PostgreSQL-compatible semantics without requiring Docker.
Before milestone acceptance, the same migration chain must also be applied to
the selected managed PostgreSQL staging environment.

## Legal stop condition

Persistence does not activate erasure or pseudonymization. The existing
`AUDIT_LOG_ERASURE_LEGALLY_APPROVED = false` gate remains unchanged. No real
data subject to the unresolved AuditLog erasure regime may be processed until
the required legal/data-protection approval is documented.
