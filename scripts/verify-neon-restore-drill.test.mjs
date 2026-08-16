import { describe, expect, it, vi } from "vitest";
import {
  parseRestoreDatabaseUrl,
  validateRestoreDrillTarget,
  verifyRestoredDatabase,
} from "./verify-neon-restore-drill.mjs";

describe("isolated Neon restore verification", () => {
  it("accepts only a secret Neon PostgreSQL URL without exposing it", () => {
    const syntheticUrl = new URL(
      "postgresql://ep-safe.eu-central-1.aws.neon.tech/neondb?sslmode=require"
    );
    syntheticUrl.username = "restore_role";
    syntheticUrl.password = ["synthetic", "test", "value"].join("-");
    const productionHostname = "ep-production.eu-central-1.aws.neon.tech";
    const config = parseRestoreDatabaseUrl(syntheticUrl.href, productionHostname);
    expect(config.connectionString).not.toContain("sslmode=");
    expect(config.ssl).toEqual({ rejectUnauthorized: true });
    expect(() => parseRestoreDatabaseUrl("postgresql://user:secret@localhost/db", productionHostname))
      .toThrow("Neon restore database URL is invalid");
    expect(() => parseRestoreDatabaseUrl("not-a-url-with-secret", productionHostname))
      .toThrow("Neon restore database URL is invalid");
    syntheticUrl.hostname = productionHostname;
    expect(() => parseRestoreDatabaseUrl(syntheticUrl.href, productionHostname))
      .toThrow("Neon restore database URL is invalid");
  });

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
    expect(() =>
      validateRestoreDrillTarget({
        branchId: "br-isolated-123",
        branchName: "restore-drill-safe\nforged-output",
        productionBranchId: "br-production-123",
      })
    ).toThrow("restore-drill-");
  });

  it("uses read-only integrity queries and accepts the expected restored state", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ transaction_read_only: "on" }] })
      .mockResolvedValueOnce({ rows: [{ ssl: true, version: "TLSv1.3", cipher: "TLS_AES_256_GCM_SHA384" }] })
      .mockResolvedValueOnce({ rows: [{ count: 19 }] })
      .mockResolvedValueOnce({ rows: [{ count: 66 }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ ready: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

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
      transactionReadOnly: true,
      migrations: 19,
      tables: 66,
      invalidConstraints: 0,
      readiness: 1,
    });
    expect(query.mock.calls.map(([sql]) => sql)).toEqual([
      "begin read only",
      "show transaction_read_only",
      expect.stringMatching(/^select\b/i),
      expect.stringMatching(/^select\b/i),
      expect.stringMatching(/^select\b/i),
      expect.stringMatching(/^select\b/i),
      expect.stringMatching(/^select\b/i),
      "rollback",
    ]);
  });

  it("fails when the restored migration or table state drifts", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ transaction_read_only: "on" }] })
      .mockResolvedValueOnce({ rows: [{ ssl: true }] })
      .mockResolvedValueOnce({ rows: [{ count: 18 }] })
      .mockResolvedValueOnce({ rows: [{ count: 65 }] })
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ ready: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

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
