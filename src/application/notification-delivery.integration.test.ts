import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import {
  consentRecords,
  notificationDeliveryAttempts,
  notifications,
  people,
} from "../persistence/schema";
import {
  DisabledNotificationProvider,
  deliverNotification,
  type NotificationDeliveryProvider,
} from "./notification-delivery";

const schema = { ...coreSchema, ...moduleSchema };

async function withDatabase(
  run: (db: Database, client: PGlite) => Promise<void>
) {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-notifications-"));
  const client = new PGlite(directory);
  const pgliteDb = drizzle({ client, schema });
  await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
  try {
    await run(pgliteDb as unknown as Database, client);
  } finally {
    await client.close();
    await rm(directory, { recursive: true, force: true });
  }
}

async function seedEventNotification(
  db: Database,
  {
    consent = true,
    notificationId = "notification-1",
  }: { consent?: boolean; notificationId?: string } = {}
) {
  const now = new Date("2026-07-29T12:00:00.000Z");
  await db.insert(people).values({
    id: "person-1",
    name: "Recipient",
    contact: { email: "recipient@example.org" },
    locale: "de",
    rtlPreference: false,
    createdAt: now,
  });
  if (consent) {
    await db.insert(consentRecords).values({
      id: "event-consent-1",
      personId: "person-1",
      purpose: "event-pii",
      grantedAt: now,
      revokedAt: null,
    });
  }
  await db.insert(notifications).values({
    id: notificationId,
    recipientPersonId: "person-1",
    channel: "email",
    template: "waitlist-promoted",
    status: "pending",
    createdAt: now,
    sentAt: null,
  });
}

function provider(
  results: Array<
    | { status: "sent"; providerMessageId?: string }
    | { status: "failed"; retryable: boolean; code: string }
  >
): NotificationDeliveryProvider {
  return {
    id: "test-provider",
    enabled: true,
    deliver: vi.fn(async () => {
      const result = results.shift();
      if (!result) throw new Error("Unexpected provider call");
      return result;
    }),
  };
}

describe("transactional notification delivery", () => {
  it("keeps the disabled provider non-delivering and mutation-free", async () => {
    await withDatabase(async (db) => {
      await seedEventNotification(db);

      await expect(
        deliverNotification(db, "notification-1", new DisabledNotificationProvider())
      ).resolves.toEqual({ status: "disabled" });

      expect(await db.select().from(notificationDeliveryAttempts)).toEqual([]);
      expect(await db.select().from(notifications)).toEqual([
        expect.objectContaining({ id: "notification-1", status: "pending" }),
      ]);
    });
  }, 30_000);

  it("requires active purpose consent before an email provider receives contact data", async () => {
    await withDatabase(async (db) => {
      await seedEventNotification(db, { consent: false });
      const deliveryProvider = provider([{ status: "sent" }]);

      await expect(
        deliverNotification(db, "notification-1", deliveryProvider)
      ).resolves.toEqual({ status: "consent_required" });

      expect(deliveryProvider.deliver).not.toHaveBeenCalled();
      expect(await db.select().from(notificationDeliveryAttempts)).toEqual([]);
      expect(await db.select().from(notifications)).toEqual([
        expect.objectContaining({ id: "notification-1", status: "pending" }),
      ]);
    });
  }, 30_000);

  it("persists an idempotent attempt and marks successful delivery", async () => {
    await withDatabase(async (db) => {
      await seedEventNotification(db);
      const deliveryProvider = provider([
        { status: "sent", providerMessageId: "provider-message-1" },
      ]);
      const deliveredAt = new Date("2026-07-29T12:05:00.000Z");

      await expect(
        deliverNotification(db, "notification-1", deliveryProvider, {
          now: deliveredAt,
        })
      ).resolves.toEqual({ status: "sent", attemptNumber: 1 });

      expect(deliveryProvider.deliver).toHaveBeenCalledWith({
        idempotencyKey: "notification-1:1",
        recipient: "recipient@example.org",
        template: "waitlist-promoted",
        locale: "de",
      });
      expect(await db.select().from(notificationDeliveryAttempts)).toEqual([
        expect.objectContaining({
          notificationId: "notification-1",
          attemptNumber: 1,
          provider: "test-provider",
          idempotencyKey: "notification-1:1",
          status: "sent",
          providerMessageId: "provider-message-1",
          errorCode: null,
        }),
      ]);
      expect(await db.select().from(notifications)).toEqual([
        expect.objectContaining({
          id: "notification-1",
          status: "sent",
          sentAt: deliveredAt,
        }),
      ]);

      await expect(
        deliverNotification(db, "notification-1", deliveryProvider)
      ).resolves.toEqual({ status: "already_final", notificationStatus: "sent" });
      expect(deliveryProvider.deliver).toHaveBeenCalledTimes(1);
      expect(await db.select().from(notificationDeliveryAttempts)).toHaveLength(1);
    });
  }, 30_000);

  it("retries a transient failure and records each bounded attempt", async () => {
    await withDatabase(async (db) => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      await seedEventNotification(db);
      const deliveryProvider = provider([
        { status: "failed", retryable: true, code: "temporary_unavailable" },
        { status: "sent" },
      ]);

      await expect(
        deliverNotification(db, "notification-1", deliveryProvider)
      ).resolves.toEqual({
        status: "retry_pending",
        attemptNumber: 1,
        errorCode: "temporary_unavailable",
      });
      await expect(
        deliverNotification(db, "notification-1", deliveryProvider)
      ).resolves.toEqual({ status: "sent", attemptNumber: 2 });

      const attempts = await db
        .select()
        .from(notificationDeliveryAttempts)
        .where(eq(notificationDeliveryAttempts.notificationId, "notification-1"));
      expect(attempts).toEqual([
        expect.objectContaining({
          attemptNumber: 1,
          status: "failed",
          errorCode: "temporary_unavailable",
        }),
        expect.objectContaining({
          attemptNumber: 2,
          status: "sent",
          errorCode: null,
        }),
      ]);

      const operationalLog = String(errorSpy.mock.calls[0]?.[0]);
      expect(operationalLog).toContain('"event":"notification.delivery_failed"');
      expect(operationalLog).toContain('"errorCode":"temporary_unavailable"');
      expect(operationalLog).not.toContain("recipient@example.org");
      expect(operationalLog).not.toContain("notification-1");
      errorSpy.mockRestore();
    });
  }, 30_000);

  it("marks a permanent provider failure final and never retries it", async () => {
    await withDatabase(async (db) => {
      await seedEventNotification(db);
      const deliveryProvider = provider([
        { status: "failed", retryable: false, code: "recipient_rejected" },
      ]);

      await expect(
        deliverNotification(db, "notification-1", deliveryProvider)
      ).resolves.toEqual({
        status: "failed",
        attemptNumber: 1,
        errorCode: "recipient_rejected",
      });
      await expect(
        deliverNotification(db, "notification-1", deliveryProvider)
      ).resolves.toEqual({
        status: "already_final",
        notificationStatus: "failed",
      });
      expect(deliveryProvider.deliver).toHaveBeenCalledTimes(1);
    });
  }, 30_000);
});
