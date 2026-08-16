import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Phase E recovery architecture", () => {
  it("keeps the provider drill pinned to a supplied secret and read-only SQL", () => {
    const source = read("scripts/verify-neon-restore-drill.mjs");
    expect(source).toContain("NEON_RESTORE_DRILL_DATABASE_URL");
    expect(source).toContain("NEON_PRODUCTION_DATABASE_HOST");
    expect(source).toContain('client.query("begin read only")');
    expect(source).not.toContain("neonctl@latest");
    expect(source).not.toContain("execFileSync");
  });

  it("documents clean recovery, backup independence and last-known-good selection", () => {
    const cleanRecovery = read("docs/operations/CLEAN_RECOVERY_RUNBOOK.md");
    const controls = read("docs/security/RECOVERY_CONTROL_MATRIX.md");
    expect(cleanRecovery).toContain("LAST-KNOWN-GOOD");
    expect(cleanRecovery).toContain("Do not restore the attack");
    expect(cleanRecovery).toContain("RESEARCH_REAL_DATA_ACTIVATION_APPROVED");
    expect(controls).toContain("OWNER DECISION REQUIRED");
    expect(controls).toContain("Credential rotation dependency map");
    expect(controls).toContain("Backup independence");
  });
});
