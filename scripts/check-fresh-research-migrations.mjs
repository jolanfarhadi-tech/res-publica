import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const migrationsFolder = join(process.cwd(), "drizzle-research");
const journal = JSON.parse(await readFile(join(migrationsFolder, "meta", "_journal.json"), "utf8"));
const sqlFiles = (await readdir(migrationsFolder)).filter((file) => /^\d{4}_.+\.sql$/.test(file)).sort();
const journalFiles = journal.entries.map((entry) => `${entry.tag}.sql`).sort();
if (JSON.stringify(sqlFiles) !== JSON.stringify(journalFiles)) {
  throw new Error("Research verifier migration journal does not match the SQL chain");
}

const expectedTables = new Set();
for (const file of sqlFiles) {
  const sql = await readFile(join(migrationsFolder, file), "utf8");
  for (const match of sql.matchAll(/CREATE TABLE\s+"research_anonymous"\."([^"]+)"/gi)) {
    expectedTables.add(match[1]);
  }
}

const directory = await mkdtemp(join(tmpdir(), "res-publica-research-staging-"));
const client = new PGlite(directory);
try {
  const db = drizzle({ client });
  await migrate(db, { migrationsFolder });
  const result = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'research_anonymous'"
  );
  const tables = new Set(result.rows.map((row) => row.table_name));
  const missing = [...expectedTables].filter((table) => !tables.has(table));
  if (missing.length) throw new Error(`Research verifier migration missing: ${missing.join(", ")}`);
  const publicPrivileges = await client.query(`
    SELECT table_name FROM information_schema.role_table_grants
    WHERE table_schema = 'research_anonymous' AND grantee = 'PUBLIC'
  `);
  if (publicPrivileges.rows.length) throw new Error("PUBLIC retains verifier table privileges");
  console.log(`✓ Isolated research staging applied ${sqlFiles.length} migration and created ${expectedTables.size} tables`);
} finally {
  await client.close();
  await rm(directory, { recursive: true, force: true });
}
