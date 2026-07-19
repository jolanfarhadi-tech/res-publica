import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import * as moduleSchema from "./module-schema";
import { auditLog, people } from "./schema";
import * as coreSchema from "./schema";

const schema = { ...coreSchema, ...moduleSchema };
const temporaryDirectories: string[] = [];

async function openDatabase(dataDirectory: string) {
  const client = new PGlite(dataDirectory);
  const db = drizzle({ client, schema });
  return { client, db };
}

async function createTemporaryDatabase() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-m1-"));
  temporaryDirectories.push(directory);
  const connection = await openDatabase(directory);
  await migrate(connection.db, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { directory, ...connection };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  );
});

describe("M1 PostgreSQL-compatible persistence", () => {
  it("survives a database process restart", async () => {
    const { directory, client, db } = await createTemporaryDatabase();
    const createdAt = new Date("2026-07-19T09:00:00.000Z");

    await db.insert(people).values({
      id: "person-restart",
      name: "Restart Test",
      contact: { email: "restart@example.org" },
      locale: "de",
      rtlPreference: false,
      createdAt,
    });
    await client.close();

    const reopened = await openDatabase(directory);
    const [persisted] = await reopened.db
      .select()
      .from(people)
      .where(eq(people.id, "person-restart"));

    expect(persisted).toMatchObject({ id: "person-restart", createdAt });
    await reopened.client.close();
  }, 20_000);

  it("rolls back business state when the atomic transaction fails", async () => {
    const { client, db } = await createTemporaryDatabase();

    await expect(
      db.transaction(async (transaction) => {
        await transaction.insert(people).values({
          id: "person-rollback",
          name: "Rollback Test",
          contact: { email: "rollback@example.org" },
          locale: "en",
          rtlPreference: false,
          createdAt: new Date(),
        });
        await transaction.insert(auditLog).values({
          id: "audit-rollback",
          actorPersonId: "person-rollback",
          action: "test.rollback",
          target: "person:person-rollback",
          timestamp: new Date(),
          pseudonymized: false,
        });
        throw new Error("forced rollback");
      })
    ).rejects.toThrow("forced rollback");

    expect(await db.select().from(people).where(eq(people.id, "person-rollback"))).toEqual([]);
    expect(await db.select().from(auditLog).where(eq(auditLog.id, "audit-rollback"))).toEqual([]);
    await client.close();
  }, 20_000);

  it("rejects update and delete operations against the audit log", async () => {
    const { client, db } = await createTemporaryDatabase();
    await db.insert(people).values({
      id: "person-audit",
      name: "Audit Test",
      contact: { email: "audit@example.org" },
      locale: "fa",
      rtlPreference: true,
      createdAt: new Date(),
    });
    await db.insert(auditLog).values({
      id: "audit-immutable",
      actorPersonId: "person-audit",
      action: "test.append",
      target: "person:person-audit",
      timestamp: new Date(),
      pseudonymized: false,
    });

    const updateError = await db
      .update(auditLog)
      .set({ action: "test.mutated" })
      .where(eq(auditLog.id, "audit-immutable"))
      .then(() => null, (error: unknown) => error);
    const deleteError = await db
      .delete(auditLog)
      .where(eq(auditLog.id, "audit-immutable"))
      .then(() => null, (error: unknown) => error);

    expect(errorChain(updateError)).toContain("audit_log is append-only");
    expect(errorChain(deleteError)).toContain("audit_log is append-only");
    await client.close();
  }, 20_000);
});

function errorChain(error: unknown): string {
  const messages: string[] = [];
  let current = error;
  while (current instanceof Error) {
    messages.push(current.message);
    current = current.cause;
  }
  return messages.join("\n");
}
