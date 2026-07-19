import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

const root = process.cwd();
const migrationsFolder = join(root, "drizzle");
const journal = JSON.parse(await readFile(join(migrationsFolder, "meta", "_journal.json"), "utf8"));
const sqlFiles = (await readdir(migrationsFolder)).filter((file) => /^\d{4}_.+\.sql$/.test(file)).sort();
const journalFiles = journal.entries.map((entry) => `${entry.tag}.sql`).sort();

if (JSON.stringify(sqlFiles) !== JSON.stringify(journalFiles)) {
  const missingFromJournal = sqlFiles.filter((file) => !journalFiles.includes(file));
  const missingSql = journalFiles.filter((file) => !sqlFiles.includes(file));
  throw new Error(`Migration journal mismatch. Missing from journal: ${missingFromJournal.join(", ") || "none"}; missing SQL: ${missingSql.join(", ") || "none"}`);
}

const expectedTables = new Set();
for (const file of sqlFiles) {
  const sql = await readFile(join(migrationsFolder, file), "utf8");
  for (const match of sql.matchAll(/CREATE TABLE\s+"([^"]+)"/gi)) expectedTables.add(match[1]);
}

const directory = await mkdtemp(join(tmpdir(), "res-publica-fresh-migrations-"));
const client = new PGlite(directory);
try {
  const db = drizzle({ client });
  await migrate(db, { migrationsFolder });
  const result = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
  const actualTables = new Set(result.rows.map((row) => row.table_name));
  const missingTables = [...expectedTables].filter((table) => !actualTables.has(table));
  if (missingTables.length) throw new Error(`Fresh migration run did not create: ${missingTables.join(", ")}`);
  const column = await client.query(`SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'harm_cases' AND column_name = 'institution_id'`);
  if (column.rows.length !== 1) throw new Error("Fresh migration run did not apply latest harm_cases institution scope");
  console.log(`✓ Fresh database migration run applied ${sqlFiles.length} journaled migrations and created ${expectedTables.size} tables`);
} finally {
  await client.close();
  await rm(directory, { recursive: true, force: true });
}
