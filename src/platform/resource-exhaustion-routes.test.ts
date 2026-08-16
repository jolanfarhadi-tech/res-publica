import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const protectedReads = [
  "src/app/api/dashboard/route.ts",
  "src/app/api/membership/profile/route.ts",
  "src/app/api/operations/route.ts",
  "src/app/api/publishing/workspace/route.ts",
  "src/app/api/academy/certificates/[verificationId]/route.ts",
  "src/app/api/operations/security/route.ts",
];

describe("application-layer resource exhaustion boundaries", () => {
  it.each(protectedReads)("rate limits expensive read route %s", (route) => {
    const source = readFileSync(join(process.cwd(), route), "utf8");
    expect(source).toContain("rejectRateLimitedRequest");
  });

  it("keeps declared JSON payload budgets on sensitive write classes", () => {
    const source = readFileSync(
      join(process.cwd(), "src/platform/rate-limit.ts"),
      "utf8"
    );
    for (const policy of [
      "MEMBERSHIP_APPLICATION_RATE_LIMIT",
      "RESEARCH_CREDENTIAL_ISSUANCE_RATE_LIMIT",
      "GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT",
      "PUBLISHING_PRIVILEGED_WRITE_RATE_LIMIT",
      "ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT",
      "FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT",
      "KNOWLEDGE_GRAPH_PRIVILEGED_WRITE_RATE_LIMIT",
      "AI_RAG_QUERY_RATE_LIMIT",
      "SECURITY_OPERATIONS_WRITE_RATE_LIMIT",
    ]) {
      const start = source.indexOf(`export const ${policy}`);
      expect(start).toBeGreaterThanOrEqual(0);
      expect(source.slice(start, start + 260)).toContain("maxBodyBytes");
    }
  });
});
