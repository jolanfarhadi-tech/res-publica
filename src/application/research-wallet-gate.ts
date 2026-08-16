import type { ResearchWalletFeatureGate } from "./research-wallet";
import { isResearchForcedClosed } from "../platform/capability-quarantine";

export function readResearchWalletFeatureGate(
  environment: Record<string, string | undefined> = process.env
): ResearchWalletFeatureGate {
  if (isResearchForcedClosed(environment)) return { enabled: false };
  return {
    enabled: environment.RESEARCH_WALLET_ENABLED === "true" &&
      environment.RESEARCH_WALLET_ARCHITECTURE_APPROVED === "true" &&
      environment.RESEARCH_WALLET_SECURITY_APPROVED === "true" &&
      environment.RESEARCH_WALLET_PRIVACY_APPROVED === "true",
  };
}
