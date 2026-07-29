import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("security response headers", () => {
  it("applies transport and browser isolation policies to every route", async () => {
    const rules = await nextConfig.headers?.();
    const globalRule = rules?.find((rule) => rule.source === "/(.*)");
    const headers = new Map(
      globalRule?.headers.map(({ key, value }) => [
        key.toLowerCase(),
        value,
      ])
    );

    expect(headers.get("strict-transport-security")).toBe(
      "max-age=31536000"
    );
    expect(headers.get("content-security-policy")).toBe(
      "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests"
    );
    expect(headers.get("cross-origin-opener-policy")).toBe(
      "same-origin-allow-popups"
    );
    expect(headers.get("cross-origin-resource-policy")).toBe("same-origin");
    expect(headers.get("x-content-type-options")).toBe("nosniff");
    expect(headers.get("x-frame-options")).toBe("DENY");
  });
});
