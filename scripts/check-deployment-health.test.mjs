import { describe, expect, it, vi } from "vitest";
import {
  checkDeploymentHealth,
  checkOidcDiscovery,
  checkPrivateBoundaries,
} from "./check-deployment-health.mjs";

function response(status, body, cacheControl = "private, no-store") {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": cacheControl,
      "x-request-id": "123e4567-e89b-42d3-a456-426614174000",
    },
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

  it("verifies OIDC discovery without initiating a login flow", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      response(200, {
        issuer: "https://identity.example.org/",
        authorization_endpoint: "https://identity.example.org/authorize",
        token_endpoint: "https://identity.example.org/oauth/token",
        jwks_uri: "https://identity.example.org/.well-known/jwks.json",
      })
    );

    await expect(
      checkOidcDiscovery("https://identity.example.org", fetchImpl)
    ).resolves.toEqual([
      { path: "/.well-known/openid-configuration", status: 200 },
    ]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("fails closed on an issuer mismatch or insecure endpoint", async () => {
    const mismatch = vi.fn().mockResolvedValue(
      response(200, {
        issuer: "https://attacker.example",
        authorization_endpoint: "http://attacker.example/authorize",
        token_endpoint: "https://identity.example.org/token",
        jwks_uri: "https://identity.example.org/jwks",
      })
    );

    await expect(
      checkOidcDiscovery("https://identity.example.org", mismatch)
    ).rejects.toThrow("issuer or endpoint");
  });

  it("verifies anonymous protection without mutating operational data", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response(200, { authenticated: false, available: true }))
      .mockResolvedValueOnce(response(401, { error: "authentication_required" }))
      .mockResolvedValueOnce(response(401, { error: "authentication_required" }))
      .mockResolvedValueOnce(response(401, { error: "authentication_required" }))
      .mockResolvedValueOnce(response(403, { error: "forbidden" }));

    await expect(
      checkPrivateBoundaries("https://respublica-ev.de", fetchImpl)
    ).resolves.toEqual([
      { path: "/api/auth/session", status: 200 },
      { path: "/api/dashboard", status: 401 },
      { path: "/api/membership/profile", status: 401 },
      { path: "/api/membership/applications", status: 401 },
      { path: "/api/publishing/workspace", status: 403 },
    ]);
    expect(fetchImpl.mock.calls.every(([, init]) => init.method === undefined)).toBe(true);
  });

  it("rejects a protected response without correlation or no-store", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      Response.json(
        { authenticated: false, available: true },
        { status: 200, headers: { "cache-control": "max-age=60" } }
      )
    );

    await expect(
      checkPrivateBoundaries("https://respublica-ev.de", fetchImpl)
    ).rejects.toThrow("protected status");
  });
});
