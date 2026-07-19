import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, describe, expect, it } from "vitest";
import * as coreSchema from "../persistence/schema";
import * as moduleSchema from "../persistence/module-schema";
import { auditLog, organizations, people } from "../persistence/schema";
import type { Database } from "../persistence";
import type { AuthenticatedActor } from "../auth/types";
import { governanceCapability } from "../modules/harm-governance/authority";
import { addHarmEvidence, recordBasicValidation, registerHarmCase, submitCaseForValidation } from "./harm-governance";
import { assessEvidenceQuality, createHumanRepairPlan, recordScientificReview, recordStructuredHearing, reviewDocumentation, reviewHearingQuality } from "./harm-governance-review";

const directories: string[] = [];
afterEach(async () => Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))));

function actor(personId: string, role: "intake-moderator" | "validation-officer" | "evidence-reviewer" | "hearing-moderator" | "quality-reviewer" | "scientific-reviewer" | "repair-coordinator"): AuthenticatedActor {
  return { personId, sessionId: `session-${personId}`, authenticatedAt: new Date(), assurance: "mfa", grants: [{
    id: `grant-${personId}`, personId, domain: "governance", capability: governanceCapability(role),
    target: "institution-1", assuranceRequired: "mfa", validFrom: new Date(0), validUntil: null, revokedAt: null,
  }] };
}

describe("HARM application lifecycle", () => {
  it("persists scoped human intake and validation with audit evidence", async () => {
    const directory = await mkdtemp(join(tmpdir(), "res-publica-harm-"));
    directories.push(directory);
    const client = new PGlite(directory);
    const db = drizzle({ client, schema: { ...coreSchema, ...moduleSchema } });
    const serviceDb = db as unknown as Database;
    await migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
    const now = new Date();
    await db.insert(organizations).values({ id: "institution-1", name: "Institution", relationshipTypes: ["partner"], createdAt: now });
    await db.insert(people).values([
      { id: "intake-1", name: "Intake", contact: { email: "intake@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "validator-1", name: "Validator", contact: { email: "validator@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "evidence-1", name: "Evidence", contact: { email: "evidence@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "moderator-1", name: "Moderator", contact: { email: "moderator@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "quality-1", name: "Quality", contact: { email: "quality@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "scientist-1", name: "Scientist", contact: { email: "scientist@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
      { id: "repair-1", name: "Repair", contact: { email: "repair@example.org" }, locale: "de", rtlPreference: false, createdAt: now },
    ]);
    const harmCase = await registerHarmCase(serviceDb, actor("intake-1", "intake-moderator"), {
      institutionId: "institution-1", location: "Berlin", harmCategory: "procedural-failure",
      description: "Documented account", affectedGroups: ["residents"], allegedResponsibleActors: [],
      sourceType: "citizen", reporterPersonId: null, confidentialityLevel: "restricted",
    });
    const evidence = await addHarmEvidence(serviceDb, actor("intake-1", "intake-moderator"), {
      caseId: harmCase.id, description: "Document", source: "reporter", mediaType: "text/plain", storageReference: "restricted://evidence/1",
    });
    await submitCaseForValidation(serviceDb, actor("intake-1", "intake-moderator"), harmCase.id);
    const result = await recordBasicValidation(serviceDb, actor("validator-1", "validation-officer"), {
      caseId: harmCase.id, status: "valid", missingInformation: [], duplicateOfCaseId: null, notes: "Complete",
    });
    expect(result.harmCase.status).toBe("hearing-ready");
    expect(result.decision.reviewerPersonId).toBe("validator-1");
    await assessEvidenceQuality(serviceDb, actor("evidence-1", "evidence-reviewer"), {
      evidenceItemId: evidence.id, satisfiedCriteria: ["traceability", "relevance"], contradictions: [],
      corroboratingEvidenceItemIds: [], confidence: "moderate",
    });
    await reviewDocumentation(serviceDb, actor("quality-1", "quality-reviewer"), {
      caseId: harmCase.id, artifactReference: "restricted://case/report", outcome: "approved", findings: [],
    });
    const { hearing } = await recordStructuredHearing(serviceDb, actor("moderator-1", "hearing-moderator"), {
      caseId: harmCase.id, participantConsentConfirmedAt: new Date(), reportReference: "restricted://hearing/report",
    });
    const hqc = await reviewHearingQuality(serviceDb, actor("quality-1", "quality-reviewer"), {
      hearingId: hearing.id, outcome: "approved", recommendations: [],
    });
    expect(hqc.harmCase.status).toBe("scientific-review-pending");
    await expect(recordScientificReview(serviceDb, actor("scientist-1", "scientific-reviewer"), {
      caseId: harmCase.id, conflictDeclarationsComplete: false, methodologyAssessment: "Methods",
      evidenceAssessment: "Evidence", findings: "Findings", scientificConfidence: 3,
      recommendations: [], output: "accepted",
    })).rejects.toThrow("conflict_declaration_required");
    const scientific = await recordScientificReview(serviceDb, actor("scientist-1", "scientific-reviewer"), {
      caseId: harmCase.id, conflictDeclarationsComplete: true, methodologyAssessment: "Methods",
      evidenceAssessment: "Evidence", findings: "Findings", scientificConfidence: 3,
      recommendations: [], output: "accepted",
    });
    expect(scientific.review.reviewerPersonIds).toEqual(["scientist-1"]);
    const plan = await createHumanRepairPlan(serviceDb, actor("repair-1", "repair-coordinator"), {
      caseId: harmCase.id, approvedScientificReviewId: scientific.review.id, objectives: ["Repair"],
      expectedOutcomes: ["Improvement"], responsibleActors: ["Institution"], requiredResources: ["Staff"],
      timeline: "12 months", successIndicators: ["Outcome"], monitoringMethods: ["Quarterly review"], risks: [], dependencies: [],
    });
    expect(plan.createdByPersonId).toBe("repair-1");
    const actions = (await db.select().from(auditLog)).map((entry) => entry.action);
    expect(actions).toEqual(expect.arrayContaining([
      "governance.harm-case-registered", "governance.evidence-added",
      "governance.case-submitted-for-validation", "governance.basic-validation-recorded",
      "governance.evidence-quality-assessed", "governance.documentation-quality-reviewed",
      "governance.hearing-documented", "governance.hearing-quality-reviewed",
      "governance.scientific-review-recorded", "governance.repair-plan-created",
    ]));
    await client.close();
  }, 20_000);
});
