#!/usr/bin/env node

import { pathToFileURL } from "node:url";

const EXPECTATIONS = [
  { path: "/api/health/live", status: "live" },
  { path: "/api/health/ready", status: "ready" },
];

export async function checkDeploymentHealth(baseUrl, fetchImpl = fetch) {
  const origin = new URL(baseUrl);
  if (origin.protocol !== "https:") {
    throw new Error("Deployment health checks require an HTTPS base URL");
  }

  const results = [];
  for (const expectation of EXPECTATIONS) {
    const url = new URL(expectation.path, origin);
    const response = await fetchImpl(url, {
      headers: { accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    const body = await response.json().catch(() => null);
    const noStore = response.headers
      .get("cache-control")
      ?.toLowerCase()
      .includes("no-store");

    if (
      response.status !== 200 ||
      body?.status !== expectation.status ||
      !noStore
    ) {
      throw new Error(
        `${expectation.path} failed its status, body, or cache-control contract`
      );
    }
    results.push({ path: expectation.path, status: response.status });
  }
  return results;
}

async function main() {
  const baseUrl = process.env.HEALTHCHECK_BASE_URL;
  if (!baseUrl) {
    throw new Error("HEALTHCHECK_BASE_URL is required");
  }
  const results = await checkDeploymentHealth(baseUrl);
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
