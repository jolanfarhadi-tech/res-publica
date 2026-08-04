import { desc, eq } from "drizzle-orm";
import { isAuthorized } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import { consentRecords, notifications, payments } from "../persistence/schema";
import { events, registrations } from "../persistence/module-schema";
import { getSelfMemberProfile } from "./member-profile";

export async function getSelfDashboard(
  db: Database,
  actor: AuthenticatedActor | null,
  now = new Date()
) {
  if (!actor) throw new DashboardAuthenticationError();

  const [
    membership,
    consents,
    selfPayments,
    eventRegistrations,
    recipientNotifications,
  ] =
    await Promise.all([
      getSelfMemberProfile(db, actor),
      db
        .select({
          id: consentRecords.id,
          purpose: consentRecords.purpose,
          grantedAt: consentRecords.grantedAt,
          revokedAt: consentRecords.revokedAt,
        })
        .from(consentRecords)
        .where(eq(consentRecords.personId, actor.personId))
        .orderBy(desc(consentRecords.grantedAt)),
      db
        .select({
          id: payments.id,
          amount: payments.amount,
          currency: payments.currency,
          purpose: payments.purpose,
          status: payments.status,
          createdAt: payments.createdAt,
          settledAt: payments.settledAt,
        })
        .from(payments)
        .where(eq(payments.payerId, actor.personId))
        .orderBy(desc(payments.createdAt)),
      db
        .select({
          id: registrations.id,
          eventId: registrations.eventId,
          title: events.title,
          location: events.location,
          startTime: events.startTime,
          endTime: events.endTime,
          status: registrations.status,
          registeredAt: registrations.registeredAt,
        })
        .from(registrations)
        .innerJoin(events, eq(registrations.eventId, events.id))
        .where(eq(registrations.personId, actor.personId))
        .orderBy(desc(events.startTime)),
      db
        .select({
          id: notifications.id,
          channel: notifications.channel,
          template: notifications.template,
          status: notifications.status,
          createdAt: notifications.createdAt,
          sentAt: notifications.sentAt,
        })
        .from(notifications)
        .where(eq(notifications.recipientPersonId, actor.personId))
        .orderBy(desc(notifications.createdAt)),
    ]);

  const registerForEvents = actor.grants.some(
    (grant) =>
      grant.domain === "civic" &&
      grant.capability === "events.register" &&
      isAuthorized(actor, {
        domain: "civic",
        capability: "events.register",
        target: grant.target ?? undefined,
        now,
      })
  );

  return {
    account: {
      status: "authenticated" as const,
      assurance: actor.assurance,
      authenticatedAt: actor.authenticatedAt,
    },
    membership,
    consents,
    payments: selfPayments,
    eventRegistrations,
    notifications: recipientNotifications,
    permittedActions: {
      viewProfile: true,
      applyForMembership: !membership.enrolled,
      registerForEvents,
      // ADR-034 and the absent ADR-035 keep consent mutation unavailable.
      manageConsent: false,
    },
  };
}

export class DashboardAuthenticationError extends Error {
  constructor() {
    super("A verified session is required");
    this.name = "DashboardAuthenticationError";
  }
}
