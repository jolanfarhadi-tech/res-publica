import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, authorizationGrants, people } from "../persistence/schema";
import { editorialCapability } from "../modules/publishing/authority";
import { grantEditorialRole, revokeEditorialRole } from "./publishing-authority";

const directories: string[] = [];
afterEach(async () => Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))));

function publisherActor(): AuthenticatedActor {
  return {
    personId: "publisher",
    sessionId: "publisher-session",
    authenticatedAt: new Date(),
    assurance: "mfa",
    grants: [{
      id: "publisher-grant",
      personId: "publisher",
      domain: "civic",
      capability: editorialCapability("publisher"),
      target: "website",
      assuranceRequired: "mfa",
      validFrom: new Date(0),
      validUntil: null,
      revokedAt: null,
    }],
  };
}

describe("ADR-036 editorial grant persistence", () => {
  it("rejects an already-expired grant without writing grant or audit state", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-grants-")); directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const serviceDb = db as unknown as Database;
    const now = new Date();
    await db.insert(people).values([
      { id: "publisher", name: "Publisher", contact: { email: "publisher@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "editor", name: "Editor", contact: { email: "editor@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);

    await expect(grantEditorialRole(serviceDb, publisherActor(), {
      granteePersonId: "editor",
      publicationScope: "website",
      role: "editor",
      validUntil: new Date(Date.now() - 1_000),
    })).rejects.toThrow("grant_expiry_must_be_future");
    await expect(grantEditorialRole(serviceDb, publisherActor(), {
      granteePersonId: "editor",
      publicationScope: "website",
      role: "editor",
      validUntil: new Date(Number.NaN),
    })).rejects.toThrow("grant_expiry_invalid");
    expect(await db.select().from(authorizationGrants)).toHaveLength(0);
    expect(await db.select().from(auditLog)).toHaveLength(0);
    await client.close();
  }, 20_000);

  it("persists and revokes an operational grant with exactly one audit event per transition", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-publishing-grant-lifecycle-")); directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const serviceDb = db as unknown as Database;
    const now = new Date();
    await db.insert(people).values([
      { id: "publisher", name: "Publisher", contact: { email: "publisher@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "editor", name: "Editor", contact: { email: "editor@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);

    const grant = await grantEditorialRole(serviceDb, publisherActor(), {
      granteePersonId: "editor",
      publicationScope: "website",
      role: "editor",
      validUntil: null,
    });
    await revokeEditorialRole(serviceDb, publisherActor(), { grantId: grant.id, publicationScope: "website" });
    await expect(revokeEditorialRole(serviceDb, publisherActor(), {
      grantId: grant.id,
      publicationScope: "website",
    })).rejects.toThrow("grant_not_found");

    const [persisted] = await db.select().from(authorizationGrants);
    expect(persisted.revokedAt).toBeInstanceOf(Date);
    expect((await db.select().from(auditLog)).map((entry) => entry.action)).toEqual([
      "publishing.role-granted",
      "publishing.role-revoked",
    ]);
    await client.close();
  }, 20_000);
});
