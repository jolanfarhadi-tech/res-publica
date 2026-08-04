export const RESEARCH_REAL_DATA_GATE_NAME =
  "RESEARCH_REAL_DATA_ACTIVATION_APPROVED";

export type ResearchRealDataGate = { enabled: boolean };

export function readResearchRealDataGate(
  environment: Record<string, string | undefined> = process.env
): ResearchRealDataGate {
  return {
    enabled: environment.RESEARCH_WALLET_ENABLED === "true" &&
      environment.RESEARCH_WALLET_ARCHITECTURE_APPROVED === "true" &&
      environment.RESEARCH_WALLET_SECURITY_APPROVED === "true" &&
      environment.RESEARCH_WALLET_PRIVACY_APPROVED === "true" &&
      environment[RESEARCH_REAL_DATA_GATE_NAME] === "true" &&
      Boolean(environment.RESEARCH_WALLET_ISSUER_PRIVATE_KEY) &&
      Boolean(environment.RESEARCH_WALLET_ISSUER_PUBLIC_KEY) &&
      Boolean(environment.RESEARCH_VERIFIER_DATABASE_URL) &&
      Boolean(environment.RESEARCH_VERIFIER_PEPPER) &&
      Boolean(environment.RESEARCH_VERIFIER_CLIENTS_JSON),
  };
}
