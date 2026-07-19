import { describe, expect, it } from "vitest";
import { memberProfileStateFromResponse } from "./MemberProfileDashboard";

describe("German Member Profile response states", () => {
  it("maps protected-route failures without exposing payloads", async () => {
    await expect(memberProfileStateFromResponse(Response.json({ hidden: "value" }, { status: 401 }))).resolves.toEqual({ kind: "anonymous" });
    await expect(memberProfileStateFromResponse(Response.json({ hidden: "value" }, { status: 503 }))).resolves.toEqual({ kind: "unavailable" });
    await expect(memberProfileStateFromResponse(Response.json({ hidden: "value" }, { status: 500 }))).resolves.toEqual({ kind: "error" });
  });

  it("accepts only successful profile responses as ready", async () => {
    await expect(memberProfileStateFromResponse(Response.json({ enrolled: false }))).resolves.toEqual({
      kind: "ready",
      profile: { enrolled: false },
    });
  });
});
