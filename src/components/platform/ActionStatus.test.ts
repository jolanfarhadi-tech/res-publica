import { describe, expect, it } from "vitest";
import { actionStateFromResponse } from "./ActionStatus";

describe("platform action response mapping", () => {
  it("distinguishes confirmation and waitlist results", async () => {
    await expect(actionStateFromResponse(Response.json({ registration: { status: "confirmed" } }))).resolves.toBe("success");
    await expect(actionStateFromResponse(Response.json({ registration: { status: "waitlisted" } }))).resolves.toBe("waitlisted");
  });

  it("maps controlled API failures to user-facing states", async () => {
    await expect(actionStateFromResponse(Response.json({}, { status: 403 }))).resolves.toBe("forbidden");
    await expect(actionStateFromResponse(Response.json({}, { status: 409 }))).resolves.toBe("duplicate");
    await expect(actionStateFromResponse(Response.json({}, { status: 503 }))).resolves.toBe("unavailable");
    await expect(actionStateFromResponse(Response.json({}, { status: 500 }))).resolves.toBe("error");
  });
});
