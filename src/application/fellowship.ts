import { and, desc, eq, inArray } from "drizzle-orm";
import { isAuthorized, requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import type { Database } from "../persistence";
import { auditLog, people } from "../persistence/schema";
import {
  assertPrivilegedActionContext,
  type PrivilegedActionContext,
} from "../platform/privileged-access";
import {
  fellowshipCandidacies,
  fellowshipConflictDeclarations,
  fellowshipEvidenceRefs,
  fellowshipRecords,
  fellowshipReviewAssignments,
  fellowshipReviews,
  fellowshipRoleScopes,
  fellowshipStatusChanges,
} from "../persistence/module-schema";
import type {
  FellowshipLocale,
  FellowshipRecordStatus,
  FellowshipReviewRecommendation,
} from "../modules/fellowship/types";
import {
  isFellowshipCandidacyFinal,
  mayEnterFellowshipReview,
  mayTransitionFellowshipRecord,
} from "../modules/fellowship/workflow";

const FELLOWSHIP_SCOPE = "fellowship";
const OPEN_CANDIDACY_STATES = ["submitted", "under-review", "more-information-required"] as const;

type EvidenceInput = {
  kind: "contribution" | "role-history" | "reference";
  sourceRef: string;
  description: string;
};

function requireStaff(
  actor: AuthenticatedActor | null,
  capability: string,
  target: string,
  minimumAssurance: "mfa" | "recent-mfa" = "mfa",
  now = new Date()
): asserts actor is AuthenticatedActor {
  requireAuthorization(actor, {
    domain: "civic",
    capability,
    target,
    requireExactTarget: true,
    minimumAssurance,
    now,
  });
}

function requireSelf(actor: AuthenticatedActor | null, capability: string, target: string): asserts actor is AuthenticatedActor {
  requireAuthorization(actor, { domain: "civic", capability, target, minimumAssurance: "verified" });
}

function cleanText(value: string, code = "invalid_text") {
  const cleaned = value.trim();
  if (!cleaned) throw new FellowshipValidationError(code);
  return cleaned;
}

function cleanSlug(value: string) {
  const slug = value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new FellowshipValidationError("invalid_slug");
  return slug;
}

function cleanEvidence(evidence: EvidenceInput[]) {
  if (!evidence.length || evidence.length > 50) throw new FellowshipValidationError("evidence_required");
  return evidence.map((item) => ({
    kind: item.kind,
    sourceRef: cleanText(item.sourceRef, "invalid_evidence"),
    description: cleanText(item.description, "invalid_evidence"),
  }));
}

export async function createFellowshipRoleScope(
  db: Database,
  actor: AuthenticatedActor | null,
  input: {
    slug: string;
    labels: Record<FellowshipLocale, string>;
    responsibilities: string[];
    sourceRefs: string[];
  },
  now = new Date()
) {
  requireStaff(actor, "fellowship.role-scope.create", FELLOWSHIP_SCOPE);
  const labels = Object.fromEntries(
    (["de", "en", "fa"] as const).map((locale) => [locale, cleanText(input.labels[locale], "incomplete_localization")])
  ) as Record<FellowshipLocale, string>;
  if (!input.responsibilities.length || !input.sourceRefs.length) throw new FellowshipValidationError("source_grounding_required");
  const roleScope = {
    id: createId(), slug: cleanSlug(input.slug), labels,
    responsibilities: input.responsibilities.map((value) => cleanText(value)),
    sourceRefs: input.sourceRefs.map((value) => cleanText(value)),
    state: "draft" as const, createdByPersonId: actor.personId,
    approvedByPersonId: null, createdAt: now, approvedAt: null, retiredAt: null,
  };
  await db.transaction(async (transaction) => {
    await transaction.insert(fellowshipRoleScopes).values(roleScope);
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: "fellowship.role-scope.created",
      target: roleScope.id, timestamp: now, pseudonymized: false,
    });
  });
  return roleScope;
}

export async function approveFellowshipRoleScope(
  db: Database,
  actor: AuthenticatedActor | null,
  roleScopeId: string,
  context: PrivilegedActionContext,
  now = new Date()
) {
  requireStaff(actor, "fellowship.role-scope.approve", roleScopeId, "recent-mfa", now);
  assertPrivilegedActionContext(context, ["fellowship-role-scope-approval"]);
  return db.transaction(async (transaction) => {
    const [roleScope] = await transaction.select().from(fellowshipRoleScopes)
      .where(eq(fellowshipRoleScopes.id, roleScopeId)).limit(1);
    if (!roleScope) throw new FellowshipNotFoundError("role_scope_not_found");
    if (roleScope.state !== "draft") throw new FellowshipStateError("role_scope_not_draft");
    if (roleScope.createdByPersonId === actor.personId) throw new FellowshipSeparationOfDutiesError();
    await transaction.update(fellowshipRoleScopes).set({
      state: "approved", approvedByPersonId: actor.personId, approvedAt: now,
    }).where(eq(fellowshipRoleScopes.id, roleScopeId));
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: "fellowship.role-scope.approved",
      target: roleScopeId, timestamp: now, pseudonymized: false,
      sessionId: actor.sessionId, requestId: context.requestId,
      capability: "fellowship.role-scope.approve", reasonCode: context.reasonCode,
    });
    return { ...roleScope, state: "approved" as const, approvedByPersonId: actor.personId, approvedAt: now };
  });
}

async function submitCandidacy(
  db: Database,
  actor: AuthenticatedActor,
  input: { candidatePersonId: string; roleScopeId: string; rationale: string; evidence: EvidenceInput[] },
  sourceType: "nomination" | "application",
  now: Date
) {
  const evidence = cleanEvidence(input.evidence);
  const rationale = cleanText(input.rationale, "rationale_required");
  return db.transaction(async (transaction) => {
    const [roleScope] = await transaction.select({ id: fellowshipRoleScopes.id, state: fellowshipRoleScopes.state })
      .from(fellowshipRoleScopes).where(eq(fellowshipRoleScopes.id, input.roleScopeId)).limit(1);
    if (!roleScope) throw new FellowshipNotFoundError("role_scope_not_found");
    if (roleScope.state !== "approved") throw new FellowshipStateError("role_scope_not_approved");
    const [candidate] = await transaction.select({ id: people.id }).from(people)
      .where(eq(people.id, input.candidatePersonId)).limit(1);
    if (!candidate) throw new FellowshipNotFoundError("candidate_not_found");
    const [existing] = await transaction.select({ id: fellowshipCandidacies.id }).from(fellowshipCandidacies)
      .where(and(
        eq(fellowshipCandidacies.candidatePersonId, input.candidatePersonId),
        eq(fellowshipCandidacies.roleScopeId, input.roleScopeId),
        inArray(fellowshipCandidacies.status, [...OPEN_CANDIDACY_STATES])
      )).limit(1);
    if (existing) throw new FellowshipStateError("open_candidacy_exists");
    const candidacy = {
      id: createId(), candidatePersonId: input.candidatePersonId, sourceType,
      submittedByPersonId: actor.personId, roleScopeId: input.roleScopeId,
      rationale, status: "submitted" as const, submittedAt: now,
      enteredReviewAt: null, decidedAt: null, decidedByPersonId: null,
      decisionReason: null, memberFacingReason: null,
    };
    await transaction.insert(fellowshipCandidacies).values(candidacy);
    await transaction.insert(fellowshipEvidenceRefs).values(evidence.map((item) => ({
      id: createId(), candidacyId: candidacy.id, ...item,
      addedByPersonId: actor.personId, createdAt: now,
    })));
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: `fellowship.${sourceType}.submitted`,
      target: candidacy.id, timestamp: now, pseudonymized: false,
    });
    return candidacy;
  });
}

export async function submitFellowshipNomination(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { candidatePersonId: string; roleScopeId: string; rationale: string; evidence: EvidenceInput[] },
  now = new Date()
) {
  requireStaff(actor, "fellowship.nomination.submit", FELLOWSHIP_SCOPE);
  if (input.candidatePersonId === actor.personId) throw new FellowshipSeparationOfDutiesError();
  return submitCandidacy(db, actor, input, "nomination", now);
}

export async function submitFellowshipApplication(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { roleScopeId: string; rationale: string; evidence: EvidenceInput[] },
  now = new Date()
) {
  requireSelf(actor, "fellowship.application.self", input.roleScopeId);
  return submitCandidacy(db, actor, { ...input, candidatePersonId: actor.personId }, "application", now);
}

export async function withdrawFellowshipApplication(
  db: Database,
  actor: AuthenticatedActor | null,
  candidacyId: string,
  now = new Date()
) {
  requireSelf(actor, "fellowship.application.self", candidacyId);
  return db.transaction(async (transaction) => {
    const [candidacy] = await transaction.select().from(fellowshipCandidacies)
      .where(and(eq(fellowshipCandidacies.id, candidacyId), eq(fellowshipCandidacies.candidatePersonId, actor.personId))).limit(1);
    if (!candidacy || candidacy.sourceType !== "application") throw new FellowshipNotFoundError("application_not_found");
    if (isFellowshipCandidacyFinal(candidacy.status)) throw new FellowshipStateError("application_final");
    await transaction.update(fellowshipCandidacies).set({ status: "withdrawn", decidedAt: now })
      .where(eq(fellowshipCandidacies.id, candidacyId));
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: "fellowship.application.withdrawn",
      target: candidacyId, timestamp: now, pseudonymized: false,
    });
    return { ...candidacy, status: "withdrawn" as const, decidedAt: now };
  });
}

export async function assignFellowshipReviewer(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { candidacyId: string; reviewerPersonId: string },
  now = new Date()
) {
  requireStaff(actor, "fellowship.review.assign", input.candidacyId);
  return db.transaction(async (transaction) => {
    const [candidacy] = await transaction.select().from(fellowshipCandidacies)
      .where(eq(fellowshipCandidacies.id, input.candidacyId)).limit(1);
    if (!candidacy) throw new FellowshipNotFoundError("candidacy_not_found");
    if (!mayEnterFellowshipReview(candidacy.status)) throw new FellowshipStateError("candidacy_not_reviewable");
    if ([candidacy.candidatePersonId, candidacy.submittedByPersonId].includes(input.reviewerPersonId)) {
      throw new FellowshipSeparationOfDutiesError();
    }
    const assignment = {
      id: createId(), candidacyId: candidacy.id, reviewerPersonId: input.reviewerPersonId,
      assignedByPersonId: actor.personId, status: "assigned" as const,
      assignedAt: now, completedAt: null,
    };
    await transaction.insert(fellowshipReviewAssignments).values(assignment);
    await transaction.update(fellowshipCandidacies).set({ status: "under-review", enteredReviewAt: now })
      .where(eq(fellowshipCandidacies.id, candidacy.id));
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: "fellowship.review.assigned",
      target: assignment.id, timestamp: now, pseudonymized: false,
    });
    return assignment;
  });
}

export async function declareFellowshipConflict(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { assignmentId: string; hasConflict: boolean; declarationText: string },
  now = new Date()
) {
  return db.transaction(async (transaction) => {
    const [assignment] = await transaction.select().from(fellowshipReviewAssignments)
      .where(eq(fellowshipReviewAssignments.id, input.assignmentId)).limit(1);
    if (!assignment) throw new FellowshipNotFoundError("assignment_not_found");
    requireStaff(actor, "fellowship.review.declare-conflict", assignment.candidacyId);
    if (assignment.reviewerPersonId !== actor.personId) throw new FellowshipSeparationOfDutiesError();
    if (assignment.status !== "assigned") throw new FellowshipStateError("assignment_not_active");
    const declaration = {
      id: createId(), assignmentId: assignment.id, reviewerPersonId: actor.personId,
      hasConflict: input.hasConflict, declarationText: cleanText(input.declarationText, "declaration_required"), declaredAt: now,
    };
    await transaction.insert(fellowshipConflictDeclarations).values(declaration);
    if (input.hasConflict) {
      await transaction.update(fellowshipReviewAssignments).set({ status: "recused", completedAt: now })
        .where(eq(fellowshipReviewAssignments.id, assignment.id));
    }
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId,
      action: input.hasConflict ? "fellowship.review.recused" : "fellowship.review.conflict-cleared",
      target: assignment.id, timestamp: now, pseudonymized: false,
    });
    return declaration;
  });
}

export async function submitFellowshipReview(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { assignmentId: string; recommendation: FellowshipReviewRecommendation; rationale: string },
  now = new Date()
) {
  return db.transaction(async (transaction) => {
    const [assignment] = await transaction.select().from(fellowshipReviewAssignments)
      .where(eq(fellowshipReviewAssignments.id, input.assignmentId)).limit(1);
    if (!assignment) throw new FellowshipNotFoundError("assignment_not_found");
    requireStaff(actor, "fellowship.review.submit", assignment.candidacyId);
    if (assignment.reviewerPersonId !== actor.personId) throw new FellowshipSeparationOfDutiesError();
    if (assignment.status !== "assigned") throw new FellowshipStateError("assignment_not_active");
    const [declaration] = await transaction.select().from(fellowshipConflictDeclarations)
      .where(eq(fellowshipConflictDeclarations.assignmentId, assignment.id)).limit(1);
    if (!declaration || declaration.hasConflict) throw new FellowshipConflictError();
    const review = {
      id: createId(), assignmentId: assignment.id, reviewerPersonId: actor.personId,
      recommendation: input.recommendation, rationale: cleanText(input.rationale, "review_rationale_required"), reviewedAt: now,
    };
    await transaction.insert(fellowshipReviews).values(review);
    await transaction.update(fellowshipReviewAssignments).set({ status: "completed", completedAt: now })
      .where(eq(fellowshipReviewAssignments.id, assignment.id));
    if (input.recommendation === "more-information") {
      await transaction.update(fellowshipCandidacies).set({ status: "more-information-required" })
        .where(eq(fellowshipCandidacies.id, assignment.candidacyId));
    }
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: "fellowship.review.completed",
      target: review.id, timestamp: now, pseudonymized: false,
    });
    return review;
  });
}

export async function decideFellowshipCandidacy(
  db: Database,
  actor: AuthenticatedActor | null,
  input: {
    candidacyId: string;
    decision: "approve" | "reject";
    reason: string;
    memberFacingReason: string;
    sponsorPersonId?: string;
    reviewDueAt?: Date | null;
  },
  context: PrivilegedActionContext,
  now = new Date()
) {
  requireStaff(actor, "fellowship.decision.record", input.candidacyId, "recent-mfa", now);
  assertPrivilegedActionContext(context, ["fellowship-candidacy-decision"]);
  return db.transaction(async (transaction) => {
    const [candidacy] = await transaction.select().from(fellowshipCandidacies)
      .where(eq(fellowshipCandidacies.id, input.candidacyId)).limit(1);
    if (!candidacy) throw new FellowshipNotFoundError("candidacy_not_found");
    if (candidacy.status !== "under-review") throw new FellowshipStateError("candidacy_not_decidable");
    if ([candidacy.candidatePersonId, candidacy.submittedByPersonId].includes(actor.personId)) {
      throw new FellowshipSeparationOfDutiesError();
    }
    const completedAssignments = await transaction.select({
      reviewerPersonId: fellowshipReviewAssignments.reviewerPersonId,
      recommendation: fellowshipReviews.recommendation,
    }).from(fellowshipReviewAssignments)
      .innerJoin(fellowshipReviews, eq(fellowshipReviews.assignmentId, fellowshipReviewAssignments.id))
      .where(and(eq(fellowshipReviewAssignments.candidacyId, candidacy.id), eq(fellowshipReviewAssignments.status, "completed")));
    if (!completedAssignments.length) throw new FellowshipStateError("completed_review_required");
    if (completedAssignments.some((item) => item.reviewerPersonId === actor.personId)) {
      throw new FellowshipSeparationOfDutiesError();
    }
    if (input.decision === "approve" && !completedAssignments.some((item) => item.recommendation === "approve")) {
      throw new FellowshipStateError("approval_review_required");
    }
    const status = input.decision === "approve" ? "approved" as const : "rejected" as const;
    await transaction.update(fellowshipCandidacies).set({
      status, decidedAt: now, decidedByPersonId: actor.personId,
      decisionReason: cleanText(input.reason, "decision_reason_required"),
      memberFacingReason: cleanText(input.memberFacingReason, "member_reason_required"),
    }).where(eq(fellowshipCandidacies.id, candidacy.id));
    let fellowship = null;
    if (status === "approved") {
      const sponsorPersonId = input.sponsorPersonId ?? actor.personId;
      if (sponsorPersonId === candidacy.candidatePersonId) throw new FellowshipSeparationOfDutiesError();
      fellowship = {
        id: createId(), personId: candidacy.candidatePersonId, roleScopeId: candidacy.roleScopeId,
        candidacyId: candidacy.id, sponsorPersonId, status: "active" as const,
        startsAt: now, reviewDueAt: input.reviewDueAt ?? null, endedAt: null,
      };
      await transaction.insert(fellowshipRecords).values(fellowship);
    }
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: `fellowship.candidacy.${status}`,
      target: candidacy.id, timestamp: now, pseudonymized: false,
      sessionId: actor.sessionId, requestId: context.requestId,
      capability: "fellowship.decision.record", reasonCode: context.reasonCode,
    });
    return { candidacy: { ...candidacy, status, decidedAt: now, decidedByPersonId: actor.personId }, fellowship };
  });
}

export async function changeFellowshipStatus(
  db: Database,
  actor: AuthenticatedActor | null,
  input: { fellowshipId: string; toStatus: FellowshipRecordStatus; reason: string },
  context: PrivilegedActionContext,
  now = new Date()
) {
  requireStaff(actor, "fellowship.status.manage", input.fellowshipId, "recent-mfa", now);
  assertPrivilegedActionContext(context, ["fellowship-status-change"]);
  return db.transaction(async (transaction) => {
    const [record] = await transaction.select().from(fellowshipRecords)
      .where(eq(fellowshipRecords.id, input.fellowshipId)).limit(1);
    if (!record) throw new FellowshipNotFoundError("fellowship_not_found");
    if (record.personId === actor.personId || !mayTransitionFellowshipRecord(record.status, input.toStatus)) {
      throw record.personId === actor.personId ? new FellowshipSeparationOfDutiesError() : new FellowshipStateError("invalid_status_transition");
    }
    const endedAt = input.toStatus === "ended" ? now : null;
    await transaction.update(fellowshipRecords).set({ status: input.toStatus, endedAt })
      .where(eq(fellowshipRecords.id, record.id));
    await transaction.insert(fellowshipStatusChanges).values({
      id: createId(), fellowshipId: record.id, fromStatus: record.status,
      toStatus: input.toStatus, reason: cleanText(input.reason),
      changedByPersonId: actor.personId, changedAt: now,
    });
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: "fellowship.status.changed",
      target: record.id, timestamp: now, pseudonymized: false,
      sessionId: actor.sessionId, requestId: context.requestId,
      capability: "fellowship.status.manage", reasonCode: context.reasonCode,
    });
    return { ...record, status: input.toStatus, endedAt };
  });
}

export async function getSelfFellowshipDashboard(
  db: Database,
  actor: AuthenticatedActor | null,
  locale: FellowshipLocale
) {
  if (!actor) throw new FellowshipAuthenticationError();
  requireSelf(actor, "fellowship.dashboard.self", actor.personId);
  const candidacies = await db.select({
    id: fellowshipCandidacies.id, sourceType: fellowshipCandidacies.sourceType,
    status: fellowshipCandidacies.status, submittedAt: fellowshipCandidacies.submittedAt,
    memberFacingReason: fellowshipCandidacies.memberFacingReason,
    roleLabels: fellowshipRoleScopes.labels,
  }).from(fellowshipCandidacies)
    .innerJoin(fellowshipRoleScopes, eq(fellowshipRoleScopes.id, fellowshipCandidacies.roleScopeId))
    .where(eq(fellowshipCandidacies.candidatePersonId, actor.personId))
    .orderBy(desc(fellowshipCandidacies.submittedAt));
  const records = await db.select({
    id: fellowshipRecords.id, status: fellowshipRecords.status, startsAt: fellowshipRecords.startsAt,
    reviewDueAt: fellowshipRecords.reviewDueAt, roleLabels: fellowshipRoleScopes.labels,
  }).from(fellowshipRecords)
    .innerJoin(fellowshipRoleScopes, eq(fellowshipRoleScopes.id, fellowshipRecords.roleScopeId))
    .where(eq(fellowshipRecords.personId, actor.personId));
  return {
    candidacies: candidacies.map((item) => ({ ...item, roleLabel: item.roleLabels[locale], roleLabels: undefined })),
    records: records.map((item) => ({ ...item, roleLabel: item.roleLabels[locale], roleLabels: undefined })),
  };
}

export async function getFellowshipOperationsOverview(
  db: Database,
  actor: AuthenticatedActor | null,
  now = new Date()
) {
  if (!isAuthorized(actor, {
    domain: "civic", capability: "fellowship.operations.read", target: FELLOWSHIP_SCOPE,
    requireExactTarget: true, minimumAssurance: "mfa", now,
  })) throw new FellowshipOperationsAuthorizationError();
  const candidacies = await db.select({
    id: fellowshipCandidacies.id, candidatePersonId: fellowshipCandidacies.candidatePersonId,
    candidateName: people.name, sourceType: fellowshipCandidacies.sourceType,
    roleScopeId: fellowshipCandidacies.roleScopeId, status: fellowshipCandidacies.status,
    submittedAt: fellowshipCandidacies.submittedAt,
  }).from(fellowshipCandidacies)
    .innerJoin(people, eq(people.id, fellowshipCandidacies.candidatePersonId))
    .orderBy(desc(fellowshipCandidacies.submittedAt));
  const roleScopes = await db.select().from(fellowshipRoleScopes).orderBy(fellowshipRoleScopes.slug);
  const assignments = await db.select({
    id: fellowshipReviewAssignments.id,
    candidacyId: fellowshipReviewAssignments.candidacyId,
    reviewerPersonId: fellowshipReviewAssignments.reviewerPersonId,
    status: fellowshipReviewAssignments.status,
    assignedAt: fellowshipReviewAssignments.assignedAt,
  }).from(fellowshipReviewAssignments).orderBy(desc(fellowshipReviewAssignments.assignedAt));
  const records = await db.select({
    id: fellowshipRecords.id,
    personId: fellowshipRecords.personId,
    roleScopeId: fellowshipRecords.roleScopeId,
    status: fellowshipRecords.status,
    startsAt: fellowshipRecords.startsAt,
    reviewDueAt: fellowshipRecords.reviewDueAt,
  }).from(fellowshipRecords).orderBy(desc(fellowshipRecords.startsAt));
  return { candidacies, roleScopes, assignments, records };
}

export async function listApprovedFellowshipRoleScopes(locale: FellowshipLocale, db: Database) {
  const roles = await db.select({
    id: fellowshipRoleScopes.id,
    slug: fellowshipRoleScopes.slug,
    labels: fellowshipRoleScopes.labels,
    responsibilities: fellowshipRoleScopes.responsibilities,
  }).from(fellowshipRoleScopes).where(eq(fellowshipRoleScopes.state, "approved"));
  return roles.map((role) => ({
    id: role.id,
    slug: role.slug,
    label: role.labels[locale],
    responsibilities: role.responsibilities,
  }));
}

export class FellowshipValidationError extends Error {
  constructor(readonly code: string) { super(code); this.name = "FellowshipValidationError"; }
}
export class FellowshipNotFoundError extends Error {
  constructor(readonly code: string) { super(code); this.name = "FellowshipNotFoundError"; }
}
export class FellowshipStateError extends Error {
  constructor(readonly code: string) { super(code); this.name = "FellowshipStateError"; }
}
export class FellowshipSeparationOfDutiesError extends Error {
  readonly code = "separation_of_duties";
  constructor() { super("separation_of_duties"); this.name = "FellowshipSeparationOfDutiesError"; }
}
export class FellowshipConflictError extends Error {
  readonly code = "conflict_declaration_required";
  constructor() { super("conflict_declaration_required"); this.name = "FellowshipConflictError"; }
}
export class FellowshipAuthenticationError extends Error {
  constructor() { super("authentication_required"); this.name = "FellowshipAuthenticationError"; }
}
export class FellowshipOperationsAuthorizationError extends Error {
  constructor() { super("forbidden"); this.name = "FellowshipOperationsAuthorizationError"; }
}
