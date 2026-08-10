import { describe, expect, it } from "vitest";
import { operationsStateFromResponse } from "./operations-state";

describe("Operations Console response mapping", () => {
  it("maps a bounded private overview", async () => {
    const overview = {
      account: { assurance: "mfa", authenticatedAt: "2026-08-10T10:00:00Z" },
      membershipApplications: [],
      publishingScopes: [],
    };
    await expect(
      operationsStateFromResponse(Response.json(overview))
    ).resolves.toEqual({ kind: "ready", overview });
  });

  it("keeps authentication, MFA, authorization and availability distinct", async () => {
    await expect(
      operationsStateFromResponse(
        Response.json({ error: "authentication_required" }, { status: 401 })
      )
    ).resolves.toEqual({ kind: "anonymous" });
    await expect(
      operationsStateFromResponse(
        Response.json({ error: "mfa_required" }, { status: 403 })
      )
    ).resolves.toEqual({ kind: "mfa-required" });
    await expect(
      operationsStateFromResponse(
        Response.json({ error: "forbidden" }, { status: 403 })
      )
    ).resolves.toEqual({ kind: "forbidden" });
    await expect(
      operationsStateFromResponse(
        Response.json({ error: "service_not_configured" }, { status: 503 })
      )
    ).resolves.toEqual({ kind: "unavailable" });
  });
});
