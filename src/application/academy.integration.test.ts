import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { AuthenticatedActor } from "../auth/types";
import { AuthorizationDeniedError } from "../auth/authorize";
import type { Database } from "../persistence";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, people } from "../persistence/schema";
import {
  academyAssessmentSubmissions,
  academyAssessments,
  academyCertificates,
  academyCohorts,
  academyEnrollmentApplications,
  academyEnrollments,
  academyLessons,
  academyModules,
  members,
} from "../persistence/module-schema";
import {
  AcademyEnrollmentError,
  AcademySeparationOfDutiesError,
  createAcademyCourse,
  decideAcademyEnrollmentApplication,
  enrollInAcademyCourse,
  issueAcademyCertificate,
  listPublishedAcademyCatalog,
  reviewAcademyAssessment,
  revokeAcademyCertificate,
  submitAcademyAssessment,
  transitionAcademyCourse,
  updateAcademyLessonProgress,
  verifyAcademyCertificate,
} from "./academy";

const schema = { ...coreSchema, ...moduleSchema };
const now = new Date("2026-08-10T10:00:00.000Z");

function actor(
  personId: string,
  capability: string,
  target: string | null,
  assurance: "verified" | "mfa" = capability.includes(".self") || capability.includes("submit")
    ? "verified"
    : "mfa"
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

function courseInput(enrollmentPolicy: "public" | "member-only" | "invitation" | "application" = "public") {
  const translation = (locale: string) => ({
    title: `Course ${locale}`,
    summary: `Summary ${locale}`,
    description: `Description ${locale}`,
    learningOutcomes: [`Outcome ${locale}`],
    sourceRefs: ["docs/source/academy/CURRICULUM.md"],
  });
  const lessonTranslation = (locale: string) => ({
    title: `Lesson ${locale}`,
    content: `Content ${locale}`,
    sourceRefs: ["docs/source/foundation/02_PHILOSOPHY.md"],
  });
  return {
    slug: `course-${enrollmentPolicy}`,
    enrollmentPolicy,
    translations: { de: translation("de"), en: translation("en"), fa: translation("fa") },
    modules: [{
      position: 1,
      required: true,
      translations: {
        de: { title: "Modul", summary: "Zusammenfassung" },
        en: { title: "Module", summary: "Summary" },
        fa: { title: "بخش", summary: "خلاصه" },
      },
      lessons: [{
        position: 1,
        required: true,
        translations: {
          de: lessonTranslation("de"), en: lessonTranslation("en"), fa: lessonTranslation("fa"),
        },
      }],
    }],
    cohorts: [{
      startsAt: new Date("2026-09-01T10:00:00.000Z"),
      endsAt: new Date("2026-10-01T10:00:00.000Z"),
      enrollmentOpensAt: new Date("2026-08-01T10:00:00.000Z"),
      enrollmentClosesAt: new Date("2026-08-31T10:00:00.000Z"),
      capacity: 10,
    }],
    assessments: [{
      modulePosition: 1,
      required: true,
      reviewCriteria: ["Evidence-based reflection"],
      translations: {
        de: { title: "Reflexion", prompt: "Beschreiben Sie Ihre Schlussfolgerung." },
        en: { title: "Reflection", prompt: "Describe your conclusion." },
        fa: { title: "بازاندیشی", prompt: "نتیجه‌گیری خود را شرح دهید." },
      },
    }],
  };
}

async function database() {
  const directory = await mkdtemp(join(tmpdir(), "res-publica-academy-"));
  const client = new PGlite(directory);
  const pgliteDb = drizzle({ client, schema });
  await migrate(pgliteDb, { migrationsFolder: join(process.cwd(), "drizzle") });
  return { directory, client, db: pgliteDb as unknown as Database };
}

async function seedPeople(db: Database) {
  await db.insert(people).values(
    ["editor", "reviewer", "publisher", "learner", "other"].map((id) => ({
      id,
      name: id,
      contact: { email: `${id}@example.org` },
      locale: "de" as const,
      rtlPreference: false,
      createdAt: now,
    }))
  );
}

async function publishCourse(db: Database, policy: "public" | "member-only" | "invitation" | "application" = "public") {
  const created = await createAcademyCourse(db, actor("editor", "academy.course.create", "academy", "mfa"), courseInput(policy), now);
  await transitionAcademyCourse(db, actor("editor", "academy.course.edit", created.id, "mfa"), created.id, "submit-review", now);
  await transitionAcademyCourse(db, actor("reviewer", "academy.course.review", created.id, "mfa"), created.id, "approve", now);
  await transitionAcademyCourse(db, actor("publisher", "academy.course.publish", created.id, "mfa"), created.id, "publish", now);
  const [cohort] = await db.select().from(academyCohorts);
  return { course: created, cohort };
}

describe("Academy application boundary", () => {
  it("persists the governed publication sequence with atomic canonical audit evidence", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const { course } = await publishCourse(fixture.db);
      const catalog = await listPublishedAcademyCatalog(fixture.db, "fa");
      expect(catalog.courses).toEqual([expect.objectContaining({ id: course.id, title: "Course fa" })]);
      expect((await fixture.db.select().from(auditLog)).map((entry) => entry.action)).toEqual([
        "academy.course.created",
        "academy.course.submit-review",
        "academy.course.approve",
        "academy.course.publish",
      ]);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 30_000);

  it("enforces member-only enrollment without persistence or audit mutation on denial", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const { course, cohort } = await publishCourse(fixture.db, "member-only");
      const beforeAudit = await fixture.db.select().from(auditLog);
      await expect(enrollInAcademyCourse(
        fixture.db,
        actor("learner", "academy.enrollment.self", course.id),
        { courseId: course.id, cohortId: cohort.id },
        now
      )).rejects.toThrowError(expect.objectContaining({ code: "verified_membership_required" }));
      expect(await fixture.db.select().from(academyEnrollments)).toHaveLength(0);
      expect(await fixture.db.select().from(auditLog)).toHaveLength(beforeAudit.length);

      await fixture.db.insert(members).values({
        id: "member-learner", personId: "learner", tier: "basic", status: "verified", createdAt: now,
      });
      const result = await enrollInAcademyCourse(
        fixture.db,
        actor("learner", "academy.enrollment.self", course.id),
        { courseId: course.id, cohortId: cohort.id },
        now
      );
      expect(result.kind).toBe("enrollment");
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 30_000);

  it("preserves exact course scope and MFA before workflow persistence", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const course = await createAcademyCourse(
        fixture.db,
        actor("editor", "academy.course.create", "academy", "mfa"),
        courseInput(),
        now
      );
      await transitionAcademyCourse(
        fixture.db,
        actor("editor", "academy.course.edit", course.id, "mfa"),
        course.id,
        "submit-review",
        now
      );
      const beforeAudit = await fixture.db.select().from(auditLog);
      await expect(transitionAcademyCourse(
        fixture.db,
        actor("reviewer", "academy.course.review", course.id, "verified"),
        course.id,
        "approve",
        now
      )).rejects.toBeInstanceOf(AuthorizationDeniedError);
      await expect(transitionAcademyCourse(
        fixture.db,
        actor("reviewer", "academy.course.review", "33333333-3333-4333-8333-333333333333", "mfa"),
        course.id,
        "approve",
        now
      )).rejects.toBeInstanceOf(AuthorizationDeniedError);
      expect(await fixture.db.select().from(auditLog)).toHaveLength(beforeAudit.length);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 30_000);

  it("keeps application decisions human, MFA-scoped and separated from applicants", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const { course, cohort } = await publishCourse(fixture.db, "application");
      const submitted = await enrollInAcademyCourse(
        fixture.db,
        actor("learner", "academy.enrollment.self", course.id),
        { courseId: course.id, cohortId: cohort.id, applicationStatement: "I want to learn." },
        now
      );
      if (submitted.kind !== "application") throw new Error("Expected an application");
      await expect(decideAcademyEnrollmentApplication(
        fixture.db,
        actor("learner", "academy.enrollment.review", course.id, "mfa"),
        submitted.application.id,
        "approved",
        now
      )).rejects.toBeInstanceOf(AcademySeparationOfDutiesError);
      expect((await fixture.db.select().from(academyEnrollmentApplications))[0].status).toBe("pending");
      const decision = await decideAcademyEnrollmentApplication(
        fixture.db,
        actor("reviewer", "academy.enrollment.review", course.id, "mfa"),
        submitted.application.id,
        "approved",
        now
      );
      expect(decision.enrollment).toMatchObject({ personId: "learner", status: "enrolled" });
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 30_000);

  it("requires human assessment review and exposes no learner identity in public certificate verification", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const { course, cohort } = await publishCourse(fixture.db);
      const enrollmentResult = await enrollInAcademyCourse(
        fixture.db,
        actor("learner", "academy.enrollment.self", course.id),
        { courseId: course.id, cohortId: cohort.id },
        now
      );
      if (enrollmentResult.kind !== "enrollment") throw new Error("Expected enrollment");
      const [lesson] = await fixture.db.select().from(academyLessons)
        .innerJoin(academyModules, eq(academyLessons.moduleId, academyModules.id));
      const [assessment] = await fixture.db.select().from(academyAssessments);
      await updateAcademyLessonProgress(
        fixture.db,
        actor("learner", "academy.progress.self", course.id),
        { enrollmentId: enrollmentResult.enrollment.id, lessonId: lesson.academy_lessons.id, status: "completed" },
        now
      );
      const submission = await submitAcademyAssessment(
        fixture.db,
        actor("learner", "academy.assessment.submit", course.id),
        { assessmentId: assessment.id, enrollmentId: enrollmentResult.enrollment.id, response: "Evidence-based response" },
        now
      );
      await reviewAcademyAssessment(
        fixture.db,
        actor("reviewer", "academy.assessment.review", course.id, "mfa"),
        submission.id,
        { outcome: "passed", feedback: "Meets the stated criteria." },
        now
      );
      const certificate = await issueAcademyCertificate(
        fixture.db,
        actor("publisher", "academy.certificate.issue", course.id, "mfa"),
        enrollmentResult.enrollment.id,
        now
      );
      const verification = await verifyAcademyCertificate(fixture.db, certificate.verificationId, "en");
      expect(verification).toMatchObject({ valid: true, courseTitle: "Course en" });
      expect(JSON.stringify(verification)).not.toContain("learner");
      expect(JSON.stringify(verification)).not.toContain("example.org");
      expect(await fixture.db.select().from(academyAssessmentSubmissions)).toEqual([
        expect.objectContaining({ status: "passed", reviewedByPersonId: "reviewer" }),
      ]);
      expect(await fixture.db.select().from(academyCertificates)).toHaveLength(1);
      await revokeAcademyCertificate(
        fixture.db,
        actor("other", "academy.certificate.revoke", course.id, "mfa"),
        enrollmentResult.enrollment.id,
        new Date(now.getTime() + 1_000)
      );
      expect(await verifyAcademyCertificate(fixture.db, certificate.verificationId, "en"))
        .toMatchObject({ valid: false });
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 30_000);

  it("rejects enrollment outside its window", async () => {
    const fixture = await database();
    try {
      await seedPeople(fixture.db);
      const { course, cohort } = await publishCourse(fixture.db);
      await expect(enrollInAcademyCourse(
        fixture.db,
        actor("learner", "academy.enrollment.self", course.id),
        { courseId: course.id, cohortId: cohort.id },
        new Date("2026-09-01T10:00:00.000Z")
      )).rejects.toBeInstanceOf(AcademyEnrollmentError);
    } finally {
      await fixture.client.close();
      await rm(fixture.directory, { recursive: true, force: true });
    }
  }, 30_000);
});
