import { describe, expect, it } from "vitest";
import { runIsolatedRecoveryDrill } from "./run-isolated-recovery-drill.mjs";

describe("isolated synthetic recovery drill", () => {
  it("backs up and restores the current schema without reviving revoked access", async () => {
    const result = await runIsolatedRecoveryDrill({
      now: new Date("2026-08-16T04:00:00.000Z"),
    });

    expect(result).toMatchObject({
      environment: "isolated-synthetic-pglite",
      migrations: 24,
      tables: 98,
      invalidConstraints: 0,
      migrationIdentityPreserved: true,
      syntheticIntegrityPreserved: true,
      revokedSessionActive: false,
      revokedGrantActive: false,
      revokedWalletActive: false,
      researchRealDataGateRequired: true,
      productionUntouched: true,
    });
    expect(result.backupBytes).toBeGreaterThan(0);
    expect(result.backupSha256).toMatch(/^[a-f0-9]{64}$/);
  }, 60_000);
});
