#!/usr/bin/env node

import { pathToFileURL } from "node:url";

const EXPECTATIONS = [
  { path: "/api/health/live", status: "live" },
  { path: "/api/health/ready", status: "ready" },
];

const PRIVATE_BOUNDARIES = [
  {
    path: "/api/auth/session",
    status: 200,
    body: { authenticated: false, available: true },
  },
  {
    path: "/api/dashboard",
    status: 401,
    body: { error: "authentication_required" },
  },
  {
    path: "/api/membership/profile",
    status: 401,
    body: { error: "authentication_required" },
  },
  {
    path: "/api/membership/applications",
    status: 401,
    body: { error: "authentication_required" },
  },
  {
    path: "/api/publishing/workspace?scope=production-monitor",
    status: 403,
    body: { error: "forbidden" },
  },
];

function requireHttps(value, label) {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error(`${label} requires an HTTPS URL`);
  }
  return url;
}

function hasNoStore(response) {
  return response.headers
    .get("cache-control")
    ?.toLowerCase()
    .includes("no-store");
}

function matchesBody(actual, expected) {
  return Object.entries(expected).every(([key, value]) => actual?.[key] === value);
}

export async function checkDeploymentHealth(baseUrl, fetchImpl = fetch) {
  const origin = requireHttps(baseUrl, "Deployment health checks");

  const results = [];
  for (const expectation of EXPECTATIONS) {
    const url = new URL(expectation.path, origin);
    const response = await fetchImpl(url, {
      headers: { accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    const body = await response.json().catch(() => null);
    if (
      response.status !== 200 ||
      body?.status !== expectation.status ||
      !hasNoStore(response)
    ) {
      throw new Error(
        `${expectation.path} failed its status, body, or cache-control contract`
      );
    }
    results.push({ path: expectation.path, status: response.status });
  }
  return results;
}

export async function checkOidcDiscovery(issuerUrl, fetchImpl = fetch) {
  const issuer = requireHttps(issuerUrl, "OIDC discovery");
  const discoveryUrl = new URL(".well-known/openid-configuration", `${issuer.href.replace(/\/?$/, "/")}`);
  const response = await fetchImpl(discoveryUrl, {
    headers: { accept: "application/json" },
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.json().catch(() => null);
  const expectedIssuer = issuer.href.replace(/\/$/, "");
  const actualIssuer = typeof body?.issuer === "string"
    ? body.issuer.replace(/\/$/, "")
    : null;
  const endpoints = [
    body?.authorization_endpoint,
    body?.token_endpoint,
    body?.jwks_uri,
  ];
  const validEndpoints = endpoints.every((value) => {
    if (typeof value !== "string") return false;
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  });

  if (response.status !== 200 || actualIssuer !== expectedIssuer || !validEndpoints) {
    throw new Error("OIDC discovery failed its issuer or endpoint contract");
  }
  return [{ path: discoveryUrl.pathname, status: response.status }];
}

export async function checkPrivateBoundaries(baseUrl, fetchImpl = fetch) {
  const origin = requireHttps(baseUrl, "Protected boundary checks");
  const results = [];

  for (const expectation of PRIVATE_BOUNDARIES) {
    const url = new URL(expectation.path, origin);
    const response = await fetchImpl(url, {
      headers: { accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    const body = await response.json().catch(() => null);
    const requestId = response.headers.get("x-request-id");

    if (
      response.status !== expectation.status ||
      !matchesBody(body, expectation.body) ||
      !hasNoStore(response) ||
      !/^[0-9a-f-]{36}$/i.test(requestId ?? "")
    ) {
      throw new Error(
        `${url.pathname} failed its protected status, body, cache, or correlation contract`
      );
    }
    results.push({ path: url.pathname, status: response.status });
  }

  return results;
}

async function main() {
  const baseUrl = process.env.HEALTHCHECK_BASE_URL;
  if (!baseUrl) {
    throw new Error("HEALTHCHECK_BASE_URL is required");
  }
  const issuerUrl = process.env.HEALTHCHECK_OIDC_ISSUER;
  if (!issuerUrl) {
    throw new Error("HEALTHCHECK_OIDC_ISSUER is required");
  }
  const results = [
    ...(await checkDeploymentHealth(baseUrl)),
    ...(await checkOidcDiscovery(issuerUrl)),
    ...(await checkPrivateBoundaries(baseUrl)),
  ];
  for (const result of results) {
    console.log(`${result.path}: ${result.status}`);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Deployment health check failed"
    );
    process.exitCode = 1;
  });
}
