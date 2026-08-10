import { and, desc, eq, isNull, lte } from "drizzle-orm";
import { createId } from "../domain/shared";
import type { Database } from "../persistence";
import { logOperationalFailure } from "../platform/request-context";
import {
  consentRecords,
  notificationDeliveryAttempts,
  notifications,
  people,
} from "../persistence/schema";

const MAX_DELIVERY_ATTEMPTS = 3;
const SAFE_ERROR_CODE = /^[a-z0-9_]{1,64}$/;
const EVENT_EMAIL_TEMPLATES = new Set([
  "waitlist-promoted",
  "event-outcome-published",
]);

export type NotificationDeliveryRequest = {
  idempotencyKey: string;
  recipient: string;
  template: string;
  locale: "de" | "en" | "fa";
};

export type NotificationDeliveryResult =
  | { status: "sent"; providerMessageId?: string }
  | { status: "failed"; retryable: boolean; code: string };

export type NotificationDeliveryProvider = {
  readonly id: string;
  readonly enabled: boolean;
  deliver(
    request: NotificationDeliveryRequest
  ): Promise<NotificationDeliveryResult>;
};

export class DisabledNotificationProvider
  implements NotificationDeliveryProvider
{
  readonly id = "disabled";
  readonly enabled = false;

  async deliver(): Promise<NotificationDeliveryResult> {
    throw new Error("The disabled notification provider cannot deliver");
  }
}

type DeliveryOptions = {
  now?: Date;
  maxAttempts?: number;
};

function normalizeErrorCode(code: string): string {
  return SAFE_ERROR_CODE.test(code) ? code : "provider_error";
}

function requiredConsentPurpose(template: string): "event-pii" | null {
  return EVENT_EMAIL_TEMPLATES.has(template) ? "event-pii" : null;
}

export async function deliverNotification(
  db: Database,
  notificationId: string,
  provider: NotificationDeliveryProvider,
  options: DeliveryOptions = {}
) {
  if (!provider.enabled) return { status: "disabled" as const };

  const now = options.now ?? new Date();
  const maxAttempts = options.maxAttempts ?? MAX_DELIVERY_ATTEMPTS;

  const outcome = await db.transaction(async (transaction) => {
    const [row] = await transaction
      .select({
        notification: notifications,
        contact: people.contact,
        locale: people.locale,
      })
      .from(notifications)
      .innerJoin(people, eq(notifications.recipientPersonId, people.id))
      .where(eq(notifications.id, notificationId))
      .for("update");

    if (!row) return { status: "not_found" as const };
    if (row.notification.status !== "pending") {
      return {
        status: "already_final" as const,
        notificationStatus: row.notification.status,
      };
    }
    if (row.notification.channel !== "email") {
      return { status: "unsupported_channel" as const };
    }

    const consentPurpose = requiredConsentPurpose(row.notification.template);
    if (!consentPurpose) return { status: "consent_required" as const };

    const [activeConsent] = await transaction
      .select({ id: consentRecords.id })
      .from(consentRecords)
      .where(
        and(
          eq(consentRecords.personId, row.notification.recipientPersonId),
          eq(consentRecords.purpose, consentPurpose),
          lte(consentRecords.grantedAt, now),
          isNull(consentRecords.revokedAt)
        )
      )
      .limit(1);
    if (!activeConsent) return { status: "consent_required" as const };

    const [latestAttempt] = await transaction
      .select({ attemptNumber: notificationDeliveryAttempts.attemptNumber })
      .from(notificationDeliveryAttempts)
      .where(
        eq(notificationDeliveryAttempts.notificationId, row.notification.id)
      )
      .orderBy(desc(notificationDeliveryAttempts.attemptNumber))
      .limit(1);
    const attemptNumber = (latestAttempt?.attemptNumber ?? 0) + 1;

    if (attemptNumber > maxAttempts) {
      await transaction
        .update(notifications)
        .set({ status: "failed" })
        .where(eq(notifications.id, row.notification.id));
      return { status: "attempts_exhausted" as const };
    }

    const idempotencyKey = `${row.notification.id}:${attemptNumber}`;
    const attemptId = createId();
    await transaction.insert(notificationDeliveryAttempts).values({
      id: attemptId,
      notificationId: row.notification.id,
      attemptNumber,
      provider: provider.id,
      idempotencyKey,
      status: "started",
      retryable: null,
      providerMessageId: null,
      errorCode: null,
      startedAt: now,
      completedAt: null,
    });

    let result: NotificationDeliveryResult;
    try {
      result = await provider.deliver({
        idempotencyKey,
        recipient: row.contact.email,
        template: row.notification.template,
        locale: row.locale,
      });
    } catch {
      result = {
        status: "failed",
        retryable: true,
        code: "provider_unavailable",
      };
    }

    if (result.status === "sent") {
      await transaction
        .update(notificationDeliveryAttempts)
        .set({
          status: "sent",
          retryable: false,
          providerMessageId: result.providerMessageId?.slice(0, 255) ?? null,
          completedAt: now,
        })
        .where(eq(notificationDeliveryAttempts.id, attemptId));
      await transaction
        .update(notifications)
        .set({ status: "sent", sentAt: now })
        .where(eq(notifications.id, row.notification.id));
      return { status: "sent" as const, attemptNumber };
    }

    const errorCode = normalizeErrorCode(result.code);
    const retryable = result.retryable && attemptNumber < maxAttempts;
    await transaction
      .update(notificationDeliveryAttempts)
      .set({
        status: "failed",
        retryable,
        errorCode,
        completedAt: now,
      })
      .where(eq(notificationDeliveryAttempts.id, attemptId));

    if (!retryable) {
      await transaction
        .update(notifications)
        .set({ status: "failed" })
        .where(eq(notifications.id, row.notification.id));
      return {
        status: "failed" as const,
        attemptNumber,
        errorCode,
      };
    }

    return {
      status: "retry_pending" as const,
      attemptNumber,
      errorCode,
    };
  });

  if (
    outcome.status === "retry_pending" ||
    outcome.status === "failed" ||
    outcome.status === "attempts_exhausted"
  ) {
    logOperationalFailure({
      event: "notification.delivery_failed",
      dependency: "notification-provider",
      status: outcome.status === "retry_pending" ? 503 : 500,
      attemptNumber:
        "attemptNumber" in outcome ? outcome.attemptNumber : maxAttempts,
      retryable: outcome.status === "retry_pending",
      errorCode:
        "errorCode" in outcome ? outcome.errorCode : "attempts_exhausted",
    });
  }

  return outcome;
}
