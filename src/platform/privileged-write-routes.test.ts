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

const academyRoutes = [
  ["academy/operations/courses", 1],
  ["academy/operations/courses/[courseId]", 1],
  ["academy/operations/courses/[courseId]/workflow", 1],
  ["academy/operations/programs", 1],
  ["academy/operations/programs/[programId]/workflow", 1],
  ["academy/operations/invitations", 1],
  ["academy/operations/instructors", 1],
  ["academy/operations/enrollment-applications/[applicationId]", 1],
  ["academy/operations/assessments/[submissionId]/review", 1],
  ["academy/operations/enrollments/[enrollmentId]/certificate", 2],
] as const;

const fellowshipRoutes = [
  ["fellowship/operations/role-scopes", 1],
  ["fellowship/operations/role-scopes/[roleScopeId]/approve", 1],
  ["fellowship/operations/candidacies", 1],
  ["fellowship/operations/candidacies/[candidacyId]/assign", 1],
  ["fellowship/operations/assignments/[assignmentId]/conflict", 1],
  ["fellowship/operations/assignments/[assignmentId]/review", 1],
  ["fellowship/operations/candidacies/[candidacyId]/decision", 1],
  ["fellowship/operations/records/[fellowshipId]/status", 1],
] as const;

const knowledgeGraphRoutes = [
  ["knowledge-graph/operations/rebuilds", 1],
  ["knowledge-graph/operations/candidates/[candidateId]", 1],
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

  it("protects every Academy staff write with the shared distributed limiter", () => {
    for (const [route, expectedMethods] of academyRoutes) {
      const routeSource = readFileSync(
        join(process.cwd(), "src", "app", "api", route, "route.ts"),
        "utf8"
      );
      expect(routeSource, route).toContain("executePrivilegedWrite");
      expect(routeSource, route).toContain("ACADEMY_PRIVILEGED_WRITE_RATE_LIMIT");
      expect(writeMethodCount(routeSource), route).toBe(expectedMethods);
    }
  });

  it("protects every Fellowship staff write with the shared distributed limiter", () => {
    for (const [route, expectedMethods] of fellowshipRoutes) {
      const routeSource = readFileSync(
        join(process.cwd(), "src", "app", "api", route, "route.ts"),
        "utf8"
      );
      expect(routeSource, route).toContain("executePrivilegedWrite");
      expect(routeSource, route).toContain("FELLOWSHIP_PRIVILEGED_WRITE_RATE_LIMIT");
      expect(writeMethodCount(routeSource), route).toBe(expectedMethods);
    }
  });

  it("protects every Knowledge Graph staff write with the shared distributed limiter", () => {
    for (const [route, expectedMethods] of knowledgeGraphRoutes) {
      const routeSource = readFileSync(
        join(process.cwd(), "src", "app", "api", route, "route.ts"),
        "utf8"
      );
      expect(routeSource, route).toContain("executePrivilegedWrite");
      expect(routeSource, route).toContain("KNOWLEDGE_GRAPH_PRIVILEGED_WRITE_RATE_LIMIT");
      expect(writeMethodCount(routeSource), route).toBe(expectedMethods);
    }
  });
});
