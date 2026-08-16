import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, expect, it, vi } from "vitest";
import { AuthorizationDeniedError } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { aiQueryLog } from "../persistence/module-schema";
import { people } from "../persistence/schema";
import type { KnowledgeGraph } from "../modules/knowledge-graph/types";
import { runGroundedCivicQuery } from "./governed-ai";

const schema = { ...coreSchema, ...moduleSchema };
const now = new Date("2026-08-10T18:30:00.000Z");
function actor(target = "public-knowledge"): AuthenticatedActor {
  return { personId: "member", sessionId: "session", authenticatedAt: now, assurance: "verified", grants: [{
    id: "grant", personId: "member", domain: "civic", capability: "ai.rag.query", target,
    assuranceRequired: "verified", validFrom: new Date("2020-01-01"), validUntil: null, revokedAt: null,
  }] };
}
function graph(): KnowledgeGraph {
  return { entities: new Map([["harm", { id: "harm", domain: "civic", type: "topic", canonicalName: "HARM", aliases: [], sources: [{
    file: "src/content/de/projects/harm-research.mdx", locale: "de",
    canonicalSource: "docs/source/foundation/01_HARM_OPERATING_SYSTEM.md", publicEligible: true,
  }] }]]), relationships: [] };
}
async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-ai-"));
  const client = new PGlite(directory);
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { directory, client, db: db as unknown as Database };
}

describe("governed AI application boundary", () => {
  it("authorizes before retrieval and stores privacy-preserving provenance", async () => {
    const fixture = await database();
    try {
      await fixture.db.insert(people).values({ id: "member", name: "Member", contact: { email: "m@example.org" }, locale: "de", rtlPreference: false, createdAt: now });
      const retrieve = vi.fn(async () => graph());
      const result = await runGroundedCivicQuery(fixture.db, actor(), { query: "harm", requestId: "request-1" }, retrieve, { pepper: "test-pepper", now });
      expect(retrieve).toHaveBeenCalledOnce();
      expect(result).toMatchObject({ refused: false, citations: ["/de/projects/harm-research"], providerMode: "local" });
      const [log] = await fixture.db.select().from(aiQueryLog);
      expect(log.prompt).not.toContain("harm");
      expect(log).toMatchObject({ actorPersonId: "member", requestId: "request-1", policyId: "civic.grounded-search.v1", providerMode: "local" });
    } finally { await fixture.client.close(); await rm(fixture.directory, { recursive: true, force: true }); }
  }, 60_000);

  it("does not retrieve or persist when exact authorization is absent", async () => {
    const fixture = await database();
    try {
      await fixture.db.insert(people).values({ id: "member", name: "Member", contact: { email: "m@example.org" }, locale: "de", rtlPreference: false, createdAt: now });
      const retrieve = vi.fn(async () => graph());
      await expect(runGroundedCivicQuery(fixture.db, actor("wrong"), { query: "harm", requestId: "request-2" }, retrieve, { pepper: "test-pepper", now })).rejects.toBeInstanceOf(AuthorizationDeniedError);
      expect(retrieve).not.toHaveBeenCalled();
      expect(await fixture.db.select().from(aiQueryLog)).toHaveLength(0);
    } finally { await fixture.client.close(); await rm(fixture.directory, { recursive: true, force: true }); }
  }, 60_000);
});
