import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/platform/modules", () => {
  it("keeps the internal module registry outside the anonymous HTTP surface", async () => {
    const response = GET();
    const body = (await response.json()) as { error: string };
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    );
    expect(body).toEqual({ error: "not_found" });
    expect(serialized).not.toContain("databaseTables");
    expect(serialized).not.toContain("apiRoutes");
    expect(serialized).not.toContain("aiLayerCapabilities");
    expect(serialized).not.toContain("membership");
    expect(serialized).not.toContain("harm-governance");
  });
});
