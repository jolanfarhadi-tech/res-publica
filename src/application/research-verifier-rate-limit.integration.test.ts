import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import type { ResearchVerifierDatabase } from "../persistence/research-verifier-database";
import * as schema from "../persistence/research-verifier-schema";
import { verifierRateLimitBuckets } from "../persistence/research-verifier-schema";
import { consumeResearchVerifierRateLimit } from "./research-verifier-rate-limit";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("isolated verifier rate limiter", () => {
  it("persists only a keyed digest and rejects after the distributed limit", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-verifier-rate-"));
    directories.push(directory);
    const client = new PGlite(directory);
    try {
      const db = drizzle({ client, schema }) as unknown as ResearchVerifierDatabase;
      await migrate(db as never, { migrationsFolder: join(process.cwd(), "drizzle-research") });
      const request = new Request("https://respublica-ev.de/api/research/verifier/challenge", {
        headers: { "x-forwarded-for": "203.0.113.42" },
      });
      let result = { allowed: false, retryAfter: 0 };
      for (let index = 0; index < 31; index += 1) {
        result = await consumeResearchVerifierRateLimit(
          db, request, "a".repeat(64), "synthetic-pepper-at-least-32-characters",
          new Date("2026-08-04T12:00:00.000Z")
        );
      }
      expect(result.allowed).toBe(false);
      const stored = await db.select().from(verifierRateLimitBuckets);
      expect(stored).toHaveLength(1);
      expect(JSON.stringify(stored)).not.toContain("203.0.113.42");
      expect(stored[0].identifierHash).toMatch(/^[0-9a-f]{64}$/);
    } finally {
      await client.close();
    }
  }, 30_000);
});
