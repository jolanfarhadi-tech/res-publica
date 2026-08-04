import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import {
  auditLog,
  authIdentities,
  authorizationGrants,
  people,
} from "../persistence/schema";
import {
  EmailVerificationRequiredError,
  IdentityReviewRequiredError,
  provisionSelfRegisteredIdentity,
} from "./self-registration";

const schema = { ...coreSchema, ...moduleSchema };
const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })
  ));
});

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-self-registration-"));
  directories.push(directory);
  const client = new PGlite(directory);
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { client, db: db as unknown as Database };
}

const verifiedClaims = {
  issuer: "https://identity.example.org/",
  subject: "auth0|new-person",
  email: "new.person@example.org",
  emailVerified: true,
  displayName: "New Person",
} as const;

describe("verified OIDC self-registration", () => {
  it("creates the minimal Person, identity, self-service grants, and audit atomically", async () => {
    const { client, db } = await database();
    try {
      const result = await provisionSelfRegisteredIdentity(
        db,
        verifiedClaims,
        "fa",
        new Date("2026-08-04T10:00:00.000Z")
      );

      expect(result.person).toMatchObject({
        name: "New Person",
        contact: { email: "new.person@example.org" },
        locale: "fa",
        rtlPreference: true,
      });
      expect(await db.select().from(authIdentities)).toEqual([
        expect.objectContaining({
          personId: result.person.id,
          issuer: verifiedClaims.issuer,
          subject: verifiedClaims.subject,
          disabledAt: null,
        }),
      ]);
      expect((await db.select().from(authorizationGrants)).map((row) => row.capability).sort()).toEqual([
        "membership.application.submit",
        "research.preference.manage",
      ]);
      expect((await db.select().from(auditLog)).map((row) => row.action)).toEqual([
        "auth.identity-self-registered",
        "authorization.self-service-grant-created",
        "authorization.self-service-grant-created",
      ]);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("does not create local identity state before provider email verification", async () => {
    const { client, db } = await database();
    try {
      await expect(provisionSelfRegisteredIdentity(
        db,
        { ...verifiedClaims, emailVerified: false },
        "de"
      )).rejects.toBeInstanceOf(EmailVerificationRequiredError);

      expect(await db.select().from(people)).toHaveLength(0);
      expect(await db.select().from(authIdentities)).toHaveLength(0);
      expect(await db.select().from(authorizationGrants)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("fails closed instead of auto-linking an existing email address", async () => {
    const { client, db } = await database();
    try {
      await db.insert(people).values({
        id: "person-existing",
        name: "Existing Person",
        contact: { email: "new.person@example.org" },
        locale: "de",
        rtlPreference: false,
        createdAt: new Date(),
      });

      await expect(provisionSelfRegisteredIdentity(db, verifiedClaims, "de"))
        .rejects.toBeInstanceOf(IdentityReviewRequiredError);

      expect(await db.select().from(people)).toHaveLength(1);
      expect(await db.select().from(authIdentities)).toHaveLength(0);
      expect(await db.select().from(authorizationGrants)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);
    } finally {
      await client.close();
    }
  }, 30_000);
});
