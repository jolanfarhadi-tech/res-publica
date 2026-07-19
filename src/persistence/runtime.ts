import { createDatabase } from "./database";

let database: ReturnType<typeof createDatabase> | null = null;

export function getPersistenceRuntime() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  database ??= createDatabase(connectionString);
  return database;
}
