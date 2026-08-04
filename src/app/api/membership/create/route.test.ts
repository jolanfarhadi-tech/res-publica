import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("retired immediate membership creation route", () => {
  it("never creates membership and directs trusted clients to the application protocol", async () => {
    const response = await POST(new Request(
      "https://respublica-ev.de/api/membership/create",
      {
        method: "POST",
        headers: { origin: "https://respublica-ev.de" },
      }
    ));

    expect(response.status).toBe(410);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    await expect(response.json()).resolves.toEqual({
      error: "membership_application_required",
      applicationEndpoint: "/api/membership/applications",
    });
  });

  it("still rejects an untrusted write origin", async () => {
    const response = await POST(new Request(
      "https://respublica-ev.de/api/membership/create",
      { method: "POST", headers: { origin: "https://attacker.example" } }
    ));
    expect(response.status).toBe(403);
  });
});
