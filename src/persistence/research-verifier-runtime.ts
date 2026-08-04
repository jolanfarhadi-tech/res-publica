import { createResearchVerifierDatabase } from "./research-verifier-database";

let runtime: ReturnType<typeof createResearchVerifierDatabase> | null = null;

export function getResearchVerifierRuntime() {
  const connectionString = process.env.RESEARCH_VERIFIER_DATABASE_URL;
  if (!connectionString) return null;
  runtime ??= createResearchVerifierDatabase(connectionString);
  return runtime;
}
