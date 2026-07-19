import { describe, expect, it } from "vitest";
import { GET as live } from "./live/route";
import { GET as ready } from "./ready/route";

describe("operational health routes", () => {
  it("reports process liveness without external dependencies", async () => {
    const response = live();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ status: "live" });
  });

  it("fails readiness closed when the database is not configured", async () => {
    const response = await ready();
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      status: "not_ready",
      dependency: "database",
      configured: false,
    });
  });
});
