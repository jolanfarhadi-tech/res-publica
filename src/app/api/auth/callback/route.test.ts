import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runtime: { db: {}, oidc: {} } as null | { db: object; oidc: object },
  flow: {
    stateHash: "state-hash",
    nonce: "nonce",
    codeVerifier: "verifier",
    returnTo: "/de/membership",
    intent: "login" as "login" | "signup",
  } as null | {
    stateHash: string;
    nonce: string;
    codeVerifier: string;
    returnTo: string;
    intent: "login" | "signup";
  },
  oidcResult: {
    issuer: "https://identity.example.org/",
    subject: "auth0|new",
    email: "new@example.org" as string | null,
    emailVerified: true,
    displayName: "New Person" as string | null,
    authenticatedAt: new Date("2026-08-04T10:00:00.000Z"),
    assurance: "verified" as const,
  },
  identity: null as null | { id: string; personId: string },
  provisioned: [] as unknown[],
  sessions: [] as unknown[],
}));

vi.mock("../../../../auth/runtime", () => ({
  getAuthRuntime: () => mocks.runtime,
}));
vi.mock("../../../../auth/crypto", () => ({
  createSessionToken: () => "session-token",
  hashSecret: (value: string) => `hash:${value}`,
}));
vi.mock("../../../../domain/shared", () => ({ createId: () => "generated-id" }));
vi.mock("../../../../auth/oidc", () => ({
  finishOidcFlow: async () => mocks.oidcResult,
}));
vi.mock("../../../../auth/store", () => ({
  consumeAuthFlow: async () => mocks.flow,
  findAuthIdentity: async () => mocks.identity,
  createAuthenticatedSession: async (...args: unknown[]) => {
    mocks.sessions.push(args);
  },
}));
vi.mock("../../../../auth/self-registration", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../../auth/self-registration")>();
  return {
    ...original,
    provisionSelfRegisteredIdentity: async (...args: unknown[]) => {
      mocks.provisioned.push(args);
      return {
        identity: { id: "identity-new", personId: "person-new" },
        person: { id: "person-new" },
      };
    },
  };
});

import { GET } from "./route";

function callbackRequest() {
  return new Request("https://respublica-ev.de/api/auth/callback?state=valid&code=code");
}

describe("OIDC callback registration intent", () => {
  beforeEach(() => {
    mocks.runtime = { db: {}, oidc: {} };
    mocks.flow = {
      stateHash: "state-hash",
      nonce: "nonce",
      codeVerifier: "verifier",
      returnTo: "/de/membership",
      intent: "login",
    };
    mocks.oidcResult = {
      issuer: "https://identity.example.org/",
      subject: "auth0|new",
      email: "new@example.org",
      emailVerified: true,
      displayName: "New Person",
      authenticatedAt: new Date("2026-08-04T10:00:00.000Z"),
      assurance: "verified",
    };
    mocks.identity = null;
    mocks.provisioned = [];
    mocks.sessions = [];
  });

  it("does not provision an unknown identity during ordinary member login", async () => {
    const response = await GET(callbackRequest());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "identity_not_provisioned" });
    expect(mocks.provisioned).toHaveLength(0);
    expect(mocks.sessions).toHaveLength(0);
  });

  it("provisions a verified signup identity and then creates its local session", async () => {
    if (mocks.flow) mocks.flow.intent = "signup";
    const response = await GET(callbackRequest());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://respublica-ev.de/de/membership");
    expect(mocks.provisioned).toHaveLength(1);
    expect(mocks.sessions).toHaveLength(1);
    expect(response.headers.get("set-cookie")).toContain("rp_session=session-token");
  });

  it("keeps an unverified provider account pending and creates no local session", async () => {
    if (mocks.flow) mocks.flow.intent = "signup";
    mocks.oidcResult.emailVerified = false;
    const response = await GET(callbackRequest());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "email_verification_pending" });
    expect(mocks.provisioned).toHaveLength(0);
    expect(mocks.sessions).toHaveLength(0);
  });
});
