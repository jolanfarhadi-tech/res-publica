import { describe, expect, it } from "vitest";
import { dashboardStateFromResponse } from "./dashboard-state";

describe("Dashboard response mapping", () => {
  it("maps the private dashboard projection", async () => {
    const dashboard = {
      account: { status: "authenticated", assurance: "verified" },
      membership: { enrolled: false },
      consents: [],
      eventRegistrations: [],
      notifications: [],
      permittedActions: { viewProfile: true },
    };

    await expect(
      dashboardStateFromResponse(Response.json(dashboard))
    ).resolves.toEqual({ kind: "ready", dashboard });
  });

  it("maps protected failure states without exposing response internals", async () => {
    await expect(
      dashboardStateFromResponse(Response.json({}, { status: 401 }))
    ).resolves.toEqual({ kind: "anonymous" });
    await expect(
      dashboardStateFromResponse(Response.json({}, { status: 503 }))
    ).resolves.toEqual({ kind: "unavailable" });
    await expect(
      dashboardStateFromResponse(Response.json({}, { status: 500 }))
    ).resolves.toEqual({ kind: "error" });
  });
});
