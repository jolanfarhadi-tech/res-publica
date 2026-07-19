import { getPersistenceRuntime } from "../persistence";
import { readOidcEnvironment } from "./config";

export function getAuthRuntime() {
  const oidc = readOidcEnvironment();
  const persistence = getPersistenceRuntime();
  if (!oidc || !persistence) return null;
  return { oidc, db: persistence.db };
}
