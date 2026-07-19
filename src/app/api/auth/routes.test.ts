import { describe, expect, it } from "vitest";
import { GET as login } from "./login/route";
import { POST as logout } from "./logout/route";

describe("authentication routes fail closed", () => {
  it("does not invent authentication when provider configuration is absent", async () => {
    const response = await login(new Request("https://res-publica.org/api/auth/login"));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "authentication_not_configured" });
  });

  it("rejects cross-origin logout before reading session state", async () => {
    const response = await logout(new Request("https://res-publica.org/api/auth/logout", {
      method: "POST",
      headers: { origin: "https://attacker.example" },
    }));
    expect(response.status).toBe(403);
  });

  it("rejects logout without browser same-origin evidence", async () => {
    const response = await logout(new Request("https://res-publica.org/api/auth/logout", {
      method: "POST",
    }));
    expect(response.status).toBe(403);
  });

  it("accepts same-origin evidence before checking configuration", async () => {
    const response = await logout(new Request("https://res-publica.org/api/auth/logout", {
      method: "POST",
      headers: { origin: "https://res-publica.org" },
    }));
    expect(response.status).toBe(503);
  });
});
