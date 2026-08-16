import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const SYNTHETIC = Object.freeze({
  personId: "recovery-drill-person",
  identityId: "recovery-drill-identity",
  sessionId: "recovery-drill-revoked-session",
  grantId: "recovery-drill-revoked-grant",
  walletId: "recovery-drill-revoked-wallet",
  auditId: "recovery-drill-audit",
});

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function expectedSchema(migrationsFolder) {
  const journal = JSON.parse(
    await readFile(join(migrationsFolder, "meta", "_journal.json"), "utf8")
  );
  const sqlFiles = (await readdir(migrationsFolder))
    .filter((file) => /^\d{4}_.+\.sql$/.test(file))
    .sort();
  const journalFiles = journal.entries.map((entry) => `${entry.tag}.sql`);
  if (JSON.stringify(sqlFiles) !== JSON.stringify([...journalFiles].sort())) {
    throw new Error("Recovery drill migration journal does not match SQL files");
  }

  const tableNames = new Set();
  const migrationHashes = [];
  for (const file of journalFiles) {
    const sql = await readFile(join(migrationsFolder, file), "utf8");
    migrationHashes.push(sha256(sql));
    for (const match of sql.matchAll(/CREATE TABLE\s+"([^"]+)"/gi)) {
      tableNames.add(match[1]);
    }
  }
  return {
    migrationHashes: migrationHashes.sort(),
    tableNames: [...tableNames].sort(),
  };
}

async function seedSyntheticRecoveryState(client, now) {
  const timestamp = now.toISOString();
  const later = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  await client.query(
    `insert into people (id, name, contact, locale, rtl_preference, created_at)
     values ($1, $2, $3::jsonb, 'en', false, $4)`,
    [SYNTHETIC.personId, "Synthetic Recovery Fixture", '{"email":"synthetic@example.invalid"}', timestamp]
  );
  await client.query(
    `insert into auth_identities (id, person_id, issuer, subject, linked_at)
     values ($1, $2, 'https://synthetic.invalid/', 'recovery-fixture', $3)`,
    [SYNTHETIC.identityId, SYNTHETIC.personId, timestamp]
  );
  await client.query(
    `insert into auth_sessions
       (id, auth_identity_id, token_hash, assurance, authenticated_at, expires_at, revoked_at)
     values ($1, $2, 'synthetic-token-hash', 'recent-mfa', $3, $4, $3)`,
    [SYNTHETIC.sessionId, SYNTHETIC.identityId, timestamp, later]
  );
  await client.query(
    `insert into authorization_grants
       (id, person_id, domain, capability, target, assurance_required,
        valid_from, granted_by_person_id, revoked_at)
     values ($1, $2, 'civic', 'membership.self.read', $2, 'verified', $3, $2, $3)`,
    [SYNTHETIC.grantId, SYNTHETIC.personId, timestamp]
  );
  await client.query(
    `insert into research_wallets
       (id, person_id, status, protocol_profile, created_at, revoked_at)
     values ($1, $2, 'revoked', 'w3c-vc-bbs-2023-v1', $3, $3)`,
    [SYNTHETIC.walletId, SYNTHETIC.personId, timestamp]
  );
  await client.query(
    `insert into audit_log
       (id, actor_person_id, action, target, request_id, capability,
        reason_code, timestamp, pseudonymized)
     values ($1, $2, 'recovery.synthetic-state-recorded', $3,
       '40000000-0000-4000-8000-000000000001',
       'recovery.drill.verify', 'synthetic-drill', $4, true)`,
    [SYNTHETIC.auditId, SYNTHETIC.personId, SYNTHETIC.walletId, timestamp]
  );
}

async function inspectRecoveryState(client, expected) {
  const migrations = await client.query(
    "select hash from drizzle.__drizzle_migrations order by hash"
  );
  const tables = await client.query(
    `select table_name from information_schema.tables
     where table_schema='public' and table_type='BASE TABLE'
     order by table_name`
  );
  const constraints = await client.query(
    "select count(*)::int as count from pg_constraint where convalidated = false"
  );
  const fixture = await client.query(
    `select
       p.id as person_id,
       s.id as session_id, s.revoked_at::text as session_revoked_at,
       g.id as grant_id, g.revoked_at::text as grant_revoked_at,
       w.id as wallet_id, w.status as wallet_status, w.revoked_at::text as wallet_revoked_at,
       a.id as audit_id, a.action as audit_action, a.target as audit_target,
       a.request_id as audit_request_id, a.capability as audit_capability,
       a.reason_code as audit_reason_code
     from people p
     join auth_identities i on i.person_id = p.id
     join auth_sessions s on s.auth_identity_id = i.id
     join authorization_grants g on g.person_id = p.id
     join research_wallets w on w.person_id = p.id
     join audit_log a on a.actor_person_id = p.id
     where p.id = $1 and s.id = $2 and g.id = $3 and w.id = $4 and a.id = $5`,
    [
      SYNTHETIC.personId,
      SYNTHETIC.sessionId,
      SYNTHETIC.grantId,
      SYNTHETIC.walletId,
      SYNTHETIC.auditId,
    ]
  );
  if (fixture.rows.length !== 1) {
    throw new Error("Synthetic recovery fixture is incomplete");
  }

  const active = await client.query(
    `select
       (select count(*)::int from auth_sessions where id=$1 and revoked_at is null) as sessions,
       (select count(*)::int from authorization_grants where id=$2 and revoked_at is null) as grants,
       (select count(*)::int from research_wallets where id=$3 and status <> 'revoked') as wallets`,
    [SYNTHETIC.sessionId, SYNTHETIC.grantId, SYNTHETIC.walletId]
  );

  const migrationHashes = migrations.rows.map((row) => row.hash).sort();
  const tableNames = tables.rows.map((row) => row.table_name).sort();
  if (
    JSON.stringify(migrationHashes) !== JSON.stringify(expected.migrationHashes) ||
    JSON.stringify(tableNames) !== JSON.stringify(expected.tableNames) ||
    constraints.rows[0]?.count !== 0
  ) {
    throw new Error("Recovered schema failed the current migration integrity contract");
  }

  return {
    migrations: migrationHashes.length,
    tables: tableNames.length,
    invalidConstraints: constraints.rows[0].count,
    migrationDigest: sha256(JSON.stringify(migrationHashes)),
    tableDigest: sha256(JSON.stringify(tableNames)),
    syntheticDigest: sha256(JSON.stringify(fixture.rows[0])),
    revokedSessionActive: active.rows[0]?.sessions !== 0,
    revokedGrantActive: active.rows[0]?.grants !== 0,
    revokedWalletActive: active.rows[0]?.wallets !== 0,
  };
}

export async function runIsolatedRecoveryDrill({ now = new Date() } = {}) {
  const migrationsFolder = join(process.cwd(), "drizzle");
  const expected = await expectedSchema(migrationsFolder);
  const sourceDirectory = await mkdtemp(join(tmpdir(), "res-publica-recovery-source-"));
  const restoreDirectory = await mkdtemp(join(tmpdir(), "res-publica-recovery-target-"));
  let source;
  let restored;
  try {
    source = new PGlite(sourceDirectory);
    await source.waitReady;
    await migrate(drizzle({ client: source }), { migrationsFolder });
    await seedSyntheticRecoveryState(source, now);
    const sourceState = await inspectRecoveryState(source, expected);

    const backup = await source.dumpDataDir("gzip");
    const backupBytes = new Uint8Array(await backup.arrayBuffer());
    const backupSha256 = sha256(backupBytes);
    await source.close();
    source = undefined;

    restored = new PGlite(restoreDirectory, {
      loadDataDir: new Blob([backupBytes], { type: "application/gzip" }),
    });
    await restored.waitReady;
    const restoredState = await inspectRecoveryState(restored, expected);

    const migrationIdentityPreserved =
      sourceState.migrationDigest === restoredState.migrationDigest &&
      sourceState.tableDigest === restoredState.tableDigest;
    const syntheticIntegrityPreserved =
      sourceState.syntheticDigest === restoredState.syntheticDigest;
    if (
      !migrationIdentityPreserved ||
      !syntheticIntegrityPreserved ||
      restoredState.revokedSessionActive ||
      restoredState.revokedGrantActive ||
      restoredState.revokedWalletActive
    ) {
      throw new Error("Restored security state failed the recovery contract");
    }

    return {
      environment: "isolated-synthetic-pglite",
      backupBytes: backupBytes.byteLength,
      backupSha256,
      migrations: restoredState.migrations,
      tables: restoredState.tables,
      invalidConstraints: restoredState.invalidConstraints,
      migrationIdentityPreserved,
      syntheticIntegrityPreserved,
      revokedSessionActive: restoredState.revokedSessionActive,
      revokedGrantActive: restoredState.revokedGrantActive,
      revokedWalletActive: restoredState.revokedWalletActive,
      researchRealDataGateRequired: true,
      productionUntouched: true,
    };
  } finally {
    await source?.close().catch(() => undefined);
    await restored?.close().catch(() => undefined);
    await rm(sourceDirectory, { recursive: true, force: true });
    await rm(restoreDirectory, { recursive: true, force: true });
  }
}

async function main() {
  try {
    console.log(JSON.stringify(await runIsolatedRecoveryDrill(), null, 2));
  } catch {
    console.error("Isolated recovery drill failed without exposing data or paths");
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
