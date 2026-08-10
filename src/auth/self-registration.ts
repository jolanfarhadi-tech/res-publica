import { sql } from "drizzle-orm";
import { createId } from "../domain/shared";
import type { Database } from "../persistence";
import {
  auditLog,
  authIdentities,
  authorizationGrants,
  people,
} from "../persistence/schema";

export type SelfRegistrationClaims = {
  issuer: string;
  subject: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
};

export async function provisionSelfRegisteredIdentity(
  db: Database,
  claims: SelfRegistrationClaims,
  locale: "de" | "en" | "fa",
  now = new Date()
) {
  if (!claims.email || !claims.emailVerified) {
    throw new EmailVerificationRequiredError();
  }
  const email = normalizeEmail(claims.email);
  if (!email || !claims.issuer || !claims.subject) {
    throw new InvalidSelfRegistrationClaimsError();
  }

  const [emailMatch] = await db.select({ id: people.id }).from(people)
    .where(sql`lower(${people.contact}->>'email') = ${email}`).limit(1);
  if (emailMatch) throw new IdentityReviewRequiredError();

  const personId = createId();
  const identityId = createId();
  const submitGrantId = createId();
  const preferenceGrantId = createId();
  const academyEnrollmentGrantId = createId();
  const academyProgressGrantId = createId();
  const academyAssessmentGrantId = createId();
  const fellowshipApplicationGrantId = createId();
  const fellowshipDashboardGrantId = createId();
  const person = {
    id: personId,
    name: cleanDisplayName(claims.displayName, email),
    contact: { email },
    locale,
    rtlPreference: locale === "fa",
    createdAt: now,
  };

  await db.transaction(async (transaction) => {
    await transaction.insert(people).values(person);
    await transaction.insert(authIdentities).values({
      id: identityId,
      personId,
      issuer: claims.issuer,
      subject: claims.subject,
      linkedAt: now,
      disabledAt: null,
    });
    await transaction.insert(authorizationGrants).values([
      {
        id: submitGrantId,
        personId,
        domain: "civic",
        capability: "membership.application.submit",
        target: null,
        assuranceRequired: "verified",
        validFrom: now,
        validUntil: null,
        grantedByPersonId: personId,
        revokedAt: null,
      },
      {
        id: preferenceGrantId,
        personId,
        domain: "civic",
        capability: "research.preference.manage",
        target: null,
        assuranceRequired: "verified",
        validFrom: now,
        validUntil: null,
        grantedByPersonId: personId,
        revokedAt: null,
      },
      {
        id: academyEnrollmentGrantId,
        personId,
        domain: "civic",
        capability: "academy.enrollment.self",
        target: null,
        assuranceRequired: "verified",
        validFrom: now,
        validUntil: null,
        grantedByPersonId: personId,
        revokedAt: null,
      },
      {
        id: academyProgressGrantId,
        personId,
        domain: "civic",
        capability: "academy.progress.self",
        target: null,
        assuranceRequired: "verified",
        validFrom: now,
        validUntil: null,
        grantedByPersonId: personId,
        revokedAt: null,
      },
      {
        id: academyAssessmentGrantId,
        personId,
        domain: "civic",
        capability: "academy.assessment.submit",
        target: null,
        assuranceRequired: "verified",
        validFrom: now,
        validUntil: null,
        grantedByPersonId: personId,
        revokedAt: null,
      },
      {
        id: fellowshipApplicationGrantId,
        personId,
        domain: "civic",
        capability: "fellowship.application.self",
        target: null,
        assuranceRequired: "verified",
        validFrom: now,
        validUntil: null,
        grantedByPersonId: personId,
        revokedAt: null,
      },
      {
        id: fellowshipDashboardGrantId,
        personId,
        domain: "civic",
        capability: "fellowship.dashboard.self",
        target: null,
        assuranceRequired: "verified",
        validFrom: now,
        validUntil: null,
        grantedByPersonId: personId,
        revokedAt: null,
      },
    ]);
    await transaction.insert(auditLog).values([
      {
        id: createId(), actorPersonId: personId,
        action: "auth.identity-self-registered", target: identityId,
        timestamp: now, pseudonymized: false,
      },
      {
        id: createId(), actorPersonId: personId,
        action: "authorization.self-service-grant-created", target: submitGrantId,
        timestamp: now, pseudonymized: false,
      },
      {
        id: createId(), actorPersonId: personId,
        action: "authorization.self-service-grant-created", target: preferenceGrantId,
        timestamp: now, pseudonymized: false,
      },
      ...[
        academyEnrollmentGrantId,
        academyProgressGrantId,
        academyAssessmentGrantId,
        fellowshipApplicationGrantId,
        fellowshipDashboardGrantId,
      ].map((grantId) => ({
        id: createId(), actorPersonId: personId,
        action: "authorization.self-service-grant-created", target: grantId,
        timestamp: now, pseudonymized: false,
      })),
    ]);
  });

  return {
    person,
    identity: {
      id: identityId,
      personId,
      issuer: claims.issuer,
      subject: claims.subject,
      linkedAt: now,
      disabledAt: null,
    },
  };
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function cleanDisplayName(displayName: string | null, email: string) {
  const candidate = displayName?.trim();
  return candidate ? candidate.slice(0, 200) : email.slice(0, 200);
}

export class EmailVerificationRequiredError extends Error {}
export class IdentityReviewRequiredError extends Error {}
export class InvalidSelfRegistrationClaimsError extends Error {}
