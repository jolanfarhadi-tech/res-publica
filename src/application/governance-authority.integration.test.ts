import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../auth/types";
import { auditLog, authorizationGrants, people } from "../persistence/schema";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import type { Database } from "../persistence";
import { governanceCapability } from "../modules/harm-governance/authority";
import { grantGovernanceRole, revokeGovernanceRole } from "./governance-authority";

const directories: string[] = [];
afterEach(async () => Promise.all(directories.splice(0).map((directory) =>
  rm(directory, { recursive: true, force: true })
)));

function adminActor(authenticatedAt = new Date()): AuthenticatedActor {
  return {
    personId: "admin",
    sessionId: "admin-session",
    authenticatedAt,
    assurance: "recent-mfa",
    grants: [{
      id: "admin-grant",
      personId: "admin",
      domain: "governance",
      capability: governanceCapability("institution-admin"),
      target: "institution-1",
      assuranceRequired: "mfa",
      validFrom: new Date(0),
      validUntil: null,
      revokedAt: null,
    }],
  };
}

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-governance-grants-"));
  directories.push(directory);
  const client = new PGlite(directory);
  const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  await db.insert(people).values([
    { id: "admin", name: "Admin", contact: { email: "admin@example.org" }, locale: "de", rtlPreference: false, createdAt: new Date() },
    { id: "reviewer", name: "Reviewer", contact: { email: "reviewer@example.org" }, locale: "de", rtlPreference: false, createdAt: new Date() },
  ]);
  return { client, db, serviceDb: db as unknown as Database };
}

describe("privileged Governance role lifecycle", () => {
  it("persists correlated grant and revoke audit evidence atomically", async () => {
    const { client, db, serviceDb } = await database();
    try {
      const grant = await grantGovernanceRole(serviceDb, adminActor(), {
        granteePersonId: "reviewer",
        institutionId: "institution-1",
        role: "evidence-reviewer",
        validUntil: null,
        reasonCode: "operational-role-assignment",
        requestId: "30000000-0000-4000-8000-000000000001",
      });
      await revokeGovernanceRole(serviceDb, adminActor(), {
        grantId: grant.id,
        institutionId: "institution-1",
        reasonCode: "scheduled-access-review",
        requestId: "30000000-0000-4000-8000-000000000002",
      });
      await expect(revokeGovernanceRole(serviceDb, adminActor(), {
        grantId: grant.id,
        institutionId: "institution-1",
        reasonCode: "scheduled-access-review",
        requestId: "30000000-0000-4000-8000-000000000003",
      })).rejects.toThrow("grant_not_found");

      expect((await db.select().from(authorizationGrants))[0].revokedAt).toBeInstanceOf(Date);
      expect(await db.select().from(auditLog)).toEqual([
        expect.objectContaining({
          action: "governance.role-granted",
          sessionId: "admin-session",
          requestId: "30000000-0000-4000-8000-000000000001",
          reasonCode: "operational-role-assignment",
          capability: governanceCapability("evidence-reviewer"),
        }),
        expect.objectContaining({
          action: "governance.role-revoked",
          sessionId: "admin-session",
          requestId: "30000000-0000-4000-8000-000000000002",
          reasonCode: "scheduled-access-review",
          capability: governanceCapability("evidence-reviewer"),
        }),
      ]);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("rejects stale MFA and self-delegation without state or audit mutation", async () => {
    const { client, db, serviceDb } = await database();
    try {
      await expect(grantGovernanceRole(serviceDb, adminActor(new Date(Date.now() - 6 * 60_000)), {
        granteePersonId: "reviewer",
        institutionId: "institution-1",
        role: "evidence-reviewer",
        validUntil: null,
        reasonCode: "operational-role-assignment",
        requestId: "30000000-0000-4000-8000-000000000004",
      })).rejects.toThrow("Authorization denied");
      await expect(grantGovernanceRole(serviceDb, adminActor(), {
        granteePersonId: "admin",
        institutionId: "institution-1",
        role: "evidence-reviewer",
        validUntil: null,
        reasonCode: "operational-role-assignment",
        requestId: "30000000-0000-4000-8000-000000000005",
      })).rejects.toThrow("self_grant_forbidden");
      await expect(grantGovernanceRole(serviceDb, adminActor(), {
        granteePersonId: "reviewer",
        institutionId: "institution-1",
        role: "evidence-reviewer",
        validUntil: null,
        reasonCode: "membership-board-approval",
        requestId: "30000000-0000-4000-8000-000000000006",
      })).rejects.toThrow("reason_code_not_allowed");
      expect(await db.select().from(authorizationGrants)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);
    } finally {
      await client.close();
    }
  }, 30_000);
});
