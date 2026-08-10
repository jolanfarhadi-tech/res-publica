#!/usr/bin/env node

import { pathToFileURL } from "node:url";

const PRIVATE_HEADERS = {
  accept: "application/json",
};

function requireHttps(value, label) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`${label} requires HTTPS`);
  return url;
}

function requireRequestId(response, path) {
  if (!/^[0-9a-f-]{36}$/i.test(response.headers.get("x-request-id") ?? "")) {
    throw new Error(`${path} did not return a server correlation ID`);
  }
}

function requirePrivateNoStore(response, path) {
  const cacheControl = response.headers.get("cache-control")?.toLowerCase() ?? "";
  if (!cacheControl.includes("private") || !cacheControl.includes("no-store")) {
    throw new Error(`${path} did not return a private no-store response`);
  }
}

async function readJson(response, path) {
  const body = await response.json().catch(() => null);
  if (!body) throw new Error(`${path} did not return JSON`);
  return body;
}

export function validateSignupRedirect(location, baseUrl, issuerUrl) {
  const authorizationUrl = requireHttps(location, "OIDC authorization redirect");
  const base = requireHttps(baseUrl, "Membership E2E base URL");
  const issuer = requireHttps(issuerUrl, "OIDC issuer");
  const expectedCallback = new URL("/api/auth/callback", base).href;

  if (authorizationUrl.origin !== issuer.origin) {
    throw new Error("OIDC authorization redirect does not use the approved issuer");
  }
  const required = {
    response_type: "code",
    redirect_uri: expectedCallback,
    code_challenge_method: "S256",
    screen_hint: "signup",
  };
  for (const [key, value] of Object.entries(required)) {
    if (authorizationUrl.searchParams.get(key) !== value) {
      throw new Error(`OIDC authorization redirect has an invalid ${key}`);
    }
  }
  for (const key of ["client_id", "code_challenge", "state", "nonce"]) {
    if (!authorizationUrl.searchParams.get(key)) {
      throw new Error(`OIDC authorization redirect is missing ${key}`);
    }
  }

  return {
    authorizationOrigin: authorizationUrl.origin,
    callback: expectedCallback,
    pkce: true,
    state: true,
    nonce: true,
  };
}

export async function checkMembershipProductionE2e({
  baseUrl,
  issuerUrl,
  sessionCookie,
  requireMfa = false,
  fetchImpl = fetch,
}) {
  const base = requireHttps(baseUrl, "Membership E2E base URL");
  const anonymousSessionResponse = await fetchImpl(
    new URL("/api/auth/session", base),
    { headers: PRIVATE_HEADERS, redirect: "error", signal: AbortSignal.timeout(15_000) }
  );
  const anonymousSession = await readJson(anonymousSessionResponse, "/api/auth/session");
  requireRequestId(anonymousSessionResponse, "/api/auth/session");
  requirePrivateNoStore(anonymousSessionResponse, "/api/auth/session");
  if (
    anonymousSessionResponse.status !== 200 ||
    anonymousSession.available !== true ||
    anonymousSession.authenticated !== false
  ) {
    throw new Error("Anonymous authentication boundary is unavailable or unsafe");
  }

  const signupResponse = await fetchImpl(
    new URL("/api/auth/login?mode=signup&returnTo=%2Fde%2Fmembership", base),
    { headers: PRIVATE_HEADERS, redirect: "manual", signal: AbortSignal.timeout(15_000) }
  );
  requireRequestId(signupResponse, "/api/auth/login");
  requirePrivateNoStore(signupResponse, "/api/auth/login");
  if (signupResponse.status !== 302) {
    throw new Error("Signup initiation did not return the OIDC redirect");
  }
  const oidc = validateSignupRedirect(
    signupResponse.headers.get("location") ?? "",
    base.href,
    issuerUrl
  );

  if (!sessionCookie) {
    return {
      anonymousBoundary: "verified",
      oidc,
      authenticatedBoundary: "controlled_auth0_session_required",
      membershipApplication: "not_mutated",
      boardDecision: "not_mutated_mfa_boundary_not_entered",
    };
  }

  const headers = { ...PRIVATE_HEADERS, cookie: sessionCookie };
  const sessionResponse = await fetchImpl(new URL("/api/auth/session", base), {
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  const session = await readJson(sessionResponse, "/api/auth/session");
  requireRequestId(sessionResponse, "/api/auth/session");
  requirePrivateNoStore(sessionResponse, "/api/auth/session");
  if (sessionResponse.status !== 200 || session.authenticated !== true) {
    throw new Error("Controlled Auth0 session is not authenticated");
  }
  const hasMfa = session.assurance === "mfa" || session.assurance === "recent-mfa";
  if (requireMfa && !hasMfa) {
    throw new Error("Controlled board verification requires a genuine MFA session");
  }

  const protectedReads = [];
  for (const path of [
    "/api/membership/applications",
    "/api/dashboard",
    "/api/membership/profile",
  ]) {
    const response = await fetchImpl(new URL(path, base), {
      headers,
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    requireRequestId(response, path);
    requirePrivateNoStore(response, path);
    if (response.status !== 200) {
      throw new Error(`${path} rejected the controlled authenticated session`);
    }
    protectedReads.push({ path, status: response.status });
  }

  return {
    anonymousBoundary: "verified",
    oidc,
    authenticatedBoundary: "verified",
    assurance: session.assurance,
    mfa: hasMfa,
    protectedReads,
    membershipApplication: "not_mutated",
    boardDecision: "not_mutated",
  };
}

async function main() {
  const baseUrl = process.env.MEMBERSHIP_E2E_BASE_URL;
  const issuerUrl = process.env.MEMBERSHIP_E2E_OIDC_ISSUER;
  if (!baseUrl || !issuerUrl) {
    throw new Error(
      "MEMBERSHIP_E2E_BASE_URL and MEMBERSHIP_E2E_OIDC_ISSUER are required"
    );
  }
  const result = await checkMembershipProductionE2e({
    baseUrl,
    issuerUrl,
    sessionCookie: process.env.MEMBERSHIP_E2E_SESSION_COOKIE,
    requireMfa: process.env.MEMBERSHIP_E2E_REQUIRE_MFA === "true",
  });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Membership E2E failed");
    process.exitCode = 1;
  });
}
