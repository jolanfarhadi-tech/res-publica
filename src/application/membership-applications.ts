import { and, eq } from "drizzle-orm";
import { requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import {
  MEMBERSHIP_APPLICATION_PROTOCOL_VERSION,
  MEMBERSHIP_PRIVACY_NOTICE_VERSION,
  MEMBERSHIP_STATUTES_VERSION,
  RESEARCH_READINESS_STATEMENT_VERSION,
} from "../domain/membership-application/protocol";
import type { MembershipTier } from "../modules/membership/types";
import type { Database } from "../persistence";
import { auditLog, authorizationGrants, notifications, people } from "../persistence/schema";
import {
  documentAcknowledgements,
  membershipApplications,
  membershipStatusChanges,
  members,
  researchParticipationPreferences,
  researchWallets,
} from "../persistence/module-schema";

export type MembershipApplicationInput = {
  givenName: string;
  familyName: string;
  email: string;
  address: {
    line1: string;
    line2: string | null;
    postalCode: string;
    city: string;
    countryCode: string;
  };
  researchReadiness?: { willing: true; statementVersion: string };
  requestedTier: MembershipTier;
  acknowledgements: {
    statutes: { accepted: true; version: string };
    technicalProtocol: { accepted: true; version: string };
    privacyNotice: { acknowledged: true; version: string };
  };
};

export async function submitMembershipApplication(
  db: Database,
  actor: AuthenticatedActor | null,
  input: MembershipApplicationInput,
  now = new Date()
) {
  requireAuthorization(actor, {
    domain: "civic",
    capability: "membership.application.submit",
  });
  assertApplicationInput(input);

  const [person] = await db.select({
    id: people.id,
    contact: people.contact,
  }).from(people).where(eq(people.id, actor.personId)).limit(1);
  if (!person) throw new MembershipApplicantNotFoundError(actor.personId);
  if (normalizeEmail(person.contact.email) !== normalizeEmail(input.email)) {
    throw new MembershipApplicationEmailMismatchError();
  }

  const [existingApplication] = await db.select({ id: membershipApplications.id })
    .from(membershipApplications)
    .where(eq(membershipApplications.personId, actor.personId))
    .limit(1);
  if (existingApplication) throw new DuplicateMembershipApplicationError(actor.personId);

  const [existingMember] = await db.select({ id: members.id }).from(members)
    .where(eq(members.personId, actor.personId)).limit(1);
  if (existingMember) throw new ExistingMemberCannotApplyError(actor.personId);

  const application = {
    id: createId(),
    personId: actor.personId,
    requestedTier: input.requestedTier,
    status: "application_pending" as const,
    givenName: input.givenName.trim(),
    familyName: input.familyName.trim(),
    email: normalizeEmail(input.email),
    address: {
      ...input.address,
      line1: input.address.line1.trim(),
      line2: input.address.line2?.trim() || null,
      postalCode: input.address.postalCode.trim(),
      city: input.address.city.trim(),
      countryCode: input.address.countryCode.toUpperCase(),
    },
    submittedAt: now,
    decidedAt: null,
    decidedByPersonId: null,
    decisionAuditId: null,
    decisionAuditTimestamp: null,
  };

  await db.transaction(async (transaction) => {
    await transaction.insert(membershipApplications).values(application);
    await transaction.insert(documentAcknowledgements).values([
      acknowledgement(application.id, actor.personId, "statutes", input.acknowledgements.statutes.version, now),
      acknowledgement(application.id, actor.personId, "technical-protocol", input.acknowledgements.technicalProtocol.version, now),
      acknowledgement(application.id, actor.personId, "privacy-notice", input.acknowledgements.privacyNotice.version, now),
    ]);
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: "membership.application.submitted",
      target: application.id,
      timestamp: now,
      pseudonymized: false,
    });
    if (input.researchReadiness) {
      const preferenceId = createId();
      await transaction.insert(researchParticipationPreferences).values({
        id: preferenceId,
        personId: actor.personId,
        status: "willing",
        statementVersion: input.researchReadiness.statementVersion,
        recordedAt: now,
        withdrawnAt: null,
      });
      await transaction.insert(auditLog).values({
        id: createId(), actorPersonId: actor.personId,
        action: "research.preference.willing", target: preferenceId,
        timestamp: now, pseudonymized: false,
      });
    }
  });

  return application;
}

export async function decideMembershipApplication(
  db: Database,
  actor: AuthenticatedActor | null,
  applicationId: string,
  decision: "approved" | "rejected",
  now = new Date()
) {
  requireAuthorization(actor, {
    domain: "civic",
    capability: "membership.application.decide",
    target: applicationId,
    requireExactTarget: true,
    minimumAssurance: "mfa",
  });

  const [application] = await db.select().from(membershipApplications)
    .where(eq(membershipApplications.id, applicationId)).limit(1);
  if (!application) throw new MembershipApplicationNotFoundError(applicationId);
  if (application.personId === actor.personId) throw new ApplicantCannotDecideError();
  if (application.status !== "application_pending") {
    throw new MembershipApplicationAlreadyDecidedError(applicationId);
  }

  const auditId = createId();
  const memberId = decision === "approved" ? createId() : null;
  const walletId = decision === "approved" ? createId() : null;
  const notificationId = createId();

  return db.transaction(async (transaction) => {
    const [updatedApplication] = await transaction.update(membershipApplications).set({
      status: decision,
      decidedAt: now,
      decidedByPersonId: actor.personId,
      decisionAuditId: auditId,
      decisionAuditTimestamp: now,
    }).where(and(
      eq(membershipApplications.id, applicationId),
      eq(membershipApplications.status, "application_pending")
    )).returning();
    if (!updatedApplication) {
      throw new MembershipApplicationAlreadyDecidedError(applicationId);
    }

    let member = null;
    if (memberId) {
      [member] = await transaction.insert(members).values({
        id: memberId,
        personId: application.personId,
        tier: application.requestedTier,
        status: "verified",
        createdAt: now,
      }).returning();
      await transaction.insert(membershipStatusChanges).values({
        id: createId(),
        memberId,
        previousStatus: "registered",
        currentStatus: "verified",
        triggeringActivity: "board-application-approval",
        timestamp: now,
      });
      if (!walletId) throw new Error("Approved membership requires a wallet offer identifier");
      await transaction.insert(researchWallets).values({
        id: walletId,
        personId: application.personId,
        status: "offered",
        protocolProfile: "w3c-vc-bbs-2023-v1",
        createdAt: now,
        activatedAt: null,
        suspendedAt: null,
        revokedAt: null,
      });
      const walletGrantId = createId();
      const credentialGrantId = createId();
      const recoveryGrantId = createId();
      await transaction.insert(authorizationGrants).values({
        id: walletGrantId,
        personId: application.personId,
        domain: "civic",
        capability: "research.wallet.activate",
        target: walletId,
        assuranceRequired: "verified",
        validFrom: now,
        validUntil: null,
        grantedByPersonId: actor.personId,
        revokedAt: null,
      });
      await transaction.insert(authorizationGrants).values([
        {
          id: credentialGrantId, personId: application.personId,
          domain: "civic", capability: "research.wallet.credential.issue",
          target: walletId, assuranceRequired: "verified",
          validFrom: now, validUntil: null,
          grantedByPersonId: actor.personId, revokedAt: null,
        },
        {
          id: recoveryGrantId, personId: application.personId,
          domain: "civic", capability: "research.wallet.recover",
          target: walletId, assuranceRequired: "mfa",
          validFrom: now, validUntil: null,
          grantedByPersonId: actor.personId, revokedAt: null,
        },
      ]);
      await transaction.insert(auditLog).values([
        {
          id: createId(), actorPersonId: actor.personId,
          action: "research.wallet.offered", target: walletId,
          timestamp: now, pseudonymized: false,
        },
        {
          id: createId(), actorPersonId: actor.personId,
          action: "authorization.wallet-activation-grant-created", target: walletGrantId,
          timestamp: now, pseudonymized: false,
        },
        {
          id: createId(), actorPersonId: actor.personId,
          action: "authorization.wallet-credential-grant-created", target: credentialGrantId,
          timestamp: now, pseudonymized: false,
        },
        {
          id: createId(), actorPersonId: actor.personId,
          action: "authorization.wallet-recovery-grant-created", target: recoveryGrantId,
          timestamp: now, pseudonymized: false,
        },
      ]);
    }

    await transaction.insert(notifications).values({
      id: notificationId,
      recipientPersonId: application.personId,
      channel: "email",
      template: `membership-application-${decision}`,
      status: "pending",
      createdAt: now,
      sentAt: null,
    });
    await transaction.insert(auditLog).values({
      id: auditId,
      actorPersonId: actor.personId,
      action: `membership.application.${decision}`,
      target: applicationId,
      timestamp: now,
      pseudonymized: false,
    });
    return { application: updatedApplication, member, walletId };
  });
}

export async function getSelfMembershipApplication(
  db: Database,
  actor: AuthenticatedActor | null
) {
  if (!actor) throw new MembershipApplicationAuthenticationError();
  const [application] = await db.select({
    id: membershipApplications.id,
    requestedTier: membershipApplications.requestedTier,
    status: membershipApplications.status,
    submittedAt: membershipApplications.submittedAt,
    decidedAt: membershipApplications.decidedAt,
  }).from(membershipApplications)
    .where(eq(membershipApplications.personId, actor.personId))
    .limit(1);
  return application ?? null;
}

function acknowledgement(
  contextId: string,
  personId: string,
  documentType: "statutes" | "technical-protocol" | "privacy-notice",
  documentVersion: string,
  acknowledgedAt: Date
) {
  return {
    id: createId(),
    personId,
    contextType: "membership-application" as const,
    contextId,
    documentType,
    documentVersion,
    acknowledgedAt,
  };
}

function assertApplicationInput(input: MembershipApplicationInput) {
  const required = [
    input.givenName,
    input.familyName,
    input.email,
    input.address.line1,
    input.address.postalCode,
    input.address.city,
    input.address.countryCode,
    input.acknowledgements.statutes.version,
    input.acknowledgements.technicalProtocol.version,
    input.acknowledgements.privacyNotice.version,
  ];
  if (required.some((value) => !value.trim())) throw new InvalidMembershipApplicationError();
  if (input.acknowledgements.technicalProtocol.version !== MEMBERSHIP_APPLICATION_PROTOCOL_VERSION ||
    input.acknowledgements.statutes.version !== MEMBERSHIP_STATUTES_VERSION ||
    input.acknowledgements.privacyNotice.version !== MEMBERSHIP_PRIVACY_NOTICE_VERSION ||
    (input.researchReadiness &&
      input.researchReadiness.statementVersion !== RESEARCH_READINESS_STATEMENT_VERSION)) {
    throw new InvalidMembershipApplicationError();
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export class InvalidMembershipApplicationError extends Error {}
export class MembershipApplicantNotFoundError extends Error {}
export class MembershipApplicationEmailMismatchError extends Error {}
export class DuplicateMembershipApplicationError extends Error {}
export class ExistingMemberCannotApplyError extends Error {}
export class MembershipApplicationNotFoundError extends Error {}
export class MembershipApplicationAlreadyDecidedError extends Error {}
export class ApplicantCannotDecideError extends Error {}
export class MembershipApplicationAuthenticationError extends Error {}
