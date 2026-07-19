import { createDatabase } from "../persistence";
import { readOidcEnvironment } from "./config";

let database: ReturnType<typeof createDatabase> | null = null;

export function getAuthRuntime() {
  const oidc = readOidcEnvironment();
  const connectionString = process.env.DATABASE_URL;
  if (!oidc || !connectionString) return null;
  database ??= createDatabase(connectionString);
  return { oidc, db: database.db };
}
