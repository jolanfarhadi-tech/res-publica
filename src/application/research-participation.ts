import { and, eq } from "drizzle-orm";
import { requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import type { Database } from "../persistence";
import { auditLog } from "../persistence/schema";
import {
  members,
  projectEligibilityRecords,
  projectResearchConsents,
  researchParticipationPreferences,
} from "../persistence/module-schema";

export async function setResearchParticipationPreference(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { willing: boolean; statementVersion: string },
  now = new Date()
) {
  requireAuthorization(actor, {
    domain: "civic",
    capability: "research.preference.manage",
  });
  if (!input.statementVersion.trim()) throw new InvalidResearchPreferenceError();
  const [existing] = await db.select().from(researchParticipationPreferences)
    .where(eq(researchParticipationPreferences.personId, actor.personId)).limit(1);
  const status = input.willing
    ? "willing" as const
    : existing?.status === "willing" ? "withdrawn" as const : "declined" as const;

  return db.transaction(async (transaction) => {
    const [preference] = await transaction.insert(researchParticipationPreferences).values({
      id: existing?.id ?? createId(),
      personId: actor.personId,
      status,
      statementVersion: input.statementVersion,
      recordedAt: now,
      withdrawnAt: status === "withdrawn" ? now : null,
    }).onConflictDoUpdate({
      target: researchParticipationPreferences.personId,
      set: {
        status,
        statementVersion: input.statementVersion,
        recordedAt: now,
        withdrawnAt: status === "withdrawn" ? now : null,
      },
    }).returning();
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: `research.preference.${status}`, target: preference.id,
      timestamp: now, pseudonymized: false,
    });
    return preference;
  });
}

export type ProjectResearchConsentInput = {
  projectRef: string;
  purposeVersion: string;
  purpose: string;
  dataCategories: string[];
  pseudonymization: string;
  recipients: string[];
  retentionRule: string;
};

export async function recordProjectResearchConsent(
  db: Database,
  actor: AuthenticatedActor | null,
  input: ProjectResearchConsentInput,
  now = new Date()
) {
  requireAuthorization(actor, {
    domain: "civic",
    capability: "research.project-consent.manage",
    target: input.projectRef,
    requireExactTarget: true,
  });
  assertProjectConsent(input);
  await requireVerifiedMember(db, actor.personId);
  const consent = {
    id: createId(), personId: actor.personId,
    ...input, status: "granted" as const, grantedAt: now, withdrawnAt: null,
  };
  await db.transaction(async (transaction) => {
    await transaction.insert(projectResearchConsents).values(consent);
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "research.project-consent.granted", target: consent.id,
      timestamp: now, pseudonymized: false,
    });
  });
  return consent;
}

export async function withdrawProjectResearchConsent(
  db: Database,
  actor: AuthenticatedActor | null,
  consentId: string,
  now = new Date()
) {
  const [consent] = await db.select().from(projectResearchConsents)
    .where(and(
      eq(projectResearchConsents.id, consentId),
      actor ? eq(projectResearchConsents.personId, actor.personId) : eq(projectResearchConsents.id, "")
    )).limit(1);
  if (!consent) throw new ProjectResearchConsentNotFoundError(consentId);
  requireAuthorization(actor, {
    domain: "civic",
    capability: "research.project-consent.manage",
    target: consent.projectRef,
    requireExactTarget: true,
  });
  if (consent.status !== "granted") throw new ProjectResearchConsentAlreadyWithdrawnError(consentId);

  return db.transaction(async (transaction) => {
    const [withdrawn] = await transaction.update(projectResearchConsents).set({
      status: "withdrawn", withdrawnAt: now,
    }).where(eq(projectResearchConsents.id, consentId)).returning();
    await transaction.update(projectEligibilityRecords).set({
      status: "ineligible",
      reasonCode: "project-consent-withdrawn",
      assessedAt: now,
      assessedByPersonId: actor.personId,
    }).where(eq(projectEligibilityRecords.projectConsentId, consentId));
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "research.project-consent.withdrawn", target: consentId,
      timestamp: now, pseudonymized: false,
    });
    return withdrawn;
  });
}

export type ProjectEligibilityInput = {
  personId: string;
  projectRef: string;
  status: "pending" | "eligible" | "ineligible" | "excluded";
  basis: "no-consent-required" | "fully-anonymized" | "general-research-readiness" |
    "project-specific-consent" | "other-reviewed-lawful-basis";
  projectConsentId: string | null;
  reasonCode: string;
};

export async function assessProjectEligibility(
  db: Database,
  actor: AuthenticatedActor | null,
  input: ProjectEligibilityInput,
  now = new Date()
) {
  requireAuthorization(actor, {
    domain: "civic",
    capability: "research.project-eligibility.assess",
    target: input.projectRef,
    requireExactTarget: true,
    minimumAssurance: "mfa",
  });
  if (!input.projectRef || !input.reasonCode) throw new InvalidProjectEligibilityError();
  await requireVerifiedMember(db, input.personId);
  if (input.basis === "project-specific-consent") {
    if (!input.projectConsentId) throw new InvalidProjectEligibilityError();
    const [consent] = await db.select({ id: projectResearchConsents.id })
      .from(projectResearchConsents).where(and(
        eq(projectResearchConsents.id, input.projectConsentId),
        eq(projectResearchConsents.personId, input.personId),
        eq(projectResearchConsents.projectRef, input.projectRef),
        eq(projectResearchConsents.status, "granted")
      )).limit(1);
    if (!consent) throw new InvalidProjectEligibilityError();
  } else if (input.projectConsentId) {
    throw new InvalidProjectEligibilityError();
  }

  const record = {
    id: createId(), ...input, assessedAt: now, assessedByPersonId: actor.personId,
  };
  return db.transaction(async (transaction) => {
    const [persisted] = await transaction.insert(projectEligibilityRecords).values(record)
      .onConflictDoUpdate({
        target: [projectEligibilityRecords.personId, projectEligibilityRecords.projectRef],
        set: {
          status: input.status, basis: input.basis,
          projectConsentId: input.projectConsentId, reasonCode: input.reasonCode,
          assessedAt: now, assessedByPersonId: actor.personId,
        },
      }).returning();
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "research.project-eligibility.assessed", target: persisted.id,
      timestamp: now, pseudonymized: false,
    });
    return persisted;
  });
}

async function requireVerifiedMember(db: Database, personId: string) {
  const [member] = await db.select({ status: members.status }).from(members)
    .where(eq(members.personId, personId)).limit(1);
  if (!member || !["verified", "active"].includes(member.status)) {
    throw new VerifiedMembershipRequiredError();
  }
}

function assertProjectConsent(input: ProjectResearchConsentInput) {
  if (!input.projectRef.trim() || !input.purposeVersion.trim() || !input.purpose.trim() ||
    input.dataCategories.length === 0 || !input.pseudonymization.trim() ||
    input.recipients.length === 0 || !input.retentionRule.trim()) {
    throw new InvalidProjectResearchConsentError();
  }
}

export class InvalidResearchPreferenceError extends Error {}
export class InvalidProjectResearchConsentError extends Error {}
export class ProjectResearchConsentNotFoundError extends Error {}
export class ProjectResearchConsentAlreadyWithdrawnError extends Error {}
export class InvalidProjectEligibilityError extends Error {}
export class VerifiedMembershipRequiredError extends Error {}
