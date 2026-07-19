import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/persistence/schema.ts", "./src/persistence/module-schema.ts"],
  out: "./drizzle",
  strict: true,
  verbose: true,
});
