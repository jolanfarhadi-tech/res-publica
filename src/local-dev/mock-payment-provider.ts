/**
 * Mock Payment Provider — Foundation Build Order Step 4 (`ADR-006`):
 * "a stubbed payment provider." Deterministic local simulation only — no
 * external payment API is called. Real provider integration is separate,
 * later, external-infrastructure-dependent work.
 */

export type MockProviderResult = {
  providerReference: string;
  mocked: true;
};

export function mockCharge(amount: number): MockProviderResult {
  if (amount <= 0) {
    throw new Error("Mock payment provider: amount must be positive");
  }
  return {
    providerReference: `mock-ref-${Date.now()}`,
    mocked: true,
  };
}
