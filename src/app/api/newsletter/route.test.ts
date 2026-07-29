import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: { kind: "database" } } as null | { db: object },
  runtimeCalls: 0,
  limiterResponse: null as Response | null,
  limiterCalls: 0,
}));

vi.mock("../../../persistence", () => ({
  getPersistenceRuntime: () => {
    mocks.runtimeCalls += 1;
    return mocks.runtime;
  },
}));
vi.mock("../../../platform/rate-limit", () => ({
  NEWSLETTER_SUBSCRIBE_RATE_LIMIT: {
    scope: "newsletter.subscribe",
    limit: 5,
    windowMs: 3_600_000,
  },
  rejectRateLimitedRequest: async () => {
    mocks.limiterCalls += 1;
    return mocks.limiterResponse;
  },
}));

import { POST } from "./route";

function request(
  body: Record<string, unknown>,
  origin = "https://respublica-ev.de"
) {
  return new Request("https://respublica-ev.de/api/newsletter", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      "x-forwarded-for": "203.0.113.10",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    mocks.runtime = { db: { kind: "database" } };
    mocks.runtimeCalls = 0;
    mocks.limiterResponse = null;
    mocks.limiterCalls = 0;
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://respublica-ev.de");
    vi.stubEnv("NEWSLETTER_ENABLED", "false");
    vi.stubEnv("NEWSLETTER_PROVIDER", "buttondown");
    vi.stubEnv("BUTTONDOWN_API_KEY", "secret-test-key");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("stays server-disabled before database or provider access", async () => {
    const response = await POST(
      request({
        email: "person@example.org",
        consent: true,
        consentVersion: "newsletter-v1",
        locale: "de",
      })
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    await expect(response.json()).resolves.toEqual({
      error: "feature_not_activated",
    });
    expect(mocks.runtimeCalls).toBe(0);
    expect(mocks.limiterCalls).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("requires an explicit versioned consent bundle before provider access", async () => {
    vi.stubEnv("NEWSLETTER_ENABLED", "true");

    const response = await POST(
      request({
        email: "person@example.org",
        consent: false,
        consentVersion: "newsletter-v1",
        locale: "de",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "consent_required",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses the shared limiter before parsing or provider work", async () => {
    vi.stubEnv("NEWSLETTER_ENABLED", "true");
    mocks.limiterResponse = Response.json(
      { error: "rate_limited" },
      { status: 429 }
    );

    const response = await POST(
      request({
        email: "person@example.org",
        consent: true,
        consentVersion: "newsletter-v1",
        locale: "de",
      })
    );

    expect(response.status).toBe(429);
    expect(mocks.limiterCalls).toBe(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits a consented address only after explicit activation", async () => {
    vi.stubEnv("NEWSLETTER_ENABLED", "true");
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 201 }));

    const response = await POST(
      request({
        email: "person@example.org",
        consent: true,
        consentVersion: "newsletter-v1",
        locale: "fa",
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.runtimeCalls).toBe(1);
    expect(mocks.limiterCalls).toBe(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.buttondown.email/v1/subscribers",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email_address: "person@example.org" }),
      })
    );
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
