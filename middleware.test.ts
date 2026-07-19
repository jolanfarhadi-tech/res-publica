import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, middleware } from "./middleware";

describe("locale middleware", () => {
  it("matches the root path and excludes API routes", () => {
    expect(unstable_doesMiddlewareMatch({ config, url: "https://res-publica.org/" })).toBe(true);
    expect(
      unstable_doesMiddlewareMatch({ config, url: "https://res-publica.org/api/platform/modules" })
    ).toBe(false);
  });

  it("redirects the root to the preferred supported locale", () => {
    const request = new NextRequest("https://res-publica.org/", {
      headers: { "accept-language": "fa-IR,fa;q=0.9,de;q=0.8" },
    });
    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://res-publica.org/fa");
  });

  it("uses German when no supported locale is requested", () => {
    const request = new NextRequest("https://res-publica.org/");
    const response = middleware(request);

    expect(response.headers.get("location")).toBe("https://res-publica.org/de");
  });
});
