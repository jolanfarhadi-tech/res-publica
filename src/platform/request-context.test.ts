import { afterEach, describe, expect, it, vi } from "vitest";
import {
  logOperationalFailure,
  REQUEST_ID_HEADER,
  withRequestContext,
} from "./request-context";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("request context", () => {
  it("adds a server-generated correlation ID without changing the response", async () => {
    const response = await withRequestContext(
      new Request("https://respublica-ev.de/api/example"),
      async () =>
        Response.json(
          { ok: true },
          { status: 201, headers: { "Cache-Control": "no-store" } }
        )
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get(REQUEST_ID_HEADER)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("does not trust a caller-provided request ID", async () => {
    const response = await withRequestContext(
      new Request("https://respublica-ev.de/api/example", {
        headers: { "x-request-id": "attacker-controlled" },
      }),
      async () => new Response(null, { status: 204 })
    );

    expect(response.headers.get(REQUEST_ID_HEADER)).not.toBe(
      "attacker-controlled"
    );
  });

  it("returns a stable error and logs no exception detail", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await withRequestContext(
      new Request(
        "https://respublica-ev.de/api/example?token=must-not-be-logged",
        { method: "POST" }
      ),
      async () => {
        throw new Error("secret failure detail");
      }
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "internal_error",
    });
    const logEntry = String(errorSpy.mock.calls[0]?.[0]);
    expect(logEntry).toContain('"event":"request.unhandled_error"');
    expect(logEntry).toContain('"method":"POST"');
    expect(logEntry).toContain('"path":"/api/example"');
    expect(logEntry).not.toContain("secret failure detail");
    expect(logEntry).not.toContain("must-not-be-logged");
  });

  it("logs only the allowlisted operational failure fields", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    logOperationalFailure({
      event: "notification.delivery_failed",
      dependency: "notification-provider",
      status: 503,
      attemptNumber: 2,
      retryable: true,
      errorCode: "provider_unavailable",
    });

    const entry = JSON.parse(String(errorSpy.mock.calls[0]?.[0]));
    expect(entry).toMatchObject({
      level: "error",
      event: "notification.delivery_failed",
      dependency: "notification-provider",
      status: 503,
      attemptNumber: 2,
      retryable: true,
      errorCode: "provider_unavailable",
    });
    expect(Object.keys(entry).sort()).toEqual([
      "attemptNumber",
      "dependency",
      "errorCode",
      "event",
      "level",
      "retryable",
      "status",
      "timestamp",
    ]);
  });
});
