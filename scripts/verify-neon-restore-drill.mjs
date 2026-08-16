import { pathToFileURL } from "node:url";
import pg from "pg";

const SAFE_NEON_ID = /^[a-z0-9][a-z0-9-]{2,80}$/;

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
  if (
    !branchName?.startsWith("restore-drill-") ||
    !SAFE_NEON_ID.test(branchName)
  ) {
    throw new Error("Restore branch name must use the restore-drill- prefix");
  }
  if (branchId === productionBranchId) {
    throw new Error("Restore verification cannot target Production");
  }
  return { branchId, branchName, productionBranchId };
}

export function parseRestoreDatabaseUrl(value, productionHostname) {
  try {
    const parsed = new URL(value);
    if (
      !["postgres:", "postgresql:"].includes(parsed.protocol) ||
      !parsed.hostname.endsWith(".neon.tech") ||
      !productionHostname?.endsWith(".neon.tech") ||
      parsed.hostname === productionHostname ||
      !parsed.username ||
      !parsed.password ||
      !parsed.pathname.slice(1)
    ) {
      throw new Error("invalid");
    }
    for (const parameter of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
      parsed.searchParams.delete(parameter);
    }
    return {
      connectionString: parsed.href,
      ssl: { rejectUnauthorized: true },
    };
  } catch {
    throw new Error("Neon restore database URL is invalid");
  }
}

export async function verifyRestoredDatabase(client, expected) {
  await client.query("begin read only");
  let transactionReadOnly;
  let proxyTls;
  let migrations;
  let tables;
  let invalidConstraints;
  let readiness;
  try {
    transactionReadOnly = await client.query("show transaction_read_only");
    proxyTls = await client.query(
      "select ssl, version, cipher from pg_stat_ssl where pid=pg_backend_pid()"
    );
    migrations = await client.query(
      "select count(*)::int as count from drizzle.__drizzle_migrations"
    );
    tables = await client.query(
      "select count(*)::int as count from information_schema.tables where table_schema='public' and table_type='BASE TABLE'"
    );
    invalidConstraints = await client.query(
      "select count(*)::int as count from pg_constraint where convalidated = false"
    );
    readiness = await client.query("select 1::int as ready");
  } finally {
    await client.query("rollback");
  }

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
    transactionReadOnly: transactionReadOnly.rows[0]?.transaction_read_only === "on",
    migrations: migrations.rows[0]?.count,
    tables: tables.rows[0]?.count,
    invalidConstraints: invalidConstraints.rows[0]?.count,
    readiness: readiness.rows[0]?.ready,
  };
  if (
    result.tls.encrypted !== true ||
    result.tls.authorized !== true ||
    result.transactionReadOnly !== true ||
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
    requireSafe(
      environment.NEON_RESTORE_DRILL_PROJECT_ID,
      SAFE_NEON_ID,
      "Neon project ID"
    );
    const connection = parseRestoreDatabaseUrl(
      environment.NEON_RESTORE_DRILL_DATABASE_URL,
      environment.NEON_PRODUCTION_DATABASE_HOST
    );
    client = new pg.Client(connection);
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
