import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fellowshipCopy } from "../i18n/fellowship";
import { publicOfferings } from "../data/public-offerings";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Fellowship public and private boundaries", () => {
  it("provides complete DE/EN/FA copy with human-only and non-ranking language", () => {
    expect(Object.keys(fellowshipCopy)).toEqual(["de", "en", "fa"]);
    for (const locale of ["de", "en", "fa"] as const) {
      expect(Object.values(fellowshipCopy[locale]).every((value) => value.trim().length > 0)).toBe(true);
    }
    expect(fellowshipCopy.en.principleText).toContain("no points");
    expect(fellowshipCopy.fa.principleText).toContain("هیچ امتیاز");
  });

  it("links the documented programme without claiming operational activation", () => {
    const offering = publicOfferings.find((item) => item.id === "fellowship");
    expect(offering).toMatchObject({ href: "/fellowship", operational: false, maturity: "documented" });
  });

  it("keeps real applications behind an exact server-side gate", () => {
    expect(source("src/app/api/fellowship/applications/route.ts")).toContain("FELLOWSHIP_APPLICATIONS_ENABLED");
    expect(source("src/app/[locale]/fellowship/page.tsx")).toContain("process.env.FELLOWSHIP_APPLICATIONS_ENABLED === \"true\"");
  });

  it("contains no Fellowship scoring, rank or leaderboard fields", () => {
    const schema = source("src/persistence/module-schema.ts").slice(source("src/persistence/module-schema.ts").indexOf("fellowshipRoleScopes"));
    expect(schema).not.toMatch(/\b(score|points|rank|leaderboard|threshold)\s*:/i);
    expect(source("src/application/fellowship.ts")).not.toContain("automatedDecision");
  });

  it("keeps self and operations pages out of search indexes", () => {
    expect(source("src/app/[locale]/dashboard/fellowship/page.tsx")).toContain("index: false");
    expect(source("src/app/[locale]/operations/fellowship/page.tsx")).toContain("index: false");
  });
});
