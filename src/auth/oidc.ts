import * as oidc from "openid-client";
import type { AssuranceLevel } from "./types";
import type { OidcEnvironment } from "./config";

export type OidcFlow = {
  authorizationUrl: URL;
  state: string;
  nonce: string;
  codeVerifier: string;
};

let cachedConfiguration: Promise<oidc.Configuration> | null = null;

function configuration(environment: OidcEnvironment): Promise<oidc.Configuration> {
  cachedConfiguration ??= oidc.discovery(
    new URL(environment.OIDC_ISSUER),
    environment.OIDC_CLIENT_ID,
    environment.OIDC_CLIENT_SECRET
  );
  return cachedConfiguration;
}

export async function beginOidcFlow(environment: OidcEnvironment): Promise<OidcFlow> {
  const config = await configuration(environment);
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const authorizationUrl = oidc.buildAuthorizationUrl(config, {
    redirect_uri: environment.OIDC_REDIRECT_URI,
    scope: environment.OIDC_SCOPE,
    response_type: "code",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    nonce,
  });
  return { authorizationUrl, state, nonce, codeVerifier };
}

export async function finishOidcFlow(
  environment: OidcEnvironment,
  callbackUrl: URL,
  expected: { state: string; nonce: string; codeVerifier: string }
) {
  const config = await configuration(environment);
  const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
    expectedState: expected.state,
    expectedNonce: expected.nonce,
    pkceCodeVerifier: expected.codeVerifier,
    idTokenExpected: true,
  });
  const claims = tokens.claims();
  if (!claims?.sub || !claims.iss) {
    throw new Error("OIDC callback did not return stable issuer and subject claims");
  }
  return {
    issuer: claims.iss,
    subject: claims.sub,
    authenticatedAt: claims.auth_time ? new Date(claims.auth_time * 1000) : new Date(),
    assurance: assuranceFromClaims(claims as Record<string, unknown>),
  };
}

function assuranceFromClaims(claims: Record<string, unknown>): AssuranceLevel {
  const methods = Array.isArray(claims.amr) ? claims.amr.filter((value): value is string => typeof value === "string") : [];
  const usedMfa = methods.some((method) => ["mfa", "otp", "hwk", "swk", "webauthn"].includes(method));
  if (!usedMfa) return "verified";
  const authTime = typeof claims.auth_time === "number" ? claims.auth_time * 1000 : 0;
  return Date.now() - authTime <= 5 * 60 * 1000 ? "recent-mfa" : "mfa";
}
