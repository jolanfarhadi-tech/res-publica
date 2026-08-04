import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import { AuthorizationDeniedError } from "../auth/authorize";
import type { AuthenticatedActor, AuthorizationGrant } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, authorizationGrants, consentRecords, notifications, people } from "../persistence/schema";
import {
  documentAcknowledgements,
  membershipApplications,
  membershipStatusChanges,
  members,
  projectEligibilityRecords,
  projectResearchConsents,
  researchParticipationPreferences,
  researchWallets,
} from "../persistence/module-schema";
import {
  ApplicantCannotDecideError,
  decideMembershipApplication,
  DuplicateMembershipApplicationError,
  submitMembershipApplication,
} from "./membership-applications";
import {
  assessProjectEligibility,
  recordProjectResearchConsent,
  setResearchParticipationPreference,
  withdrawProjectResearchConsent,
} from "./research-participation";

const schema = { ...coreSchema, ...moduleSchema };
const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })
  ));
});

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-membership-application-"));
  directories.push(directory);
  const client = new PGlite(directory);
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { client, db: db as unknown as Database };
}

function grant(
  personId: string,
  capability: string,
  target: string | null,
  assuranceRequired: "verified" | "mfa" = "verified"
): AuthorizationGrant {
  return {
    id: `grant-${personId}-${capability}-${target ?? "global"}`,
    personId,
    domain: "civic",
    capability,
    target,
    assuranceRequired,
    validFrom: new Date("2026-08-01T00:00:00.000Z"),
    validUntil: null,
    revokedAt: null,
  };
}

function actor(
  personId: string,
  assurance: "verified" | "mfa" = "verified",
  grants: AuthorizationGrant[] = []
): AuthenticatedActor {
  return {
    personId,
    sessionId: `session-${personId}`,
    authenticatedAt: new Date("2026-08-04T09:00:00.000Z"),
    assurance,
    grants,
  };
}

const applicationInput = {
  givenName: "Ada",
  familyName: "Lovelace",
  email: "ada@example.org",
  address: {
    line1: "Beispielstraße 1",
    line2: null,
    postalCode: "10115",
    city: "Berlin",
    countryCode: "DE",
  },
  requestedTier: "basic",
  acknowledgements: {
    statutes: { accepted: true, version: "signed-sha256-6f2882ae0dff" },
    technicalProtocol: {
      accepted: true,
      version: "membership-application-protocol-v1",
    },
    privacyNotice: { acknowledged: true, version: "public-sha256-1dff06d9cd53" },
  },
} as const;

async function seedPeople(db: Database) {
  await db.insert(people).values([
    {
      id: "person-applicant",
      name: "Ada Lovelace",
      contact: { email: "ada@example.org" },
      locale: "de",
      rtlPreference: false,
      createdAt: new Date("2026-08-04T08:00:00.000Z"),
    },
    {
      id: "person-board",
      name: "Board Reviewer",
      contact: { email: "board@example.org" },
      locale: "de",
      rtlPreference: false,
      createdAt: new Date("2026-08-04T08:00:00.000Z"),
    },
  ]);
}

describe("membership application protocol", () => {
  it("submits a pending application without creating membership or requiring research consent", async () => {
    const { client, db } = await database();
    try {
      await seedPeople(db);
      const applicant = actor("person-applicant", "verified", [
        grant("person-applicant", "membership.application.submit", null),
      ]);

      const application = await submitMembershipApplication(
        db,
        applicant,
        applicationInput,
        new Date("2026-08-04T10:00:00.000Z")
      );

      expect(application.status).toBe("application_pending");
      expect(await db.select().from(members)).toHaveLength(0);
      expect(await db.select().from(consentRecords)).toHaveLength(0);
      expect(await db.select().from(researchParticipationPreferences)).toHaveLength(0);
      expect(await db.select().from(documentAcknowledgements)).toEqual([
        expect.objectContaining({ documentType: "statutes", documentVersion: "signed-sha256-6f2882ae0dff" }),
        expect.objectContaining({ documentType: "technical-protocol", documentVersion: "membership-application-protocol-v1" }),
        expect.objectContaining({ documentType: "privacy-notice", documentVersion: "public-sha256-1dff06d9cd53" }),
      ]);
      expect((await db.select().from(auditLog)).map((row) => row.action)).toEqual([
        "membership.application.submitted",
      ]);

      await expect(
        submitMembershipApplication(db, applicant, applicationInput)
      ).rejects.toBeInstanceOf(DuplicateMembershipApplicationError);
      expect(await db.select().from(membershipApplications)).toHaveLength(1);
      expect(await db.select().from(auditLog)).toHaveLength(1);
    } finally {
      await client.close();
    }
  }, 30_000);

  it("requires MFA, exact capability scope, and applicant/reviewer separation", async () => {
    const { client, db } = await database();
    try {
      await seedPeople(db);
      const applicant = actor("person-applicant", "verified", [
        grant("person-applicant", "membership.application.submit", null),
      ]);
      const application = await submitMembershipApplication(db, applicant, applicationInput);
      const wrongTargetGrant = grant(
        "person-board",
        "membership.application.decide",
        "application-other",
        "mfa"
      );

      await expect(decideMembershipApplication(
        db,
        actor("person-board", "verified", [{ ...wrongTargetGrant, target: application.id }]),
        application.id,
        "approved"
      )).rejects.toBeInstanceOf(AuthorizationDeniedError);
      await expect(decideMembershipApplication(
        db,
        actor("person-board", "mfa", [wrongTargetGrant]),
        application.id,
        "approved"
      )).rejects.toBeInstanceOf(AuthorizationDeniedError);
      await expect(decideMembershipApplication(
        db,
        actor("person-applicant", "mfa", [
          grant("person-applicant", "membership.application.decide", application.id, "mfa"),
        ]),
        application.id,
        "approved"
      )).rejects.toBeInstanceOf(ApplicantCannotDecideError);

      expect(await db.select().from(members)).toHaveLength(0);
      expect(await db.select().from(notifications)).toHaveLength(0);
      expect(await db.select().from(membershipStatusChanges)).toHaveLength(0);
      expect(await db.select().from(auditLog)).toHaveLength(1);
      expect((await db.select().from(membershipApplications))[0]).toMatchObject({
        status: "application_pending",
        decidedAt: null,
        decidedByPersonId: null,
      });
    } finally {
      await client.close();
    }
  }, 30_000);

  it("approves atomically and creates verified membership with decision evidence", async () => {
    const { client, db } = await database();
    try {
      await seedPeople(db);
      const applicant = actor("person-applicant", "verified", [
        grant("person-applicant", "membership.application.submit", null),
      ]);
      const application = await submitMembershipApplication(db, applicant, applicationInput);
      const reviewer = actor("person-board", "mfa", [
        grant("person-board", "membership.application.decide", application.id, "mfa"),
      ]);
      const decidedAt = new Date("2026-08-04T12:00:00.000Z");

      const result = await decideMembershipApplication(
        db,
        reviewer,
        application.id,
        "approved",
        decidedAt
      );

      expect(result.application).toMatchObject({
        status: "approved",
        decidedByPersonId: "person-board",
        decidedAt,
        decisionAuditId: expect.any(String),
        decisionAuditTimestamp: decidedAt,
      });
      expect(result.member).toMatchObject({
        personId: "person-applicant",
        tier: "basic",
        status: "verified",
      });
      expect(await db.select().from(membershipStatusChanges)).toEqual([
        expect.objectContaining({
          previousStatus: "registered",
          currentStatus: "verified",
          triggeringActivity: "board-application-approval",
          timestamp: decidedAt,
        }),
      ]);
      expect(await db.select().from(notifications)).toEqual([
        expect.objectContaining({
          recipientPersonId: "person-applicant",
          template: "membership-application-approved",
          status: "pending",
        }),
      ]);
      expect(await db.select().from(researchWallets)).toEqual([
        expect.objectContaining({
          personId: "person-applicant",
          status: "offered",
          activatedAt: null,
        }),
      ]);
      expect(await db.select().from(authorizationGrants)).toEqual([
        expect.objectContaining({
          personId: "person-applicant",
          capability: "research.wallet.activate",
          target: result.walletId,
          grantedByPersonId: "person-board",
        }),
        expect.objectContaining({
          personId: "person-applicant",
          capability: "research.wallet.credential.issue",
          target: result.walletId,
          assuranceRequired: "verified",
          grantedByPersonId: "person-board",
        }),
        expect.objectContaining({
          personId: "person-applicant",
          capability: "research.wallet.recover",
          target: result.walletId,
          assuranceRequired: "mfa",
          grantedByPersonId: "person-board",
        }),
      ]);
      expect((await db.select().from(auditLog)).map((row) => row.action)).toEqual([
        "membership.application.submitted",
        "research.wallet.offered",
        "authorization.wallet-activation-grant-created",
        "authorization.wallet-credential-grant-created",
        "authorization.wallet-recovery-grant-created",
        "membership.application.approved",
      ]);
    } finally {
      await client.close();
    }
  }, 30_000);
});

describe("research participation separation", () => {
  it("records readiness, project consent, eligibility, and withdrawal independently of membership", async () => {
    const { client, db } = await database();
    try {
      await seedPeople(db);
      await db.insert(members).values({
        id: "member-applicant",
        personId: "person-applicant",
        tier: "research",
        status: "verified",
        createdAt: new Date("2026-08-04T10:00:00.000Z"),
      });
      const applicant = actor("person-applicant", "verified", [
        grant("person-applicant", "research.preference.manage", null),
        grant("person-applicant", "research.project-consent.manage", "project-alpha"),
      ]);

      await setResearchParticipationPreference(
        db,
        applicant,
        { willing: true, statementVersion: "research-readiness-v1" },
        new Date("2026-08-04T11:00:00.000Z")
      );
      const consent = await recordProjectResearchConsent(
        db,
        applicant,
        {
          projectRef: "project-alpha",
          purposeVersion: "alpha-purpose-v1",
          dataCategories: ["survey-response"],
          purpose: "Study civic participation barriers",
          pseudonymization: "Project-specific pseudonym; issuer mapping retained",
          recipients: ["approved-project-researchers"],
          retentionRule: "review-required-before-production",
        },
        new Date("2026-08-04T11:05:00.000Z")
      );
      const assessor = actor("person-board", "mfa", [
        grant("person-board", "research.project-eligibility.assess", "project-alpha", "mfa"),
      ]);
      await assessProjectEligibility(
        db,
        assessor,
        {
          personId: "person-applicant",
          projectRef: "project-alpha",
          status: "eligible",
          basis: "project-specific-consent",
          projectConsentId: consent.id,
          reasonCode: "current-consent-and-membership",
        },
        new Date("2026-08-04T11:10:00.000Z")
      );
      await withdrawProjectResearchConsent(
        db,
        applicant,
        consent.id,
        new Date("2026-08-04T11:15:00.000Z")
      );
      await setResearchParticipationPreference(
        db,
        applicant,
        { willing: false, statementVersion: "research-readiness-v1" },
        new Date("2026-08-04T11:20:00.000Z")
      );

      expect((await db.select().from(researchParticipationPreferences))[0]).toMatchObject({
        personId: "person-applicant",
        status: "withdrawn",
        withdrawnAt: new Date("2026-08-04T11:20:00.000Z"),
      });
      expect((await db.select().from(projectResearchConsents))[0]).toMatchObject({
        status: "withdrawn",
        withdrawnAt: new Date("2026-08-04T11:15:00.000Z"),
      });
      expect((await db.select().from(projectEligibilityRecords))[0]).toMatchObject({
        status: "ineligible",
        reasonCode: "project-consent-withdrawn",
      });
      expect((await db.select().from(members))[0]).toMatchObject({
        status: "verified",
      });
    } finally {
      await client.close();
    }
  }, 30_000);
});
