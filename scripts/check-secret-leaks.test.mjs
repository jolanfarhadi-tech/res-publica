import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { existingTrackedPaths, scanText } from "./check-secret-leaks.mjs";

describe("secret leak scanner", () => {
  it("reports credential material without returning the value", () => {
    const secret = "A9x-super-sensitive-value-42";
    const findings = scanText(`OIDC_CLIENT_SECRET=${secret}`, "fixture");
    expect(findings).toEqual([{ source: "fixture", line: 1, rule: "credential-assignment" }]);
    expect(JSON.stringify(findings)).not.toContain(secret);
  });

  it("detects private-key blocks and credential-bearing database URLs", () => {
    const privateKeyHeader = ["-----BEGIN ", "PRIVATE KEY-----"].join("");
    const databaseUrl = ["postgresql://service:", "S3curePass", "@db.example.org/app"].join("");
    expect(scanText(privateKeyHeader, "key")).toHaveLength(1);
    expect(scanText(databaseUrl, "db")).toHaveLength(1);
  });

  it("ignores variable names and explicit placeholders", () => {
    expect(scanText("Configure OIDC_CLIENT_SECRET only when required.", "docs")).toEqual([]);
    expect(scanText("OIDC_CLIENT_SECRET=placeholder", "example")).toEqual([]);
  });

  it("does not report its own detector declarations", () => {
    expect(scanText("const PRIVATE_KEY_BLOCK = /key-pattern/g;", "scanner")).toEqual([]);
    expect(scanText("const DATABASE_CREDENTIAL_URL = /url-pattern/g;", "scanner")).toEqual([]);
  });

  it("skips a tracked file that is intentionally deleted in the worktree", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "secret-scan-"));
    try {
      fs.writeFileSync(path.join(root, "present.txt"), "safe");
      expect(
        existingTrackedPaths(root, ["present.txt", "deleted.txt"])
      ).toEqual(["present.txt"]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
