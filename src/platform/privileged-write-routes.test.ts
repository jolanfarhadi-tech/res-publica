import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const governanceRoutes = [
  ["cases", 1],
  ["documentation-quality", 1],
  ["evidence", 2],
  ["evidence-quality", 1],
  ["grants", 2],
  ["hearing-quality", 1],
  ["hearings", 1],
  ["repair-plans", 1],
  ["scientific-reviews", 1],
  ["validation", 1],
] as const;

const publishingRoutes = [
  ["grants", 2],
  ["workflow", 1],
] as const;

function source(domain: "governance" | "publishing", route: string) {
  return readFileSync(
    join(process.cwd(), "src", "app", "api", domain, route, "route.ts"),
    "utf8"
  );
}

function writeMethodCount(routeSource: string): number {
  return (
    routeSource.match(
      /export (?:async )?function (?:POST|PUT|PATCH|DELETE)\b/g
    ) ?? []
  ).length;
}

describe("privileged write route inventory", () => {
  it("protects all twelve Governance write methods", () => {
    let total = 0;
    for (const [route, expectedMethods] of governanceRoutes) {
      const routeSource = source("governance", route);
      expect(routeSource, route).toContain("executePrivilegedWrite");
      expect(routeSource, route).toContain(
        "GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT"
      );
      expect(writeMethodCount(routeSource), route).toBe(expectedMethods);
      total += expectedMethods;
    }
    expect(total).toBe(12);
  });

  it("protects all three Publishing write methods", () => {
    let total = 0;
    for (const [route, expectedMethods] of publishingRoutes) {
      const routeSource = source("publishing", route);
      expect(routeSource, route).toContain("executePrivilegedWrite");
      expect(routeSource, route).toContain(
        "PUBLISHING_PRIVILEGED_WRITE_RATE_LIMIT"
      );
      expect(writeMethodCount(routeSource), route).toBe(expectedMethods);
      total += expectedMethods;
    }
    expect(total).toBe(3);
  });
});
