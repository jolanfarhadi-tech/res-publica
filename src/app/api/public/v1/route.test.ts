import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/public/v1", () => {
  it("documents only the grounded read-only v1 boundary", async () => {
    const response = await GET(
      new Request("https://respublica-ev.de/api/public/v1")
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        version: "v1",
        access: "read-only",
        scope: "grounded public content only",
        attribution: "Public source URLs must be preserved",
      },
      meta: { privateTableData: false },
    });
  });
});
