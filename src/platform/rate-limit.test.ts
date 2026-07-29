import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import * as moduleSchema from "../persistence/module-schema";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import { rateLimitBuckets } from "../persistence/schema";
import {
  GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT,
  PUBLISHING_PRIVILEGED_WRITE_RATE_LIMIT,
  consumeRateLimit,
  rejectRateLimitedRequest,
} from "./rate-limit";

const schema = { ...coreSchema, ...moduleSchema };
const temporaryDirectories: string[] = [];

async function createTemporaryDatabase() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-rate-limit-"));
  temporaryDirectories.push(directory);
  const client = new PGlite(directory);
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { client, db, serviceDb: db as unknown as Database };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  );
});

describe("shared PostgreSQL rate limiting", () => {
  it("uses distinct stable scopes for Governance and Publishing writes", () => {
    expect(GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT).toEqual({
      scope: "governance.privileged-write",
      limit: 60,
      windowMs: 900_000,
    });
    expect(PUBLISHING_PRIVILEGED_WRITE_RATE_LIMIT).toEqual({
      scope: "publishing.privileged-write",
      limit: 60,
      windowMs: 900_000,
    });
  });

  it("atomically limits a pseudonymized client within one window", async () => {
    const { client, db, serviceDb } = await createTemporaryDatabase();
    const input = {
      scope: "auth.login",
      identifier: "203.0.113.42",
      pepper: "test-only-pepper",
      limit: 2,
      windowMs: 60_000,
      now: new Date("2026-07-29T10:00:00.000Z"),
    };

    await expect(consumeRateLimit(serviceDb, input)).resolves.toMatchObject({
      allowed: true,
      remaining: 1,
    });
    await expect(consumeRateLimit(serviceDb, input)).resolves.toMatchObject({
      allowed: true,
      remaining: 0,
    });
    await expect(consumeRateLimit(serviceDb, input)).resolves.toMatchObject({
      allowed: false,
      remaining: 0,
    });

    const [stored] = await db.select().from(rateLimitBuckets);
    expect(stored.requestCount).toBe(3);
    expect(stored.identifierHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored.identifierHash).not.toContain(input.identifier);
    await client.close();
  }, 20_000);

  it("resets an expired bucket and remains correct under concurrent requests", async () => {
    const { client, serviceDb } = await createTemporaryDatabase();
    const base = {
      scope: "membership.create",
      identifier: "198.51.100.19",
      pepper: "test-only-pepper",
      limit: 2,
      windowMs: 1_000,
    };

    const concurrent = await Promise.all(
      Array.from({ length: 5 }, () =>
        consumeRateLimit(serviceDb, {
          ...base,
          now: new Date("2026-07-29T10:00:00.000Z"),
        })
      )
    );
    expect(concurrent.filter(({ allowed }) => allowed)).toHaveLength(2);

    await expect(
      consumeRateLimit(serviceDb, {
        ...base,
        now: new Date("2026-07-29T10:00:01.001Z"),
      })
    ).resolves.toMatchObject({ allowed: true, remaining: 1 });
    await client.close();
  }, 20_000);

  it("returns a non-cacheable retry response without persisting a raw address", async () => {
    const { client, db, serviceDb } = await createTemporaryDatabase();
    const request = new Request(
      "https://respublica-ev.de/api/auth/login?returnTo=/de/profile",
      {
        headers: {
          "x-vercel-forwarded-for": "192.0.2.55",
        },
      }
    );
    const policy = { scope: "auth.login", limit: 1, windowMs: 60_000 };
    const options = {
      environment: { SESSION_SECRET: "test-only-pepper" },
      now: new Date("2026-07-29T10:00:00.000Z"),
    };

    await expect(
      rejectRateLimitedRequest(serviceDb, request, policy, options)
    ).resolves.toBeNull();
    const rejection = await rejectRateLimitedRequest(
      serviceDb,
      request,
      policy,
      options
    );

    expect(rejection?.status).toBe(429);
    expect(rejection?.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    );
    expect(rejection?.headers.get("retry-after")).toBe("60");
    expect(rejection?.headers.get("x-ratelimit-limit")).toBe("1");
    await expect(rejection?.json()).resolves.toEqual({
      error: "rate_limited",
    });
    const [stored] = await db.select().from(rateLimitBuckets);
    expect(stored.identifierHash).not.toContain("192.0.2.55");
    await client.close();
  }, 20_000);

  it("fails closed when the identifier pepper is not configured", async () => {
    const { client, serviceDb } = await createTemporaryDatabase();
    const response = await rejectRateLimitedRequest(
      serviceDb,
      new Request("https://respublica-ev.de/api/auth/login"),
      { scope: "auth.login", limit: 1, windowMs: 60_000 },
      { environment: {}, now: new Date("2026-07-29T10:00:00.000Z") }
    );

    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toEqual({
      error: "request_protection_not_configured",
    });
    await client.close();
  }, 20_000);
});
