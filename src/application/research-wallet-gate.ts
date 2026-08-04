import type { ResearchWalletFeatureGate } from "./research-wallet";

export function readResearchWalletFeatureGate(
  environment: Record<string, string | undefined> = process.env
): ResearchWalletFeatureGate {
  return {
    enabled: environment.RESEARCH_WALLET_ENABLED === "true" &&
      environment.RESEARCH_WALLET_ARCHITECTURE_APPROVED === "true" &&
      environment.RESEARCH_WALLET_SECURITY_APPROVED === "true" &&
      environment.RESEARCH_WALLET_PRIVACY_APPROVED === "true",
  };
}
