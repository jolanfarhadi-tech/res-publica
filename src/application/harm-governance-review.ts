import { and, eq } from "drizzle-orm";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import { requireGovernanceRole } from "../modules/harm-governance/authority";
import { applyScientificReview, createRepairPlan, documentStructuredHearing, transitionHarmCase, verifyEvidenceAssessment } from "../modules/harm-governance/workflow";
import type { DocumentationQualityOutcome, EvidenceQualityCriterion, HarmCase, HearingQualityOutcome, ScientificReviewOutput } from "../modules/harm-governance/types";
import type { Database } from "../persistence";
import { auditLog } from "../persistence/schema";
import { documentationQualityReviews, evidenceQualityAssessments, harmCases, harmEvidenceItems, hearingQualityReviews, repairPlans, scientificReviews, structuredHearings } from "../persistence/module-schema";

async function appendAudit(transaction: Parameters<Parameters<Database["transaction"]>[0]>[0], actorPersonId: string, action: string, target: string, timestamp: Date) {
  await transaction.insert(auditLog).values({ id: createId(), actorPersonId, action, target, timestamp, pseudonymized: false });
}

export async function assessEvidenceQuality(db: Database, actor: AuthenticatedActor | null, input: {
  evidenceItemId: string; satisfiedCriteria: EvidenceQualityCriterion[]; contradictions: string[];
  corroboratingEvidenceItemIds: string[]; confidence: "very-low" | "low" | "moderate" | "high" | "very-high";
}) {
  return db.transaction(async (transaction) => {
    const [row] = await transaction.select({ evidence: harmEvidenceItems, harmCase: harmCases }).from(harmEvidenceItems)
      .innerJoin(harmCases, eq(harmEvidenceItems.caseId, harmCases.id)).where(eq(harmEvidenceItems.id, input.evidenceItemId)).limit(1);
    if (!row) throw new GovernanceReviewError("evidence_not_found");
    requireGovernanceRole(actor, "evidence-reviewer", row.harmCase.institutionId);
    const reviewedAt = new Date();
    const assessment = verifyEvidenceAssessment({ id: createId(), ...input, reviewerPersonId: actor.personId, reviewedAt });
    await transaction.insert(evidenceQualityAssessments).values(assessment);
    await appendAudit(transaction, actor.personId, "governance.evidence-quality-assessed", `evidence:${input.evidenceItemId}`, reviewedAt);
    return assessment;
  });
}

export async function reviewDocumentation(db: Database, actor: AuthenticatedActor | null, input: {
  caseId: string; artifactReference: string; outcome: DocumentationQualityOutcome; findings: string[];
}) {
  return db.transaction(async (transaction) => {
    const [harmCase] = await transaction.select().from(harmCases).where(eq(harmCases.id, input.caseId)).limit(1);
    if (!harmCase) throw new GovernanceReviewError("case_not_found");
    requireGovernanceRole(actor, "quality-reviewer", harmCase.institutionId);
    const reviewedAt = new Date();
    const review = { id: createId(), ...input, reviewerPersonId: actor.personId, reviewedAt };
    await transaction.insert(documentationQualityReviews).values(review);
    await appendAudit(transaction, actor.personId, "governance.documentation-quality-reviewed", `harm-case:${input.caseId}`, reviewedAt);
    return review;
  });
}

export async function recordStructuredHearing(db: Database, actor: AuthenticatedActor | null, input: {
  caseId: string; participantConsentConfirmedAt: Date; reportReference: string;
}) {
  return db.transaction(async (transaction) => {
    const [row] = await transaction.select().from(harmCases).where(eq(harmCases.id, input.caseId)).limit(1).for("update");
    if (!row) throw new GovernanceReviewError("case_not_found");
    requireGovernanceRole(actor, "hearing-moderator", row.institutionId);
    const documentedAt = new Date();
    const hearing = { id: createId(), ...input, moderatorPersonId: actor.personId, documentedAt };
    const updated = documentStructuredHearing(row as HarmCase, hearing);
    await transaction.insert(structuredHearings).values(hearing);
    await transaction.update(harmCases).set({ status: updated.status }).where(eq(harmCases.id, row.id));
    await appendAudit(transaction, actor.personId, "governance.hearing-documented", `hearing:${hearing.id}`, documentedAt);
    return { hearing, harmCase: updated };
  });
}

export async function reviewHearingQuality(db: Database, actor: AuthenticatedActor | null, input: {
  hearingId: string; outcome: HearingQualityOutcome; recommendations: string[];
}) {
  return db.transaction(async (transaction) => {
    const [row] = await transaction.select({ hearing: structuredHearings, harmCase: harmCases }).from(structuredHearings)
      .innerJoin(harmCases, eq(structuredHearings.caseId, harmCases.id)).where(eq(structuredHearings.id, input.hearingId)).limit(1).for("update", { of: harmCases });
    if (!row) throw new GovernanceReviewError("hearing_not_found");
    requireGovernanceRole(actor, "quality-reviewer", row.harmCase.institutionId);
    if (row.hearing.moderatorPersonId === actor.personId) throw new GovernanceReviewError("moderator_self_review_forbidden");
    const reviewedAt = new Date();
    const review = { id: createId(), ...input, reviewerPersonId: actor.personId, reviewedAt };
    await transaction.insert(hearingQualityReviews).values(review);
    let updated = row.harmCase as HarmCase;
    if (input.outcome === "approved" || input.outcome === "approved-with-recommendations") {
      updated = transitionHarmCase(updated, "scientific-review-pending");
      await transaction.update(harmCases).set({ status: updated.status }).where(eq(harmCases.id, updated.id));
    }
    await appendAudit(transaction, actor.personId, "governance.hearing-quality-reviewed", `hearing:${input.hearingId}`, reviewedAt);
    return { review, harmCase: updated };
  });
}

export async function recordScientificReview(db: Database, actor: AuthenticatedActor | null, input: {
  caseId: string; conflictDeclarationsComplete: boolean; methodologyAssessment: string;
  evidenceAssessment: string; findings: string; scientificConfidence: 1 | 2 | 3 | 4 | 5;
  recommendations: string[]; output: ScientificReviewOutput;
}) {
  return db.transaction(async (transaction) => {
    const [row] = await transaction.select().from(harmCases).where(eq(harmCases.id, input.caseId)).limit(1).for("update");
    if (!row) throw new GovernanceReviewError("case_not_found");
    requireGovernanceRole(actor, "scientific-reviewer", row.institutionId);
    if (!input.conflictDeclarationsComplete) throw new GovernanceReviewError("conflict_declaration_required");
    const decidedAt = new Date();
    const review = { id: createId(), ...input, reviewerPersonIds: [actor.personId], decidedAt };
    const updated = applyScientificReview(row as HarmCase, review);
    await transaction.insert(scientificReviews).values(review);
    if (updated.status !== row.status) await transaction.update(harmCases).set({ status: updated.status }).where(eq(harmCases.id, row.id));
    await appendAudit(transaction, actor.personId, "governance.scientific-review-recorded", `scientific-review:${review.id}`, decidedAt);
    return { review, harmCase: updated };
  });
}

export async function createHumanRepairPlan(db: Database, actor: AuthenticatedActor | null, input: {
  caseId: string; approvedScientificReviewId: string; objectives: string[]; expectedOutcomes: string[];
  responsibleActors: string[]; requiredResources: string[]; timeline: string; successIndicators: string[];
  monitoringMethods: string[]; risks: string[]; dependencies: string[];
}) {
  return db.transaction(async (transaction) => {
    const [row] = await transaction.select().from(harmCases).where(eq(harmCases.id, input.caseId)).limit(1);
    if (!row) throw new GovernanceReviewError("case_not_found");
    requireGovernanceRole(actor, "repair-coordinator", row.institutionId);
    const [approval] = await transaction.select().from(scientificReviews).where(and(
      eq(scientificReviews.id, input.approvedScientificReviewId), eq(scientificReviews.caseId, input.caseId),
    )).limit(1);
    if (!approval || !["accepted", "accepted-with-minor-revisions"].includes(approval.output)) throw new GovernanceReviewError("accepted_scientific_review_required");
    const createdAt = new Date();
    const plan = createRepairPlan(row as HarmCase, { id: createId(), ...input, createdByPersonId: actor.personId, createdAt });
    const { id, caseId, approvedScientificReviewId, createdByPersonId, createdAt: at, ...planFields } = plan;
    await transaction.insert(repairPlans).values({ id, caseId, approvedScientificReviewId, plan: planFields, createdByPersonId, createdAt: at });
    await appendAudit(transaction, actor.personId, "governance.repair-plan-created", `repair-plan:${id}`, createdAt);
    return plan;
  });
}

export class GovernanceReviewError extends Error {
  constructor(public readonly code: string) { super(code); this.name = "GovernanceReviewError"; }
}
