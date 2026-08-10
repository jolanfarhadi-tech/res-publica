import { describe, expect, it, vi } from "vitest";
import {
  validateRestoreDrillTarget,
  verifyRestoredDatabase,
} from "./verify-neon-restore-drill.mjs";

describe("isolated Neon restore verification", () => {
  it("rejects Production and non-drill targets", () => {
    expect(() =>
      validateRestoreDrillTarget({
        branchId: "br-production-123",
        branchName: "restore-drill-20260810",
        productionBranchId: "br-production-123",
      })
    ).toThrow("cannot target Production");
    expect(() =>
      validateRestoreDrillTarget({
        branchId: "br-isolated-123",
        branchName: "production",
        productionBranchId: "br-production-123",
      })
    ).toThrow("restore-drill-");
  });

  it("uses read-only integrity queries and accepts the expected restored state", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ ssl: true, version: "TLSv1.3", cipher: "TLS_AES_256_GCM_SHA384" }] })
      .mockResolvedValueOnce({ rows: [{ count: 19 }] })
      .mockResolvedValueOnce({ rows: [{ count: 66 }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ ready: 1 }] });

    await expect(
      verifyRestoredDatabase({
        query,
        connection: {
          stream: {
            encrypted: true,
            authorized: true,
            getProtocol: () => "TLSv1.3",
          },
        },
      }, { migrations: 19, tables: 66 })
    ).resolves.toMatchObject({
      tls: { encrypted: true, authorized: true, protocol: "TLSv1.3" },
      migrations: 19,
      tables: 66,
      invalidConstraints: 0,
      readiness: 1,
    });
    expect(query.mock.calls.every(([sql]) => /^select\b/i.test(sql))).toBe(true);
  });

  it("fails when the restored migration or table state drifts", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ ssl: true }] })
      .mockResolvedValueOnce({ rows: [{ count: 18 }] })
      .mockResolvedValueOnce({ rows: [{ count: 65 }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ ready: 1 }] });

    await expect(
      verifyRestoredDatabase({
        query,
        connection: {
          stream: {
            encrypted: true,
            authorized: true,
            getProtocol: () => "TLSv1.3",
          },
        },
      }, { migrations: 19, tables: 66 })
    ).rejects.toThrow("integrity contract");
  });
});
