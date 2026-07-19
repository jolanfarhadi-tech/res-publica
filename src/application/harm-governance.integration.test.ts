import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, organizations, people } from "../persistence/schema";
import type { Database } from "../persistence";
import type { AuthenticatedActor } from "../auth/types";
import { governanceCapability } from "../modules/harm-governance/authority";
import { addHarmEvidence, recordBasicValidation, registerHarmCase, submitCaseForValidation } from "./harm-governance";

const directories: string[] = [];
afterEach(async () => Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))));

function actor(personId: string, role: "intake-moderator" | "validation-officer"): AuthenticatedActor {
  return { personId, sessionId: `session-${personId}`, authenticatedAt: new Date(), assurance: "mfa", grants: [{
    id: `grant-${personId}`, personId, domain: "governance", capability: governanceCapability(role),
    target: "institution-1", assuranceRequired: "mfa", validFrom: new Date(0), validUntil: null, revokedAt: null,
  }] };
}

describe("HARM application lifecycle", () => {
  it("persists scoped human intake and validation with audit evidence", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-harm-"));
    directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    const serviceDb = db as unknown as Database;
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const now = new Date();
    await db.insert(organizations).values({ id: "institution-1", name: "Institution", relationshipTypes: ["partner"], createdAt: now });
    await db.insert(people).values([
      { id: "intake-1", name: "Intake", contact: { email: "intake@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "validator-1", name: "Validator", contact: { email: "validator@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);
    const harmCase = await registerHarmCase(serviceDb, actor("intake-1", "intake-moderator"), {
      institutionId: "institution-1", location: "Berlin", harmCategory: "procedural-failure",
      description: "Documented account", affectedGroups: ["residents"], allegedResponsibleActors: [],
      sourceType: "citizen", reporterPersonId: null, confidentialityLevel: "restricted",
    });
    await addHarmEvidence(serviceDb, actor("intake-1", "intake-moderator"), {
      caseId: harmCase.id, description: "Document", source: "reporter", mediaType: "text/plain", storageReference: "restricted://evidence/1",
    });
    await submitCaseForValidation(serviceDb, actor("intake-1", "intake-moderator"), harmCase.id);
    const result = await recordBasicValidation(serviceDb, actor("validator-1", "validation-officer"), {
      caseId: harmCase.id, status: "valid", missingInformation: [], duplicateOfCaseId: null, notes: "Complete",
    });
    expect(result.harmCase.status).toBe("hearing-ready");
    expect(result.decision.reviewerPersonId).toBe("validator-1");
    const actions = (await db.select().from(auditLog)).map((entry) => entry.action);
    expect(actions).toEqual(expect.arrayContaining([
      "governance.harm-case-registered", "governance.evidence-added",
      "governance.case-submitted-for-validation", "governance.basic-validation-recorded",
    ]));
    await client.close();
  }, 20_000);
});
