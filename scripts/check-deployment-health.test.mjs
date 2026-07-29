import { describe, expect, it, vi } from "vitest";
import { checkDeploymentHealth } from "./check-deployment-health.mjs";

function response(status, body, cacheControl = "private, no-store") {
  return Response.json(body, {
    status,
    headers: { "cache-control": cacheControl },
  });
}

describe("deployment health monitor", () => {
  it("accepts only the live and ready contracts", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response(200, { status: "live" }))
      .mockResolvedValueOnce(response(200, { status: "ready" }));

    await expect(
      checkDeploymentHealth("https://respublica-ev.de", fetchImpl)
    ).resolves.toEqual([
      { path: "/api/health/live", status: 200 },
      { path: "/api/health/ready", status: 200 },
    ]);
  });

  it("fails when readiness is degraded or cacheable", async () => {
    const degraded = vi
      .fn()
      .mockResolvedValueOnce(response(200, { status: "live" }))
      .mockResolvedValueOnce(
        response(503, { status: "not_ready" }, "no-store")
      );
    await expect(
      checkDeploymentHealth("https://respublica-ev.de", degraded)
    ).rejects.toThrow("/api/health/ready failed");

    const cacheable = vi
      .fn()
      .mockResolvedValueOnce(response(200, { status: "live" }, "max-age=60"));
    await expect(
      checkDeploymentHealth("https://respublica-ev.de", cacheable)
    ).rejects.toThrow("/api/health/live failed");
  });

  it("rejects a non-TLS target", async () => {
    await expect(
      checkDeploymentHealth("http://respublica-ev.de", vi.fn())
    ).rejects.toThrow("HTTPS");
  });
});
