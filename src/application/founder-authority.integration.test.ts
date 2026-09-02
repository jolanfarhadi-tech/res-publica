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
import { governanceCapability } from "../modules/harm-governance/authority";
import { editorialCapability } from "../modules/publishing/authority";
import {
  FounderAuthorityAppointmentError,
  recordFounderAuthorityAppointment,
} from "./founder-authority";

const directories: string[] = [];
const now = new Date("2026-08-25T10:00:00.000Z");

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  );
});

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-founder-authority-"));
  directories.push(directory);
  const client = new PGlite(directory);
  const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  await db.insert(people).values([
    {
      id: "approval-authority",
      name: "Approval Authority",
      contact: { email: "approval@example.org" },
      locale: "de",
      rtlPreference: false,
      createdAt: now,
    },
    {
      id: "operator",
      name: "Operator",
      contact: { email: "operator@example.org" },
      locale: "de",
      rtlPreference: false,
      createdAt: now,
    },
  ]);
  await db.insert(authIdentities).values([
    {
      id: "identity-approval",
      personId: "approval-authority",
      issuer: "https://issuer.example/",
      subject: "approval-subject",
      linkedAt: now,
      disabledAt: null,
    },
    {
      id: "identity-operator",
      personId: "operator",
      issuer: "https://issuer.example/",
      subject: "operator-subject",
      linkedAt: now,
      disabledAt: null,
    },
  ]);
  return { client, db, serviceDb: db as unknown as Database };
}

function appointment(
  authority: "institution-admin" | "publisher" = "institution-admin"
) {
  return {
    approvalAuthority: {
      issuer: "https://issuer.example/",
      subject: "approval-subject",
    },
    appointee: {
      issuer: "https://issuer.example/",
      subject: "operator-subject",
    },
    authority,
    target: authority === "publisher" ? "website" : "institution-1",
    validUntil: null,
    approvalRequestId: "90000000-0000-4000-8000-000000000001",
  } as const;
}

describe("externally approved foundational authority appointment", () => {
  it.each([
    ["institution-admin" as const, "governance", governanceCapability("institution-admin"), "governance.institution-admin-appointed"],
    ["publisher" as const, "civic", editorialCapability("publisher"), "publishing.publisher-appointed"],
  ])("persists %s and its canonical audit record atomically", async (
    authority,
    domain,
    capability,
    action
  ) => {
    const { client, db, serviceDb } = await database();
    try {
      const grant = await recordFounderAuthorityAppointment(
        serviceDb,
        appointment(authority),
        now
      );

      expect(grant).toMatchObject({
        personId: "operator",
        domain,
        capability,
        target: authority === "publisher" ? "website" : "institution-1",
        assuranceRequired: "mfa",
        grantedByPersonId: "approval-authority",
      });
      expect(await db.select().from(authorizationGrants)).toEqual([
        expect.objectContaining({ id: grant.id, revokedAt: null }),
      ]);
      expect(await db.select().from(auditLog)).toEqual([
        expect.objectContaining({
          actorPersonId: "approval-authority",
          action,
          target: `authorization-grant:${grant.id}`,
          sessionId: null,
          requestId: "90000000-0000-4000-8000-000000000001",
          capability,
          reasonCode: "founder-authority-appointment",
        }),
      ]);
      expect(JSON.stringify(await db.select().from(auditLog))).not.toContain(
        "approval-subject"
      );
      expect(JSON.stringify(await db.select().from(auditLog))).not.toContain(
        "operator-subject"
      );
    } finally {
      await client.close();
    }
  }, 30_000);

  it("rejects self-appointment, invalid approval evidence and duplicate active authority without mutation", async () => {
    const { client, db, serviceDb } = await database();
    try {
      await expect(
        recordFounderAuthorityAppointment(serviceDb, {
          ...appointment(),
          appointee: appointment().approvalAuthority,
        }, now)
      ).rejects.toMatchObject({
        code: "self_appointment_forbidden",
      });
      await expect(
        recordFounderAuthorityAppointment(serviceDb, {
          ...appointment(),
          approvalRequestId: "not-an-approved-request-id",
        }, now)
      ).rejects.toThrow("invalid_request_id");

      await recordFounderAuthorityAppointment(serviceDb, appointment(), now);
      const before = {
        grants: await db.select().from(authorizationGrants),
        audit: await db.select().from(auditLog),
      };
      await expect(
        recordFounderAuthorityAppointment(serviceDb, appointment(), now)
      ).rejects.toMatchObject({
        code: "authority_already_active",
      });
      expect(await db.select().from(authorizationGrants)).toEqual(before.grants);
      expect(await db.select().from(auditLog)).toEqual(before.audit);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("rejects an unknown or disabled identity and a past expiry without mutation", async () => {
    const { client, db, serviceDb } = await database();
    try {
      await expect(
        recordFounderAuthorityAppointment(serviceDb, {
          ...appointment(),
          appointee: {
            issuer: "https://issuer.example/",
            subject: "missing-subject",
          },
        }, now)
      ).rejects.toMatchObject({
        code: "appointee_identity_not_found",
      });

      await db.update(authIdentities).set({ disabledAt: now });
      await expect(
        recordFounderAuthorityAppointment(serviceDb, appointment(), now)
      ).rejects.toMatchObject({
        code: "approval_authority_identity_not_found",
      });
      await expect(
        recordFounderAuthorityAppointment(serviceDb, {
          ...appointment(),
          validUntil: new Date(now.getTime() - 1),
        }, now)
      ).rejects.toBeInstanceOf(FounderAuthorityAppointmentError);
      expect(await db.select().from(authorizationGrants)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(0);
    } finally {
      await client.close();
    }
  }, 30_000);
});
