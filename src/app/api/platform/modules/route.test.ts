import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/platform/modules", () => {
  it("exposes the bootstrapped MVP module registry", async () => {
    const response = GET();
    const body = (await response.json()) as {
      modules: Array<{ moduleName: string; databaseTables: string[] }>;
    };

    expect(response.status).toBe(200);
    expect(body.modules).toHaveLength(9);
    expect(body.modules.map((module) => module.moduleName)).toContain("membership");
    expect(body.modules.map((module) => module.moduleName)).toContain("events");
  });
});
