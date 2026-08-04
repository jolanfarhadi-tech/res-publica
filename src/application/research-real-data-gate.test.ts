import { describe, expect, it } from "vitest";
import { readResearchRealDataGate } from "./research-real-data-gate";

const complete = {
  RESEARCH_WALLET_ENABLED: "true",
  RESEARCH_WALLET_ARCHITECTURE_APPROVED: "true",
  RESEARCH_WALLET_SECURITY_APPROVED: "true",
  RESEARCH_WALLET_PRIVACY_APPROVED: "true",
  RESEARCH_REAL_DATA_ACTIVATION_APPROVED: "true",
  RESEARCH_WALLET_ISSUER_PRIVATE_KEY: "configured",
  RESEARCH_WALLET_ISSUER_PUBLIC_KEY: "configured",
  RESEARCH_VERIFIER_DATABASE_URL: "configured",
  RESEARCH_VERIFIER_PEPPER: "configured",
  RESEARCH_VERIFIER_CLIENTS_JSON: "configured",
};

describe("real research data activation gate", () => {
  it("fails closed unless every approval and operational dependency exists", () => {
    for (const key of Object.keys(complete)) {
      expect(readResearchRealDataGate({ ...complete, [key]: undefined })).toEqual({ enabled: false });
    }
    expect(readResearchRealDataGate(complete)).toEqual({ enabled: true });
  });
});
