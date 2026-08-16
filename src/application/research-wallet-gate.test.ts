import { describe, expect, it } from "vitest";
import { readResearchWalletFeatureGate } from "./research-wallet-gate";

describe("research wallet activation gate", () => {
  it("requires every independent approval flag", () => {
    expect(readResearchWalletFeatureGate({ RESEARCH_WALLET_ENABLED: "true" })).toEqual({ enabled: false });
    expect(readResearchWalletFeatureGate({
      RESEARCH_WALLET_ENABLED: "true",
      RESEARCH_WALLET_ARCHITECTURE_APPROVED: "true",
      RESEARCH_WALLET_SECURITY_APPROVED: "true",
      RESEARCH_WALLET_PRIVACY_APPROVED: "true",
    })).toEqual({ enabled: true });
  });

  it("lets the emergency research control override all wallet approvals", () => {
    expect(readResearchWalletFeatureGate({
      RESEARCH_WALLET_ENABLED: "true",
      RESEARCH_WALLET_ARCHITECTURE_APPROVED: "true",
      RESEARCH_WALLET_SECURITY_APPROVED: "true",
      RESEARCH_WALLET_PRIVACY_APPROVED: "true",
      SECURITY_FORCE_RESEARCH_FAIL_CLOSED: "true",
    })).toEqual({ enabled: false });
  });
});
