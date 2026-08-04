import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {} } as null | { db: object },
  actor: { personId: "person-applicant" } as null | { personId: string },
  submitted: [] as unknown[],
  currentApplication: { id: "application-1", status: "application_pending" } as unknown,
  rateLimitResponse: null as Response | null,
}));

vi.mock("../../../../auth/runtime", () => ({ getAuthRuntime: () => mocks.runtime }));
vi.mock("../../../../auth/actor-resolver", () => ({
  createActorResolver: () => ({ resolve: async () => mocks.actor }),
}));
vi.mock("../../../../platform/rate-limit", () => ({
  MEMBERSHIP_APPLICATION_RATE_LIMIT: {
    scope: "membership.application.submit", limit: 5, windowMs: 3_600_000,
  },
  rejectRateLimitedRequest: async () => mocks.rateLimitResponse,
}));
vi.mock("../../../../application/membership-applications", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../application/membership-applications")>();
  return {
    ...original,
    submitMembershipApplication: async (...args: unknown[]) => {
      mocks.submitted.push(args);
      return { id: "application-1", status: "application_pending" };
    },
    getSelfMembershipApplication: async () => mocks.currentApplication,
  };
});

import { GET, POST } from "./route";

const validBody = {
  givenName: "Ada",
  familyName: "Lovelace",
  email: "ada@example.org",
  address: {
    line1: "Beispielstraße 1", line2: null, postalCode: "10115", city: "Berlin", countryCode: "DE",
  },
  requestedTier: "basic",
  acknowledgements: {
    statutes: { accepted: true, version: "signed-sha256-6f2882ae0dff" },
    technicalProtocol: { accepted: true, version: "membership-application-protocol-v1" },
    privacyNotice: { acknowledged: true, version: "public-sha256-1dff06d9cd53" },
  },
};

function request(body: unknown = validBody) {
  return new Request("https://respublica-ev.de/api/membership/applications", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://respublica-ev.de" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/membership/applications", () => {
  beforeEach(() => {
    mocks.runtime = { db: {} };
    mocks.actor = { personId: "person-applicant" };
    mocks.submitted = [];
    mocks.rateLimitResponse = null;
    mocks.currentApplication = { id: "application-1", status: "application_pending" };
  });

  it("returns the authenticated person's current application status", async () => {
    const response = await GET(new Request("https://respublica-ev.de/api/membership/applications"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      application: { id: "application-1", status: "application_pending" },
    });
  });

  it("submits the complete application without requiring research consent", async () => {
    const response = await POST(request());
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      application: { id: "application-1", status: "application_pending" },
    });
    expect(mocks.submitted).toHaveLength(1);
  });

  it.each([
    ["statutes", { ...validBody, acknowledgements: { ...validBody.acknowledgements, statutes: { ...validBody.acknowledgements.statutes, accepted: false } } }],
    ["technical protocol", { ...validBody, acknowledgements: { ...validBody.acknowledgements, technicalProtocol: { ...validBody.acknowledgements.technicalProtocol, accepted: false } } }],
    ["privacy notice", { ...validBody, acknowledgements: { ...validBody.acknowledgements, privacyNotice: { ...validBody.acknowledgements.privacyNotice, acknowledged: false } } }],
  ])("rejects a missing %s acknowledgement before persistence", async (_label, body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(mocks.submitted).toHaveLength(0);
  });

  it("stops before actor resolution and persistence when rate limited", async () => {
    mocks.rateLimitResponse = Response.json({ error: "rate_limited" }, { status: 429 });
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(mocks.submitted).toHaveLength(0);
  });
});
