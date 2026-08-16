import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, expect, it } from "vitest";
import { AuthorizationDeniedError } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, people } from "../persistence/schema";
import {
  fellowshipCandidacies,
  fellowshipConflictDeclarations,
  fellowshipRecords,
  fellowshipReviewAssignments,
  fellowshipReviews,
} from "../persistence/module-schema";
import {
  FellowshipConflictError,
  FellowshipSeparationOfDutiesError,
  approveFellowshipRoleScope,
  assignFellowshipReviewer,
  createFellowshipRoleScope,
  decideFellowshipCandidacy,
  declareFellowshipConflict,
  getSelfFellowshipDashboard,
  submitFellowshipApplication,
  submitFellowshipNomination,
  submitFellowshipReview,
} from "./fellowship";

const schema = { ...coreSchema, ...moduleSchema };
const now = new Date("2026-08-10T12:00:00.000Z");

function actor(
  personId: string,
  capability: string,
  target: string | null,
  assurance: "verified" | "mfa" | "recent-mfa" = "recent-mfa"
): AuthenticatedActor {
  return {
    personId,
    sessionId: `session-${personId}`,
    authenticatedAt: now,
    assurance,
    grants: [{
      id: `grant-${personId}-${capability}`,
      personId,
      domain: "civic",
      capability,
      target,
      assuranceRequired: assurance,
      validFrom: new Date(now.getTime() - 1_000),
      validUntil: null,
      revokedAt: null,
    }],
  };
}

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-fellowship-"));
  const client = new PGlite(directory);
  const pgliteDb = drizzle({ client, schema });
  await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { directory, client, db: pgliteDb as unknown as Database };
}

async function seedPeople(db: Database) {
  await db.insert(people).values(
    ["scope-author", "scope-approver", "nominator", "candidate", "reviewer", "decider", "coordinator"].map((id) => ({
      id,
      name: id,
      contact: { email: `${id}@example.org` },
      locale: "de" as const,
      rtlPreference: false,
      createdAt: now,
    }))
  );
}

async function approvedRole(db: Database) {
  const role = await createFellowshipRoleScope(db, actor("scope-author", "fellowship.role-scope.create", "fellowship"), {
    slug: "dialogue-facilitator",
    labels: { de: "Dialogmoderation", en: "Dialogue facilitator", fa: "تسهیل‌گر گفت‌وگو" },
    responsibilities: ["Facilitate documented civic dialogue"],
    sourceRefs: ["brain/BLUEPRINTS/master-product-blueprint.md#5-fellowship-system"],
  }, now);
  await approveFellowshipRoleScope(db, actor("scope-approver", "fellowship.role-scope.approve", role.id), role.id, {
    reasonCode: "fellowship-role-scope-approval",
    requestId: "50000000-0000-4000-8000-000000000001",
  }, now);
  return role;
}

const evidence = [{
  kind: "contribution" as const,
  sourceRef: "audit:synthetic-contribution",
  description: "Documented facilitation contribution",
}];

async function nominationUnderReview(db: Database) {
  const role = await approvedRole(db);
  const candidacy = await submitFellowshipNomination(db, actor("nominator", "fellowship.nomination.submit", "fellowship"), {
    candidatePersonId: "candidate", roleScopeId: role.id,
    rationale: "Qualitative human nomination rationale", evidence,
  }, now);
  const assignment = await assignFellowshipReviewer(db, actor("coordinator", "fellowship.review.assign", candidacy.id), {
    candidacyId: candidacy.id, reviewerPersonId: "reviewer",
  }, now);
  return { role, candidacy, assignment };
}

describe("Fellowship application boundary", () => {
  it("persists human nomination, conflict clearance, review and independent decision atomically", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const { candidacy, assignment } = await nominationUnderReview(fixture.db);
      await declareFellowshipConflict(fixture.db, actor("reviewer", "fellowship.review.declare-conflict", candidacy.id), {
        assignmentId: assignment.id, hasConflict: false, declarationText: "No personal or institutional conflict.",
      }, now);
      await submitFellowshipReview(fixture.db, actor("reviewer", "fellowship.review.submit", candidacy.id), {
        assignmentId: assignment.id, recommendation: "approve", rationale: "Evidence supports the bounded role.",
      }, now);
      const decision = await decideFellowshipCandidacy(fixture.db, actor("decider", "fellowship.decision.record", candidacy.id), {
        candidacyId: candidacy.id, decision: "approve", reason: "Independent human decision.",
        memberFacingReason: "Your Fellowship role has been approved.", sponsorPersonId: "coordinator",
      }, {
        reasonCode: "fellowship-candidacy-decision",
        requestId: "50000000-0000-4000-8000-000000000002",
      }, now);
      expect(decision.fellowship).toMatchObject({ personId: "candidate", status: "active" });
      expect(await fixture.db.select().from(fellowshipRecords)).toHaveLength(1);
      expect((await fixture.db.select().from(auditLog)).map((entry) => entry.action)).toContain("fellowship.candidacy.approved");
      expect((await fixture.db.select().from(auditLog)).at(-1)).toMatchObject({
        sessionId: "session-decider",
        requestId: "50000000-0000-4000-8000-000000000002",
        capability: "fellowship.decision.record",
        reasonCode: "fellowship-candidacy-decision",
      });
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("recuses a conflicted reviewer and rejects review without further persistence or audit", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const { candidacy, assignment } = await nominationUnderReview(fixture.db);
      await declareFellowshipConflict(fixture.db, actor("reviewer", "fellowship.review.declare-conflict", candidacy.id), {
        assignmentId: assignment.id, hasConflict: true, declarationText: "Prior supervisory relationship.",
      }, now);
      const auditCount = (await fixture.db.select().from(auditLog)).length;
      await expect(submitFellowshipReview(fixture.db, actor("reviewer", "fellowship.review.submit", candidacy.id), {
        assignmentId: assignment.id, recommendation: "approve", rationale: "Must not persist.",
      }, now)).rejects.toThrowError(expect.objectContaining({ code: "assignment_not_active" }));
      expect(await fixture.db.select().from(fellowshipReviews)).toHaveLength(0);
      expect(await fixture.db.select().from(auditLog)).toHaveLength(auditCount);
      expect(await fixture.db.select().from(fellowshipConflictDeclarations)).toEqual([expect.objectContaining({ hasConflict: true })]);
      expect(await fixture.db.select().from(fellowshipReviewAssignments)).toEqual([expect.objectContaining({ status: "recused" })]);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("preserves exact scope, MFA and candidate/nominator separation before mutation", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const role = await approvedRole(fixture.db);
      const candidacy = await submitFellowshipNomination(fixture.db, actor("nominator", "fellowship.nomination.submit", "fellowship"), {
        candidatePersonId: "candidate", roleScopeId: role.id, rationale: "Human rationale", evidence,
      }, now);
      const before = (await fixture.db.select().from(auditLog)).length;
      await expect(assignFellowshipReviewer(fixture.db, actor("coordinator", "fellowship.review.assign", "wrong-target"), {
        candidacyId: candidacy.id, reviewerPersonId: "reviewer",
      }, now)).rejects.toBeInstanceOf(AuthorizationDeniedError);
      await expect(assignFellowshipReviewer(fixture.db, actor("coordinator", "fellowship.review.assign", candidacy.id, "verified"), {
        candidacyId: candidacy.id, reviewerPersonId: "reviewer",
      }, now)).rejects.toBeInstanceOf(AuthorizationDeniedError);
      await expect(assignFellowshipReviewer(fixture.db, actor("coordinator", "fellowship.review.assign", candidacy.id), {
        candidacyId: candidacy.id, reviewerPersonId: "candidate",
      }, now)).rejects.toBeInstanceOf(FellowshipSeparationOfDutiesError);
      expect(await fixture.db.select().from(fellowshipReviewAssignments)).toHaveLength(0);
      expect(await fixture.db.select().from(auditLog)).toHaveLength(before);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("keeps self-application status private and does not imply approval", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const role = await approvedRole(fixture.db);
      const application = await submitFellowshipApplication(fixture.db, actor("candidate", "fellowship.application.self", null, "verified"), {
        roleScopeId: role.id, rationale: "I request human review.", evidence,
      }, now);
      const dashboard = await getSelfFellowshipDashboard(
        fixture.db,
        actor("candidate", "fellowship.dashboard.self", null, "verified"),
        "fa"
      );
      expect(application.status).toBe("submitted");
      expect(dashboard.candidacies).toEqual([expect.objectContaining({ status: "submitted", roleLabel: "تسهیل‌گر گفت‌وگو" })]);
      expect(dashboard.records).toHaveLength(0);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("prevents a reviewer from becoming the final decider without mutation", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const { candidacy, assignment } = await nominationUnderReview(fixture.db);
      await declareFellowshipConflict(fixture.db, actor("reviewer", "fellowship.review.declare-conflict", candidacy.id), {
        assignmentId: assignment.id, hasConflict: false, declarationText: "No conflict.",
      }, now);
      await submitFellowshipReview(fixture.db, actor("reviewer", "fellowship.review.submit", candidacy.id), {
        assignmentId: assignment.id, recommendation: "approve", rationale: "Approve.",
      }, now);
      const before = (await fixture.db.select().from(auditLog)).length;
      await expect(decideFellowshipCandidacy(fixture.db, actor("reviewer", "fellowship.decision.record", candidacy.id), {
        candidacyId: candidacy.id, decision: "approve", reason: "Must not persist.", memberFacingReason: "Must not persist.",
      }, {
        reasonCode: "fellowship-candidacy-decision",
        requestId: "50000000-0000-4000-8000-000000000003",
      }, now)).rejects.toBeInstanceOf(FellowshipSeparationOfDutiesError);
      expect(await fixture.db.select().from(fellowshipRecords)).toHaveLength(0);
      expect((await fixture.db.select().from(fellowshipCandidacies))[0].status).toBe("under-review");
      expect(await fixture.db.select().from(auditLog)).toHaveLength(before);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);

  it("requires an explicit conflict declaration before review", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const { candidacy, assignment } = await nominationUnderReview(fixture.db);
      const before = (await fixture.db.select().from(auditLog)).length;
      await expect(submitFellowshipReview(fixture.db, actor("reviewer", "fellowship.review.submit", candidacy.id), {
        assignmentId: assignment.id, recommendation: "approve", rationale: "No declaration.",
      }, now)).rejects.toBeInstanceOf(FellowshipConflictError);
      expect(await fixture.db.select().from(fellowshipReviews)).toHaveLength(0);
      expect(await fixture.db.select().from(auditLog)).toHaveLength(before);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 60_000);
});
