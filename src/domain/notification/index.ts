import { z } from "zod";
import { createId, type EntityId } from "../shared";

/**
 * Notification — "a shared delivery record (channel, template, recipient
 * reference, delivery status)" replacing independent, implicit send
 * assumptions previously embedded in Events, Membership, Community, and CRM
 * (`ADR-002`, Foundation Stabilization amendment). Those modules reference
 * this one entity rather than each defining their own send/delivery
 * mechanism.
 *
 * Invariant (`CORE_DOMAIN_MODEL.md` §3a): "Created per send; append-only."
 * Enforced here by returning new objects from every status transition,
 * never mutating a notification in place.
 *
 * Governing documents: `ADR-002` (amendment); `CORE_DOMAIN_MODEL.md` §3a
 * (LOCKED, referenced only).
 */

export const NOTIFICATION_CHANNELS = ["email", "in-app"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_STATUSES = ["pending", "sent", "failed"] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

const notificationSchema = z.object({
  id: z.string(),
  recipientPersonId: z.string(),
  channel: z.enum(NOTIFICATION_CHANNELS),
  template: z.string().min(1),
  status: z.enum(NOTIFICATION_STATUSES),
  createdAt: z.date(),
  sentAt: z.date().nullable(),
});

export type Notification = z.infer<typeof notificationSchema>;

export type CreateNotificationInput = {
  recipientPersonId: EntityId;
  channel: NotificationChannel;
  template: string;
};

export function createNotification(input: CreateNotificationInput): Notification {
  const notification: Notification = {
    id: createId(),
    recipientPersonId: input.recipientPersonId,
    channel: input.channel,
    template: input.template,
    status: "pending",
    createdAt: new Date(),
    sentAt: null,
  };
  return notificationSchema.parse(notification);
}

export function markSent(notification: Notification): Notification {
  if (notification.status !== "pending") {
    throw new Error(`Cannot mark sent: notification ${notification.id} is already ${notification.status}`);
  }
  return { ...notification, status: "sent", sentAt: new Date() };
}

export function markFailed(notification: Notification): Notification {
  if (notification.status !== "pending") {
    throw new Error(`Cannot mark failed: notification ${notification.id} is already ${notification.status}`);
  }
  return { ...notification, status: "failed" };
}
