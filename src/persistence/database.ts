import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as coreSchema from "./schema";
import * as moduleSchema from "./module-schema";

const schema = { ...coreSchema, ...moduleSchema };

export function createDatabase(connectionString: string) {
  if (!connectionString) {
    throw new Error("A PostgreSQL connection string is required");
  }

  const pool = new Pool({ connectionString });
  return {
    db: drizzle({ client: pool, schema }),
    close: () => pool.end(),
  };
}

export type Database = ReturnType<typeof createDatabase>["db"];
