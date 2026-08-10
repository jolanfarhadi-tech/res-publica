#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import pg from "pg";

const SAFE_NEON_ID = /^[a-z0-9][a-z0-9-]{2,80}$/;
const SAFE_DATABASE_NAME = /^[a-z_][a-z0-9_]{0,62}$/;

function requireSafe(value, pattern, label) {
  if (!value || !pattern.test(value)) throw new Error(`${label} is invalid`);
  return value;
}

export function validateRestoreDrillTarget({
  branchId,
  branchName,
  productionBranchId,
}) {
  requireSafe(branchId, SAFE_NEON_ID, "Restore branch ID");
  requireSafe(productionBranchId, SAFE_NEON_ID, "Production branch ID");
  if (!branchName?.startsWith("restore-drill-")) {
    throw new Error("Restore branch name must use the restore-drill- prefix");
  }
  if (branchId === productionBranchId) {
    throw new Error("Restore verification cannot target Production");
  }
  return { branchId, branchName, productionBranchId };
}

export async function verifyRestoredDatabase(client, expected) {
  const proxyTls = await client.query(
    "select ssl, version, cipher from pg_stat_ssl where pid=pg_backend_pid()"
  );
  const migrations = await client.query(
    "select count(*)::int as count from drizzle.__drizzle_migrations"
  );
  const tables = await client.query(
    "select count(*)::int as count from information_schema.tables where table_schema='public' and table_type='BASE TABLE'"
  );
  const invalidConstraints = await client.query(
    "select count(*)::int as count from pg_constraint where convalidated = false"
  );
  const readiness = await client.query("select 1::int as ready");

  const stream = client.connection?.stream;
  const result = {
    tls: {
      encrypted: stream?.encrypted === true,
      authorized: stream?.authorized === true,
      protocol: typeof stream?.getProtocol === "function"
        ? stream.getProtocol()
        : null,
    },
    databaseProxyTls: proxyTls.rows[0],
    migrations: migrations.rows[0]?.count,
    tables: tables.rows[0]?.count,
    invalidConstraints: invalidConstraints.rows[0]?.count,
    readiness: readiness.rows[0]?.ready,
  };
  if (
    result.tls.encrypted !== true ||
    result.tls.authorized !== true ||
    result.migrations !== expected.migrations ||
    result.tables !== expected.tables ||
    result.invalidConstraints !== 0 ||
    result.readiness !== 1
  ) {
    throw new Error(
      `Restored database failed its integrity contract: ${JSON.stringify(result)}`
    );
  }
  return result;
}

function getConnectionString({ projectId, branchId, roleName, databaseName }) {
  requireSafe(projectId, SAFE_NEON_ID, "Neon project ID");
  requireSafe(branchId, SAFE_NEON_ID, "Restore branch ID");
  requireSafe(roleName, SAFE_DATABASE_NAME, "Restore role name");
  requireSafe(databaseName, SAFE_DATABASE_NAME, "Restore database name");
  const command = [
    "npx --yes neonctl@latest connection-string",
    branchId,
    "--project-id",
    projectId,
    "--role-name",
    roleName,
    "--database-name",
    databaseName,
    "--ssl verify-full --no-color",
  ].join(" ");
  return execFileSync(
    "powershell.exe",
    ["-NoProfile", "-Command", command],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
  ).trim();
}

export async function runRestoreDrill(environment = process.env) {
  const target = validateRestoreDrillTarget({
    branchId: environment.NEON_RESTORE_DRILL_BRANCH_ID,
    branchName: environment.NEON_RESTORE_DRILL_BRANCH_NAME,
    productionBranchId: environment.NEON_PRODUCTION_BRANCH_ID,
  });
  const expected = {
    migrations: Number(environment.NEON_RESTORE_EXPECTED_MIGRATIONS),
    tables: Number(environment.NEON_RESTORE_EXPECTED_TABLES),
  };
  if (!Number.isInteger(expected.migrations) || !Number.isInteger(expected.tables)) {
    throw new Error("Expected migration and table counts are required");
  }

  let client;
  try {
    const connectionString = getConnectionString({
      projectId: environment.NEON_RESTORE_DRILL_PROJECT_ID,
      branchId: target.branchId,
      roleName: environment.NEON_RESTORE_DRILL_ROLE_NAME ?? "neondb_owner",
      databaseName: environment.NEON_RESTORE_DRILL_DATABASE_NAME ?? "neondb",
    });
    const tlsConnection = new URL(connectionString);
    tlsConnection.searchParams.delete("sslmode");
    client = new pg.Client({
      connectionString: tlsConnection.href,
      ssl: { rejectUnauthorized: true },
    });
    await client.connect();
    const verification = await verifyRestoredDatabase(client, expected);
    return {
      branchId: target.branchId,
      branchName: target.branchName,
      productionBranchUntouched: true,
      ...verification,
    };
  } finally {
    await client?.end().catch(() => undefined);
  }
}

async function main() {
  try {
    console.log(JSON.stringify(await runRestoreDrill(), null, 2));
  } catch {
    console.error(
      "Restore drill verification failed without exposing connection details"
    );
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
