import { createHash, randomBytes } from "node:crypto";
import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import { isAuthorized, requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import {
  createCertificateVerificationId,
  nextCourseState,
} from "../modules/academy/workflow";
import type {
  AcademyEnrollmentPolicy,
  AcademyLocale,
  AcademyWorkflowAction,
} from "../modules/academy/types";
import type { Database } from "../persistence";
import { auditLog, notifications, people } from "../persistence/schema";
import {
  academyAssessmentSubmissions,
  academyAssessmentTranslations,
  academyAssessments,
  academyCertificates,
  academyCohorts,
  academyCourseTranslations,
  academyCourseInstructors,
  academyCourses,
  academyEnrollmentApplications,
  academyEnrollments,
  academyInvitations,
  academyInstructors,
  academyLessonTranslations,
  academyLessonProgress,
  academyLessons,
  academyModuleTranslations,
  academyModules,
  academyProgramTranslations,
  academyPrograms,
  academyResources,
  members,
} from "../persistence/module-schema";

const ACADEMY_SCOPE = "academy";
export const ACADEMY_CERTIFICATE_STATEMENT_VERSION = "academy-completion-v1";

type LocalizedCourseInput = Record<
  AcademyLocale,
  {
    title: string;
    summary: string;
    description: string;
    learningOutcomes: string[];
    sourceRefs: string[];
  }
>;

export type CreateAcademyCourseInput = {
  slug: string;
  programId?: string | null;
  enrollmentPolicy: AcademyEnrollmentPolicy;
  translations: LocalizedCourseInput;
  modules?: Array<{
    position: number;
    required: boolean;
    translations: Record<AcademyLocale, { title: string; summary: string }>;
    lessons: Array<{
      position: number;
      required: boolean;
      translations: Record<AcademyLocale, { title: string; content: string; sourceRefs: string[] }>;
      resources?: Array<{
        kind: "document" | "link" | "audio" | "video";
        uri: string;
        locale: AcademyLocale;
        label: string;
        accessibilityLabel: string;
        position: number;
      }>;
    }>;
  }>;
  cohorts?: Array<{
    startsAt: Date;
    endsAt: Date;
    enrollmentOpensAt: Date;
    enrollmentClosesAt: Date;
    capacity: number;
  }>;
  assessments?: Array<{
    modulePosition?: number;
    required: boolean;
    reviewCriteria: string[];
    translations: Record<AcademyLocale, { title: string; prompt: string }>;
  }>;
};

export type CreateAcademyProgramInput = {
  slug: string;
  translations: Record<AcademyLocale, {
    title: string;
    summary: string;
    body: string;
    sourceRefs: string[];
  }>;
};

function requireAcademyAuthority(
  actor: AuthenticatedActor | null,
  capability: string,
  target: string
): asserts actor is AuthenticatedActor {
  requireAuthorization(actor, {
    domain: "civic",
    capability,
    target,
    requireExactTarget: true,
    minimumAssurance: "mfa",
  });
}

function cleanSlug(value: string) {
  const slug = value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new AcademyValidationError("invalid_slug");
  }
  return slug;
}

function assertTranslations(translations: LocalizedCourseInput) {
  for (const locale of ["de", "en", "fa"] as const) {
    const item = translations[locale];
    if (
      !item ||
      !item.title.trim() ||
      !item.summary.trim() ||
      !item.description.trim() ||
      !item.learningOutcomes.length ||
      !item.sourceRefs.length ||
      item.learningOutcomes.some((value) => !value.trim()) ||
      item.sourceRefs.some((value) => !value.trim())
    ) {
      throw new AcademyValidationError("incomplete_localization");
    }
  }
}

function assertCourseStructure(input: CreateAcademyCourseInput) {
  const modulePositions = new Set<number>();
  for (const moduleInput of input.modules ?? []) {
    if (!Number.isInteger(moduleInput.position) || moduleInput.position < 1 || modulePositions.has(moduleInput.position)) {
      throw new AcademyValidationError("invalid_module_position");
    }
    modulePositions.add(moduleInput.position);
    const lessonPositions = new Set<number>();
    for (const locale of ["de", "en", "fa"] as const) {
      if (!moduleInput.translations[locale]?.title.trim() || !moduleInput.translations[locale]?.summary.trim()) {
        throw new AcademyValidationError("incomplete_localization");
      }
    }
    for (const lesson of moduleInput.lessons) {
      if (!Number.isInteger(lesson.position) || lesson.position < 1 || lessonPositions.has(lesson.position)) {
        throw new AcademyValidationError("invalid_lesson_position");
      }
      lessonPositions.add(lesson.position);
      for (const locale of ["de", "en", "fa"] as const) {
        const translation = lesson.translations[locale];
        if (!translation?.title.trim() || !translation.content.trim() || !translation.sourceRefs.length) {
          throw new AcademyValidationError("incomplete_localization");
        }
      }
      for (const resource of lesson.resources ?? []) {
        let parsed: URL;
        try { parsed = new URL(resource.uri); } catch { throw new AcademyValidationError("invalid_resource_uri"); }
        if (parsed.protocol !== "https:") throw new AcademyValidationError("invalid_resource_uri");
        if (!resource.label.trim() || !resource.accessibilityLabel.trim()) {
          throw new AcademyValidationError("invalid_resource_label");
        }
      }
    }
  }
  for (const cohort of input.cohorts ?? []) {
    if (
      !Number.isInteger(cohort.capacity) || cohort.capacity < 1 ||
      cohort.enrollmentClosesAt <= cohort.enrollmentOpensAt ||
      cohort.endsAt <= cohort.startsAt ||
      cohort.enrollmentClosesAt > cohort.startsAt
    ) {
      throw new AcademyValidationError("invalid_cohort_schedule");
    }
  }
}

export async function createAcademyProgram(
  db: Database,
  actor: AuthenticatedActor | null,
  input: CreateAcademyProgramInput,
  now = new Date()
) {
  requireAcademyAuthority(actor, "academy.program.create", ACADEMY_SCOPE);
  for (const locale of ["de", "en", "fa"] as const) {
    const item = input.translations[locale];
    if (!item?.title.trim() || !item.summary.trim() || !item.body.trim() || !item.sourceRefs.length) {
      throw new AcademyValidationError("incomplete_localization");
    }
  }
  const program = {
    id: createId(), slug: cleanSlug(input.slug), state: "draft" as const,
    createdByPersonId: actor.personId, createdAt: now,
    submittedForReviewAt: null, approvedByPersonId: null, approvedAt: null,
    publishedAt: null, archivedAt: null, version: 1,
  };
  await db.transaction(async (transaction) => {
    await transaction.insert(academyPrograms).values(program);
    await transaction.insert(academyProgramTranslations).values(
      (["de", "en", "fa"] as const).map((locale) => ({
        programId: program.id, locale,
        title: input.translations[locale].title.trim(),
        summary: input.translations[locale].summary.trim(),
        body: input.translations[locale].body.trim(),
        sourceRefs: input.translations[locale].sourceRefs.map((value) => value.trim()),
        version: 1,
      }))
    );
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "academy.program.created", target: program.id,
      timestamp: now, pseudonymized: false,
    });
  });
  return program;
}

export async function createAcademyCourse(
  db: Database,
  actor: AuthenticatedActor | null,
  input: CreateAcademyCourseInput,
  now = new Date()
) {
  requireAcademyAuthority(actor, "academy.course.create", ACADEMY_SCOPE);
  assertTranslations(input.translations);
  assertCourseStructure(input);
  const id = createId();
  const course = {
    id,
    programId: input.programId ?? null,
    slug: cleanSlug(input.slug),
    state: "draft" as const,
    enrollmentPolicy: input.enrollmentPolicy,
    createdByPersonId: actor.personId,
    createdAt: now,
    submittedForReviewAt: null,
    reviewedByPersonId: null,
    reviewedAt: null,
    approvedByPersonId: null,
    approvedAt: null,
    publishedAt: null,
    archivedAt: null,
    version: 1,
  };
  await db.transaction(async (transaction) => {
    await transaction.insert(academyCourses).values(course);
    await transaction.insert(academyCourseTranslations).values(
      (["de", "en", "fa"] as const).map((locale) => ({
        courseId: id,
        locale,
        title: input.translations[locale].title.trim(),
        summary: input.translations[locale].summary.trim(),
        description: input.translations[locale].description.trim(),
        learningOutcomes: input.translations[locale].learningOutcomes.map((value) => value.trim()),
        sourceRefs: input.translations[locale].sourceRefs.map((value) => value.trim()),
        version: 1,
      }))
    );
    const moduleIdByPosition = new Map<number, string>();
    for (const moduleInput of input.modules ?? []) {
      const moduleId = createId();
      moduleIdByPosition.set(moduleInput.position, moduleId);
      await transaction.insert(academyModules).values({
        id: moduleId, courseId: id, position: moduleInput.position, required: moduleInput.required,
      });
      await transaction.insert(academyModuleTranslations).values(
        (["de", "en", "fa"] as const).map((locale) => ({
          moduleId, locale,
          title: moduleInput.translations[locale].title.trim(),
          summary: moduleInput.translations[locale].summary.trim(),
        }))
      );
      for (const lessonInput of moduleInput.lessons) {
        const lessonId = createId();
        await transaction.insert(academyLessons).values({
          id: lessonId, moduleId, position: lessonInput.position, required: lessonInput.required,
        });
        await transaction.insert(academyLessonTranslations).values(
          (["de", "en", "fa"] as const).map((locale) => ({
            lessonId, locale,
            title: lessonInput.translations[locale].title.trim(),
            content: lessonInput.translations[locale].content.trim(),
            sourceRefs: lessonInput.translations[locale].sourceRefs.map((value) => value.trim()),
          }))
        );
        if (lessonInput.resources?.length) {
          await transaction.insert(academyResources).values(
            lessonInput.resources.map((resource) => ({
              id: createId(), lessonId, kind: resource.kind, uri: resource.uri,
              locale: resource.locale, label: resource.label.trim(),
              accessibilityLabel: resource.accessibilityLabel.trim(), position: resource.position,
            }))
          );
        }
      }
    }
    for (const cohort of input.cohorts ?? []) {
      await transaction.insert(academyCohorts).values({
        id: createId(), courseId: id, ...cohort, status: "scheduled",
      });
    }
    for (const assessment of input.assessments ?? []) {
      const assessmentId = createId();
      const moduleId = assessment.modulePosition === undefined
        ? null
        : moduleIdByPosition.get(assessment.modulePosition);
      if (assessment.modulePosition !== undefined && !moduleId) {
        throw new AcademyValidationError("assessment_module_not_found");
      }
      await transaction.insert(academyAssessments).values({
        id: assessmentId, courseId: id, moduleId: moduleId ?? null,
        required: assessment.required, reviewCriteria: assessment.reviewCriteria,
        createdByPersonId: actor.personId, createdAt: now,
      });
      await transaction.insert(academyAssessmentTranslations).values(
        (["de", "en", "fa"] as const).map((locale) => ({
          assessmentId, locale,
          title: assessment.translations[locale].title.trim(),
          prompt: assessment.translations[locale].prompt.trim(),
        }))
      );
    }
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: "academy.course.created",
      target: id,
      timestamp: now,
      pseudonymized: false,
    });
  });
  return course;
}

export async function transitionAcademyProgram(
  db: Database,
  actor: AuthenticatedActor | null,
  programId: string,
  action: AcademyWorkflowAction,
  now = new Date()
) {
  const capability = action === "submit-review"
    ? "academy.program.edit"
    : action === "approve"
      ? "academy.program.review"
      : "academy.program.publish";
  requireAcademyAuthority(actor, capability, programId);
  return db.transaction(async (transaction) => {
    const [program] = await transaction.select().from(academyPrograms)
      .where(eq(academyPrograms.id, programId)).limit(1).for("update");
    if (!program) throw new AcademyNotFoundError("program_not_found");
    const nextState = nextCourseState({
      id: program.id, state: program.state, createdByPersonId: program.createdByPersonId,
      reviewedByPersonId: program.approvedByPersonId,
      approvedByPersonId: program.approvedByPersonId, version: program.version,
    }, action, actor.personId);
    const [updated] = await transaction.update(academyPrograms).set({
      state: nextState,
      submittedForReviewAt: action === "submit-review" ? now : program.submittedForReviewAt,
      approvedByPersonId: action === "approve" ? actor.personId : program.approvedByPersonId,
      approvedAt: action === "approve" ? now : program.approvedAt,
      publishedAt: action === "publish" ? now : program.publishedAt,
      archivedAt: action === "archive" ? now : program.archivedAt,
    }).where(and(eq(academyPrograms.id, programId), eq(academyPrograms.state, program.state))).returning();
    if (!updated) throw new AcademyConflictError("stale_program_state");
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: `academy.program.${action}`, target: programId,
      timestamp: now, pseudonymized: false,
    });
    return updated;
  });
}

export async function transitionAcademyCourse(
  db: Database,
  actor: AuthenticatedActor | null,
  courseId: string,
  action: AcademyWorkflowAction,
  now = new Date()
) {
  const capability = action === "submit-review"
    ? "academy.course.edit"
    : action === "approve"
      ? "academy.course.review"
      : "academy.course.publish";
  requireAcademyAuthority(actor, capability, courseId);

  return db.transaction(async (transaction) => {
    const [course] = await transaction
      .select()
      .from(academyCourses)
      .where(eq(academyCourses.id, courseId))
      .limit(1)
      .for("update");
    if (!course) throw new AcademyNotFoundError("course_not_found");
    if (action === "submit-review") {
      const [{ value: moduleCount }] = await transaction.select({ value: count() })
        .from(academyModules).where(eq(academyModules.courseId, courseId));
      const [{ value: lessonCount }] = await transaction.select({ value: count() })
        .from(academyLessons).innerJoin(academyModules, eq(academyLessons.moduleId, academyModules.id))
        .where(eq(academyModules.courseId, courseId));
      const [{ value: cohortCount }] = await transaction.select({ value: count() })
        .from(academyCohorts).where(eq(academyCohorts.courseId, courseId));
      if (moduleCount < 1 || lessonCount < 1 || cohortCount < 1) {
        throw new AcademyValidationError("course_not_review_ready");
      }
    }
    const nextState = nextCourseState(course, action, actor.personId);
    const changes = {
      state: nextState,
      submittedForReviewAt:
        action === "submit-review" ? now : course.submittedForReviewAt,
      reviewedByPersonId:
        action === "approve" ? actor.personId : course.reviewedByPersonId,
      reviewedAt: action === "approve" ? now : course.reviewedAt,
      approvedByPersonId:
        action === "approve" ? actor.personId : course.approvedByPersonId,
      approvedAt: action === "approve" ? now : course.approvedAt,
      publishedAt: action === "publish" ? now : course.publishedAt,
      archivedAt: action === "archive" ? now : course.archivedAt,
    };
    const [updated] = await transaction
      .update(academyCourses)
      .set(changes)
      .where(and(eq(academyCourses.id, courseId), eq(academyCourses.state, course.state)))
      .returning();
    if (!updated) throw new AcademyConflictError("stale_course_state");
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: `academy.course.${action}`,
      target: courseId,
      timestamp: now,
      pseudonymized: false,
    });
    return updated;
  });
}

export async function updateAcademyCourseContent(
  db: Database,
  actor: AuthenticatedActor | null,
  courseId: string,
  input: { enrollmentPolicy: AcademyEnrollmentPolicy; translations: LocalizedCourseInput },
  now = new Date()
) {
  requireAcademyAuthority(actor, "academy.course.edit", courseId);
  assertTranslations(input.translations);
  return db.transaction(async (transaction) => {
    const [course] = await transaction.select().from(academyCourses)
      .where(eq(academyCourses.id, courseId)).limit(1).for("update");
    if (!course) throw new AcademyNotFoundError("course_not_found");
    if (course.state !== "draft") throw new AcademyConflictError("course_not_editable");
    const nextVersion = course.version + 1;
    const [updated] = await transaction.update(academyCourses).set({
      enrollmentPolicy: input.enrollmentPolicy,
      version: nextVersion,
    }).where(and(eq(academyCourses.id, courseId), eq(academyCourses.version, course.version))).returning();
    if (!updated) throw new AcademyConflictError("stale_course_version");
    for (const locale of ["de", "en", "fa"] as const) {
      const translation = input.translations[locale];
      await transaction.update(academyCourseTranslations).set({
        title: translation.title.trim(), summary: translation.summary.trim(),
        description: translation.description.trim(),
        learningOutcomes: translation.learningOutcomes.map((value) => value.trim()),
        sourceRefs: translation.sourceRefs.map((value) => value.trim()),
        version: nextVersion,
      }).where(and(
        eq(academyCourseTranslations.courseId, courseId),
        eq(academyCourseTranslations.locale, locale)
      ));
    }
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "academy.course.content-updated", target: courseId,
      timestamp: now, pseudonymized: false,
    });
    return updated;
  });
}

export async function listPublishedAcademyCatalog(
  db: Database,
  locale: AcademyLocale
) {
  const courses = await db
    .select({
      id: academyCourses.id,
      slug: academyCourses.slug,
      enrollmentPolicy: academyCourses.enrollmentPolicy,
      title: academyCourseTranslations.title,
      summary: academyCourseTranslations.summary,
      description: academyCourseTranslations.description,
      learningOutcomes: academyCourseTranslations.learningOutcomes,
      sourceRefs: academyCourseTranslations.sourceRefs,
      publishedAt: academyCourses.publishedAt,
    })
    .from(academyCourses)
    .innerJoin(
      academyCourseTranslations,
      and(
        eq(academyCourseTranslations.courseId, academyCourses.id),
        eq(academyCourseTranslations.locale, locale)
      )
    )
    .where(eq(academyCourses.state, "published"))
    .orderBy(asc(academyCourseTranslations.title));

  const programs = await db
    .select({
      id: academyPrograms.id,
      slug: academyPrograms.slug,
      title: academyProgramTranslations.title,
      summary: academyProgramTranslations.summary,
      body: academyProgramTranslations.body,
      sourceRefs: academyProgramTranslations.sourceRefs,
      publishedAt: academyPrograms.publishedAt,
    })
    .from(academyPrograms)
    .innerJoin(
      academyProgramTranslations,
      and(
        eq(academyProgramTranslations.programId, academyPrograms.id),
        eq(academyProgramTranslations.locale, locale)
      )
    )
    .where(eq(academyPrograms.state, "published"))
    .orderBy(asc(academyProgramTranslations.title));

  const cohorts = await db
    .select({
      id: academyCohorts.id,
      courseId: academyCohorts.courseId,
      startsAt: academyCohorts.startsAt,
      endsAt: academyCohorts.endsAt,
      enrollmentOpensAt: academyCohorts.enrollmentOpensAt,
      enrollmentClosesAt: academyCohorts.enrollmentClosesAt,
      capacity: academyCohorts.capacity,
      status: academyCohorts.status,
    })
    .from(academyCohorts)
    .innerJoin(academyCourses, eq(academyCohorts.courseId, academyCourses.id))
    .where(eq(academyCourses.state, "published"))
    .orderBy(asc(academyCohorts.startsAt));

  const instructors = await db.select({
    courseId: academyCourseInstructors.courseId,
    name: people.name,
    role: academyCourseInstructors.role,
  }).from(academyCourseInstructors)
    .innerJoin(academyInstructors, eq(academyCourseInstructors.instructorPersonId, academyInstructors.personId))
    .innerJoin(people, eq(academyInstructors.personId, people.id))
    .innerJoin(academyCourses, eq(academyCourseInstructors.courseId, academyCourses.id))
    .where(and(
      eq(academyCourses.state, "published"),
      eq(academyInstructors.publicBiographyApproved, true)
    ));

  const modules = await db.select({
    id: academyModules.id,
    courseId: academyModules.courseId,
    position: academyModules.position,
    required: academyModules.required,
    title: academyModuleTranslations.title,
    summary: academyModuleTranslations.summary,
  }).from(academyModules)
    .innerJoin(academyCourses, eq(academyModules.courseId, academyCourses.id))
    .innerJoin(academyModuleTranslations, and(
      eq(academyModuleTranslations.moduleId, academyModules.id),
      eq(academyModuleTranslations.locale, locale)
    ))
    .where(eq(academyCourses.state, "published"))
    .orderBy(asc(academyModules.position));

  const lessons = await db.select({
    id: academyLessons.id,
    moduleId: academyLessons.moduleId,
    position: academyLessons.position,
    required: academyLessons.required,
    title: academyLessonTranslations.title,
    content: academyLessonTranslations.content,
    sourceRefs: academyLessonTranslations.sourceRefs,
  }).from(academyLessons)
    .innerJoin(academyModules, eq(academyLessons.moduleId, academyModules.id))
    .innerJoin(academyCourses, eq(academyModules.courseId, academyCourses.id))
    .innerJoin(academyLessonTranslations, and(
      eq(academyLessonTranslations.lessonId, academyLessons.id),
      eq(academyLessonTranslations.locale, locale)
    ))
    .where(eq(academyCourses.state, "published"))
    .orderBy(asc(academyLessons.position));

  const resources = await db.select({
    id: academyResources.id,
    lessonId: academyResources.lessonId,
    kind: academyResources.kind,
    uri: academyResources.uri,
    label: academyResources.label,
    accessibilityLabel: academyResources.accessibilityLabel,
    position: academyResources.position,
  }).from(academyResources)
    .innerJoin(academyLessons, eq(academyResources.lessonId, academyLessons.id))
    .innerJoin(academyModules, eq(academyLessons.moduleId, academyModules.id))
    .innerJoin(academyCourses, eq(academyModules.courseId, academyCourses.id))
    .where(and(eq(academyCourses.state, "published"), eq(academyResources.locale, locale)))
    .orderBy(asc(academyResources.position));

  const assessments = await db.select({
    id: academyAssessments.id,
    courseId: academyAssessments.courseId,
    moduleId: academyAssessments.moduleId,
    required: academyAssessments.required,
    title: academyAssessmentTranslations.title,
    prompt: academyAssessmentTranslations.prompt,
  }).from(academyAssessments)
    .innerJoin(academyCourses, eq(academyAssessments.courseId, academyCourses.id))
    .innerJoin(academyAssessmentTranslations, and(
      eq(academyAssessmentTranslations.assessmentId, academyAssessments.id),
      eq(academyAssessmentTranslations.locale, locale)
    ))
    .where(eq(academyCourses.state, "published"));

  return { locale, courses, programs, cohorts, instructors, modules, lessons, resources, assessments };
}

export async function assignAcademyInstructor(
  db: Database,
  actor: AuthenticatedActor | null,
  input: {
    courseId: string;
    instructorPersonId: string;
    role: "lead" | "facilitator" | "reviewer";
    publicBiographyApproved: true;
  },
  now = new Date()
) {
  requireAcademyAuthority(actor, "academy.instructor.manage", input.courseId);
  if (input.instructorPersonId === actor.personId) throw new AcademySeparationOfDutiesError();
  const [person] = await db.select({ id: people.id }).from(people)
    .where(eq(people.id, input.instructorPersonId)).limit(1);
  if (!person) throw new AcademyNotFoundError("instructor_not_found");
  return db.transaction(async (transaction) => {
    await transaction.insert(academyInstructors).values({
      personId: input.instructorPersonId,
      publicBiographyApproved: input.publicBiographyApproved,
      createdAt: now,
    }).onConflictDoUpdate({
      target: academyInstructors.personId,
      set: { publicBiographyApproved: input.publicBiographyApproved },
    });
    const [assignment] = await transaction.insert(academyCourseInstructors).values({
      courseId: input.courseId,
      instructorPersonId: input.instructorPersonId,
      role: input.role,
    }).returning();
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "academy.instructor.assigned", target: input.courseId,
      timestamp: now, pseudonymized: false,
    });
    return assignment;
  });
}

function requireSelfService(
  actor: AuthenticatedActor | null,
  courseId: string
): asserts actor is AuthenticatedActor {
  requireAuthorization(actor, {
    domain: "civic",
    capability: "academy.enrollment.self",
    target: courseId,
  });
}

async function isVerifiedMember(db: Pick<Database, "select">, personId: string) {
  const [member] = await db
    .select({ status: members.status })
    .from(members)
    .where(eq(members.personId, personId))
    .limit(1);
  return member?.status === "verified" || member?.status === "active";
}

function invitationHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function enrollInAcademyCourse(
  db: Database,
  actor: AuthenticatedActor | null,
  input: {
    courseId: string;
    cohortId: string;
    invitationToken?: string;
    applicationStatement?: string;
  },
  now = new Date()
) {
  requireSelfService(actor, input.courseId);
  return db.transaction(async (transaction) => {
    const [course] = await transaction
      .select()
      .from(academyCourses)
      .where(eq(academyCourses.id, input.courseId))
      .limit(1);
    const [cohort] = await transaction
      .select()
      .from(academyCohorts)
      .where(and(eq(academyCohorts.id, input.cohortId), eq(academyCohorts.courseId, input.courseId)))
      .limit(1)
      .for("update");
    if (!course || !cohort || course.state !== "published" || cohort.status !== "scheduled") {
      throw new AcademyNotFoundError("enrollment_not_available");
    }
    if (now < cohort.enrollmentOpensAt || now >= cohort.enrollmentClosesAt) {
      throw new AcademyEnrollmentError("enrollment_closed");
    }
    const [{ value: enrollmentCount }] = await transaction
      .select({ value: count() })
      .from(academyEnrollments)
      .where(eq(academyEnrollments.cohortId, input.cohortId));
    if (enrollmentCount >= cohort.capacity) throw new AcademyEnrollmentError("cohort_full");

    if (course.enrollmentPolicy === "member-only" && !(await isVerifiedMember(transaction, actor.personId))) {
      throw new AcademyEnrollmentError("verified_membership_required");
    }

    let invitationId: string | null = null;
    if (course.enrollmentPolicy === "invitation") {
      if (!input.invitationToken) throw new AcademyEnrollmentError("invitation_required");
      const [invitation] = await transaction
        .select()
        .from(academyInvitations)
        .where(and(
          eq(academyInvitations.cohortId, input.cohortId),
          eq(academyInvitations.tokenHash, invitationHash(input.invitationToken))
        ))
        .limit(1)
        .for("update");
      if (!invitation || invitation.redeemedAt || invitation.expiresAt <= now) {
        throw new AcademyEnrollmentError("invalid_invitation");
      }
      invitationId = invitation.id;
    }

    if (course.enrollmentPolicy === "application") {
      const statement = input.applicationStatement?.trim();
      if (!statement) throw new AcademyEnrollmentError("application_statement_required");
      const application = {
        id: createId(),
        courseId: input.courseId,
        cohortId: input.cohortId,
        personId: actor.personId,
        statement,
        status: "pending" as const,
        submittedAt: now,
        decidedAt: null,
        decidedByPersonId: null,
      };
      await transaction.insert(academyEnrollmentApplications).values(application);
      await transaction.insert(auditLog).values({
        id: createId(), actorPersonId: actor.personId,
        action: "academy.enrollment-application.submitted", target: application.id,
        timestamp: now, pseudonymized: false,
      });
      return { kind: "application" as const, application };
    }

    const enrollment = {
      id: createId(),
      courseId: input.courseId,
      cohortId: input.cohortId,
      personId: actor.personId,
      status: "enrolled" as const,
      enrolledAt: now,
      completedAt: null,
    };
    await transaction.insert(academyEnrollments).values(enrollment);
    if (invitationId) {
      await transaction.update(academyInvitations).set({
        redeemedByPersonId: actor.personId,
        redeemedAt: now,
      }).where(eq(academyInvitations.id, invitationId));
    }
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "academy.enrollment.created", target: enrollment.id,
      timestamp: now, pseudonymized: false,
    });
    return { kind: "enrollment" as const, enrollment };
  });
}

export async function getSelfAcademyDashboard(
  db: Database,
  actor: AuthenticatedActor | null,
  locale: AcademyLocale
) {
  if (!actor) throw new AcademyAuthenticationError();
  const enrollments = await db
    .select({
      id: academyEnrollments.id,
      courseId: academyEnrollments.courseId,
      courseSlug: academyCourses.slug,
      courseTitle: academyCourseTranslations.title,
      status: academyEnrollments.status,
      enrolledAt: academyEnrollments.enrolledAt,
      completedAt: academyEnrollments.completedAt,
    })
    .from(academyEnrollments)
    .innerJoin(academyCourses, eq(academyEnrollments.courseId, academyCourses.id))
    .innerJoin(academyCourseTranslations, and(
      eq(academyCourseTranslations.courseId, academyCourses.id),
      eq(academyCourseTranslations.locale, locale)
    ))
    .where(eq(academyEnrollments.personId, actor.personId));
  const applications = await db
    .select({
      id: academyEnrollmentApplications.id,
      courseId: academyEnrollmentApplications.courseId,
      status: academyEnrollmentApplications.status,
      submittedAt: academyEnrollmentApplications.submittedAt,
      decidedAt: academyEnrollmentApplications.decidedAt,
    })
    .from(academyEnrollmentApplications)
    .where(eq(academyEnrollmentApplications.personId, actor.personId));
  return { locale, enrollments, applications };
}

export async function getAcademyOperationsOverview(
  db: Database,
  actor: AuthenticatedActor | null,
  now = new Date()
) {
  if (!canOperateAcademy(actor, now)) throw new AcademyOperationsAuthorizationError();
  const [courses, applications, submissions] = await Promise.all([
    db.select({
      id: academyCourses.id,
      slug: academyCourses.slug,
      state: academyCourses.state,
      enrollmentPolicy: academyCourses.enrollmentPolicy,
      version: academyCourses.version,
      createdByPersonId: academyCourses.createdByPersonId,
      approvedByPersonId: academyCourses.approvedByPersonId,
      createdAt: academyCourses.createdAt,
      publishedAt: academyCourses.publishedAt,
    }).from(academyCourses).orderBy(desc(academyCourses.createdAt)).limit(100),
    db.select({
      id: academyEnrollmentApplications.id,
      courseId: academyEnrollmentApplications.courseId,
      status: academyEnrollmentApplications.status,
      submittedAt: academyEnrollmentApplications.submittedAt,
      decidedAt: academyEnrollmentApplications.decidedAt,
    }).from(academyEnrollmentApplications)
      .orderBy(desc(academyEnrollmentApplications.submittedAt)).limit(100),
    db.select({
      id: academyAssessmentSubmissions.id,
      assessmentId: academyAssessmentSubmissions.assessmentId,
      status: academyAssessmentSubmissions.status,
      submittedAt: academyAssessmentSubmissions.submittedAt,
      reviewedAt: academyAssessmentSubmissions.reviewedAt,
    }).from(academyAssessmentSubmissions)
      .orderBy(desc(academyAssessmentSubmissions.submittedAt)).limit(100),
  ]);
  return { courses, enrollmentApplications: applications, assessmentSubmissions: submissions };
}

export async function createAcademyInvitation(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { courseId: string; cohortId: string; expiresAt: Date },
  now = new Date()
) {
  requireAcademyAuthority(actor, "academy.enrollment.invite", input.courseId);
  if (input.expiresAt <= now) throw new AcademyValidationError("invitation_expiry_required");
  const [cohort] = await db.select({ id: academyCohorts.id }).from(academyCohorts)
    .where(and(eq(academyCohorts.id, input.cohortId), eq(academyCohorts.courseId, input.courseId)))
    .limit(1);
  if (!cohort) throw new AcademyNotFoundError("cohort_not_found");
  const token = randomBytes(32).toString("base64url");
  const invitation = {
    id: createId(), courseId: input.courseId, cohortId: input.cohortId,
    tokenHash: invitationHash(token), expiresAt: input.expiresAt,
    redeemedByPersonId: null, redeemedAt: null,
    createdByPersonId: actor.personId, createdAt: now,
  };
  await db.transaction(async (transaction) => {
    await transaction.insert(academyInvitations).values(invitation);
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "academy.invitation.created", target: invitation.id,
      timestamp: now, pseudonymized: false,
    });
  });
  return { id: invitation.id, token, expiresAt: invitation.expiresAt };
}

export async function decideAcademyEnrollmentApplication(
  db: Database,
  actor: AuthenticatedActor | null,
  applicationId: string,
  decision: "approved" | "rejected",
  now = new Date()
) {
  const [application] = await db.select().from(academyEnrollmentApplications)
    .where(eq(academyEnrollmentApplications.id, applicationId)).limit(1);
  if (!application) throw new AcademyNotFoundError("application_not_found");
  requireAcademyAuthority(actor, "academy.enrollment.review", application.courseId);
  if (application.personId === actor.personId) throw new AcademySeparationOfDutiesError();
  return db.transaction(async (transaction) => {
    const [updated] = await transaction.update(academyEnrollmentApplications).set({
      status: decision,
      decidedAt: now,
      decidedByPersonId: actor.personId,
    }).where(and(
      eq(academyEnrollmentApplications.id, applicationId),
      eq(academyEnrollmentApplications.status, "pending")
    )).returning();
    if (!updated) throw new AcademyConflictError("application_already_decided");
    let enrollment = null;
    if (decision === "approved") {
      [enrollment] = await transaction.insert(academyEnrollments).values({
        id: createId(), courseId: application.courseId, cohortId: application.cohortId,
        personId: application.personId, status: "enrolled", enrolledAt: now, completedAt: null,
      }).returning();
    }
    await transaction.insert(notifications).values({
      id: createId(), recipientPersonId: application.personId, channel: "in-app",
      template: `academy-enrollment-application-${decision}`,
      status: "pending", createdAt: now, sentAt: null,
    });
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: `academy.enrollment-application.${decision}`, target: applicationId,
      timestamp: now, pseudonymized: false,
    });
    return { application: updated, enrollment };
  });
}

export async function updateAcademyLessonProgress(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { enrollmentId: string; lessonId: string; status: "in-progress" | "completed" },
  now = new Date()
) {
  if (!actor) throw new AcademyAuthenticationError();
  return db.transaction(async (transaction) => {
    const [owned] = await transaction.select({
      id: academyEnrollments.id,
      courseId: academyEnrollments.courseId,
    }).from(academyEnrollments).where(and(
      eq(academyEnrollments.id, input.enrollmentId),
      eq(academyEnrollments.personId, actor.personId)
    )).limit(1);
    if (!owned) throw new AcademyNotFoundError("enrollment_not_found");
    requireAuthorization(actor, {
      domain: "civic",
      capability: "academy.progress.self",
      target: owned.courseId,
    });
    const [lesson] = await transaction
      .select({ id: academyLessons.id })
      .from(academyLessons)
      .innerJoin(academyModules, eq(academyLessons.moduleId, academyModules.id))
      .where(and(eq(academyLessons.id, input.lessonId), eq(academyModules.courseId, owned.courseId)))
      .limit(1);
    if (!lesson) throw new AcademyNotFoundError("lesson_not_found");
    const [progress] = await transaction.insert(academyLessonProgress).values({
      enrollmentId: input.enrollmentId,
      lessonId: input.lessonId,
      status: input.status,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: [academyLessonProgress.enrollmentId, academyLessonProgress.lessonId],
      set: { status: input.status, updatedAt: now },
    }).returning();
    await transaction.update(academyEnrollments).set({ status: "in-progress" })
      .where(and(eq(academyEnrollments.id, input.enrollmentId), eq(academyEnrollments.status, "enrolled")));
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "academy.lesson-progress.updated", target: input.enrollmentId,
      timestamp: now, pseudonymized: false,
    });
    return progress;
  });
}

export async function submitAcademyAssessment(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { assessmentId: string; enrollmentId: string; response: string },
  now = new Date()
) {
  if (!actor) throw new AcademyAuthenticationError();
  const response = input.response.trim();
  if (!response) throw new AcademyValidationError("assessment_response_required");
  return db.transaction(async (transaction) => {
    const [owned] = await transaction.select({
      enrollmentId: academyEnrollments.id,
      courseId: academyEnrollments.courseId,
    }).from(academyEnrollments).where(and(
      eq(academyEnrollments.id, input.enrollmentId),
      eq(academyEnrollments.personId, actor.personId)
    )).limit(1);
    if (!owned) throw new AcademyNotFoundError("enrollment_not_found");
    requireAuthorization(actor, { domain: "civic", capability: "academy.assessment.submit", target: owned.courseId });
    const [assessment] = await transaction.select({ id: academyAssessments.id })
      .from(academyAssessments).where(and(
        eq(academyAssessments.id, input.assessmentId),
        eq(academyAssessments.courseId, owned.courseId)
      )).limit(1);
    if (!assessment) throw new AcademyNotFoundError("assessment_not_found");
    const submission = {
      id: createId(), assessmentId: input.assessmentId, enrollmentId: input.enrollmentId,
      response, status: "submitted" as const, submittedAt: now,
      reviewedByPersonId: null, reviewedAt: null, feedback: null,
    };
    await transaction.insert(academyAssessmentSubmissions).values(submission);
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "academy.assessment.submitted", target: submission.id,
      timestamp: now, pseudonymized: false,
    });
    return submission;
  });
}

export async function reviewAcademyAssessment(
  db: Database,
  actor: AuthenticatedActor | null,
  submissionId: string,
  input: { outcome: "revision-required" | "passed"; feedback: string },
  now = new Date()
) {
  const [scope] = await db.select({
    courseId: academyAssessments.courseId,
    ownerPersonId: academyEnrollments.personId,
  }).from(academyAssessmentSubmissions)
    .innerJoin(academyAssessments, eq(academyAssessmentSubmissions.assessmentId, academyAssessments.id))
    .innerJoin(academyEnrollments, eq(academyAssessmentSubmissions.enrollmentId, academyEnrollments.id))
    .where(eq(academyAssessmentSubmissions.id, submissionId)).limit(1);
  if (!scope) throw new AcademyNotFoundError("submission_not_found");
  requireAcademyAuthority(actor, "academy.assessment.review", scope.courseId);
  if (scope.ownerPersonId === actor.personId) throw new AcademySeparationOfDutiesError();
  const feedback = input.feedback.trim();
  if (!feedback) throw new AcademyValidationError("feedback_required");
  return db.transaction(async (transaction) => {
    const [updated] = await transaction.update(academyAssessmentSubmissions).set({
      status: input.outcome,
      reviewedByPersonId: actor.personId,
      reviewedAt: now,
      feedback,
    }).where(and(
      eq(academyAssessmentSubmissions.id, submissionId),
      eq(academyAssessmentSubmissions.status, "submitted")
    )).returning();
    if (!updated) throw new AcademyConflictError("submission_already_reviewed");
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: `academy.assessment.${input.outcome}`, target: submissionId,
      timestamp: now, pseudonymized: false,
    });
    return updated;
  });
}

export async function issueAcademyCertificate(
  db: Database,
  actor: AuthenticatedActor | null,
  enrollmentId: string,
  now = new Date()
) {
  const [enrollment] = await db.select().from(academyEnrollments)
    .where(eq(academyEnrollments.id, enrollmentId)).limit(1);
  if (!enrollment) throw new AcademyNotFoundError("enrollment_not_found");
  requireAcademyAuthority(actor, "academy.certificate.issue", enrollment.courseId);
  if (enrollment.personId === actor.personId) throw new AcademySeparationOfDutiesError();

  const requiredLessons = await db.select({ id: academyLessons.id })
    .from(academyLessons)
    .innerJoin(academyModules, eq(academyLessons.moduleId, academyModules.id))
    .where(and(eq(academyModules.courseId, enrollment.courseId), eq(academyLessons.required, true)));
  const completedLessons = await db.select({ id: academyLessonProgress.lessonId })
    .from(academyLessonProgress)
    .where(and(
      eq(academyLessonProgress.enrollmentId, enrollmentId),
      eq(academyLessonProgress.status, "completed")
    ));
  const completed = new Set(completedLessons.map(({ id }) => id));
  if (requiredLessons.some(({ id }) => !completed.has(id))) {
    throw new AcademyCompletionError("required_lessons_incomplete");
  }
  const requiredAssessments = await db.select({ id: academyAssessments.id })
    .from(academyAssessments)
    .where(and(eq(academyAssessments.courseId, enrollment.courseId), eq(academyAssessments.required, true)));
  const passedAssessments = await db.select({ id: academyAssessmentSubmissions.assessmentId })
    .from(academyAssessmentSubmissions)
    .where(and(
      eq(academyAssessmentSubmissions.enrollmentId, enrollmentId),
      eq(academyAssessmentSubmissions.status, "passed")
    ));
  const passed = new Set(passedAssessments.map(({ id }) => id));
  if (requiredAssessments.some(({ id }) => !passed.has(id))) {
    throw new AcademyCompletionError("required_assessments_incomplete");
  }

  return db.transaction(async (transaction) => {
    const certificate = {
      id: createId(), enrollmentId,
      verificationId: createCertificateVerificationId(),
      statementVersion: ACADEMY_CERTIFICATE_STATEMENT_VERSION,
      issuedByPersonId: actor.personId,
      issuedAt: now,
      revokedAt: null,
    };
    await transaction.update(academyEnrollments).set({ status: "completed", completedAt: now })
      .where(eq(academyEnrollments.id, enrollmentId));
    await transaction.insert(academyCertificates).values(certificate);
    await transaction.insert(notifications).values({
      id: createId(), recipientPersonId: enrollment.personId,
      channel: "in-app", template: "academy-completion-record-issued",
      status: "pending", createdAt: now, sentAt: null,
    });
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "academy.certificate.issued", target: certificate.id,
      timestamp: now, pseudonymized: false,
    });
    return certificate;
  });
}

export async function verifyAcademyCertificate(
  db: Database,
  verificationId: string,
  locale: AcademyLocale
) {
  const [record] = await db.select({
    verificationId: academyCertificates.verificationId,
    statementVersion: academyCertificates.statementVersion,
    issuedAt: academyCertificates.issuedAt,
    revokedAt: academyCertificates.revokedAt,
    courseTitle: academyCourseTranslations.title,
  }).from(academyCertificates)
    .innerJoin(academyEnrollments, eq(academyCertificates.enrollmentId, academyEnrollments.id))
    .innerJoin(academyCourseTranslations, and(
      eq(academyCourseTranslations.courseId, academyEnrollments.courseId),
      eq(academyCourseTranslations.locale, locale)
    ))
    .where(eq(academyCertificates.verificationId, verificationId)).limit(1);
  if (!record) return { valid: false as const };
  return {
    valid: record.revokedAt === null,
    courseTitle: record.courseTitle,
    statementVersion: record.statementVersion,
    issuedAt: record.issuedAt,
  };
}

export async function revokeAcademyCertificate(
  db: Database,
  actor: AuthenticatedActor | null,
  enrollmentId: string,
  now = new Date()
) {
  const [record] = await db.select({
    certificateId: academyCertificates.id,
    courseId: academyEnrollments.courseId,
    issuedByPersonId: academyCertificates.issuedByPersonId,
    revokedAt: academyCertificates.revokedAt,
  }).from(academyCertificates)
    .innerJoin(academyEnrollments, eq(academyCertificates.enrollmentId, academyEnrollments.id))
    .where(eq(academyCertificates.enrollmentId, enrollmentId)).limit(1);
  if (!record) throw new AcademyNotFoundError("certificate_not_found");
  requireAcademyAuthority(actor, "academy.certificate.revoke", record.courseId);
  if (record.issuedByPersonId === actor.personId) throw new AcademySeparationOfDutiesError();
  if (record.revokedAt) throw new AcademyConflictError("certificate_already_revoked");
  return db.transaction(async (transaction) => {
    const [updated] = await transaction.update(academyCertificates).set({ revokedAt: now })
      .where(and(eq(academyCertificates.id, record.certificateId), isNull(academyCertificates.revokedAt)))
      .returning();
    if (!updated) throw new AcademyConflictError("certificate_already_revoked");
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: "academy.certificate.revoked", target: record.certificateId,
      timestamp: now, pseudonymized: false,
    });
    return updated;
  });
}

export function canOperateAcademy(actor: AuthenticatedActor | null, now = new Date()) {
  if (!actor) return false;
  return actor.grants.some((grant) =>
    grant.domain === "civic" &&
    grant.capability.startsWith("academy.") &&
    grant.assuranceRequired === "mfa" &&
    isAuthorized(actor, {
      domain: "civic",
      capability: grant.capability,
      target: grant.target ?? undefined,
      requireExactTarget: grant.target !== null,
      minimumAssurance: "mfa",
      now,
    })
  );
}

export class AcademyValidationError extends Error {
  constructor(public readonly code: string) { super(code); }
}
export class AcademyNotFoundError extends Error {
  constructor(public readonly code: string) { super(code); }
}
export class AcademyConflictError extends Error {
  constructor(public readonly code: string) { super(code); }
}
export class AcademyEnrollmentError extends Error {
  constructor(public readonly code: string) { super(code); }
}
export class AcademyCompletionError extends Error {
  constructor(public readonly code: string) { super(code); }
}
export class AcademyAuthenticationError extends Error {}
export class AcademySeparationOfDutiesError extends Error {}
export class AcademyOperationsAuthorizationError extends Error {}
