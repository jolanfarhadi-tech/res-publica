import { eq } from "drizzle-orm";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import { applyBasicValidation, transitionHarmCase } from "../modules/harm-governance/workflow";
import { requireGovernanceRole } from "../modules/harm-governance/authority";
import type { BasicValidationStatus, ConfidentialityLevel, HarmCase } from "../modules/harm-governance/types";
import type { Database } from "../persistence";
import { auditLog } from "../persistence/schema";
import { basicValidationDecisions, harmCases, harmEvidenceItems } from "../persistence/module-schema";

export async function registerHarmCase(db: Database, actor: AuthenticatedActor | null, input: {
  institutionId: string; location: string; harmCategory: string; description: string;
  affectedGroups: string[]; allegedResponsibleActors: string[]; sourceType: string;
  reporterPersonId: string | null; confidentialityLevel: ConfidentialityLevel;
}) {
  requireGovernanceRole(actor, "intake-moderator", input.institutionId);
  const now = new Date();
  const registered: HarmCase = { id: createId(), ...input, reportedAt: now, status: "registered" };
  const harmCase = transitionHarmCase(registered, "evidence-collection");
  await db.transaction(async (transaction) => {
    await transaction.insert(harmCases).values(harmCase);
    await transaction.insert(auditLog).values({ id: createId(), actorPersonId: actor.personId,
      action: "governance.harm-case-registered", target: `harm-case:${harmCase.id}`,
      timestamp: now, pseudonymized: false });
  });
  return harmCase;
}

export async function addHarmEvidence(db: Database, actor: AuthenticatedActor | null, input: {
  caseId: string; description: string; source: string; mediaType: string; storageReference: string;
}) {
  return db.transaction(async (transaction) => {
    const [harmCase] = await transaction.select().from(harmCases).where(eq(harmCases.id, input.caseId)).limit(1).for("update");
    if (!harmCase) throw new HarmGovernanceError("case_not_found");
    requireGovernanceRole(actor, "intake-moderator", harmCase.institutionId);
    if (harmCase.status !== "evidence-collection" && harmCase.status !== "information-requested") {
      throw new HarmGovernanceError("evidence_collection_closed");
    }
    const collectedAt = new Date();
    const evidence = { id: createId(), ...input, collectedAt };
    await transaction.insert(harmEvidenceItems).values(evidence);
    await transaction.insert(auditLog).values({ id: createId(), actorPersonId: actor.personId,
      action: "governance.evidence-added", target: `evidence:${evidence.id}`,
      timestamp: collectedAt, pseudonymized: false });
    return evidence;
  });
}

export async function submitCaseForValidation(db: Database, actor: AuthenticatedActor | null, caseId: string) {
  return db.transaction(async (transaction) => {
    const [row] = await transaction.select().from(harmCases).where(eq(harmCases.id, caseId)).limit(1).for("update");
    if (!row) throw new HarmGovernanceError("case_not_found");
    requireGovernanceRole(actor, "intake-moderator", row.institutionId);
    const updated = transitionHarmCase(row as HarmCase, row.status === "information-requested" ? "evidence-collection" : "validation-pending");
    const final = updated.status === "evidence-collection" ? transitionHarmCase(updated, "validation-pending") : updated;
    await transaction.update(harmCases).set({ status: final.status }).where(eq(harmCases.id, caseId));
    await transaction.insert(auditLog).values({ id: createId(), actorPersonId: actor.personId,
      action: "governance.case-submitted-for-validation", target: `harm-case:${caseId}`,
      timestamp: new Date(), pseudonymized: false });
    return final;
  });
}

export async function recordBasicValidation(db: Database, actor: AuthenticatedActor | null, input: {
  caseId: string; status: BasicValidationStatus; missingInformation: string[];
  duplicateOfCaseId: string | null; notes: string;
}) {
  return db.transaction(async (transaction) => {
    const [row] = await transaction.select().from(harmCases).where(eq(harmCases.id, input.caseId)).limit(1).for("update");
    if (!row) throw new HarmGovernanceError("case_not_found");
    requireGovernanceRole(actor, "validation-officer", row.institutionId);
    const decidedAt = new Date();
    const decision = { id: createId(), ...input, reviewerPersonId: actor.personId, decidedAt };
    const updated = applyBasicValidation(row as HarmCase, decision);
    await transaction.insert(basicValidationDecisions).values(decision);
    await transaction.update(harmCases).set({ status: updated.status }).where(eq(harmCases.id, input.caseId));
    await transaction.insert(auditLog).values({ id: createId(), actorPersonId: actor.personId,
      action: "governance.basic-validation-recorded", target: `harm-case:${input.caseId}`,
      timestamp: decidedAt, pseudonymized: false });
    return { decision, harmCase: updated };
  });
}

export class HarmGovernanceError extends Error {
  constructor(public readonly code: string) { super(code); this.name = "HarmGovernanceError"; }
}
