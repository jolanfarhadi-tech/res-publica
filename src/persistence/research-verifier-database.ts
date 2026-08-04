import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./research-verifier-schema";

export function createResearchVerifierDatabase(connectionString: string) {
  if (!connectionString) throw new Error("A separate research verifier database is required");
  const pool = new Pool({
    connectionString,
    application_name: "res-publica-research-verifier",
  });
  return {
    db: drizzle({ client: pool, schema }),
    close: () => pool.end(),
  };
}

export type ResearchVerifierDatabase =
  ReturnType<typeof createResearchVerifierDatabase>["db"];
