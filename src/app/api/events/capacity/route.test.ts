import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("event capacity route", () => {
  it("rejects invalid event identifiers", async () => {
    const response = await GET(new Request("https://res-publica.org/api/events/capacity?eventId=../event"));
    expect(response.status).toBe(400);
  });

  it("fails closed when persistence is not configured", async () => {
    const response = await GET(new Request("https://res-publica.org/api/events/capacity?eventId=forum-demokratie-2026"));
    expect(response.status).toBe(503);
  });
});
