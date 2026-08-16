import { createHash } from "node:crypto";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { createId } from "../domain/shared";
import {
  buildTechnicalObservation,
  correlateIncidentSignals,
  assertPrivacySafeAttributionText,
  validateAttributionClaim,
  type AttributionClaimInput,
  type CorrelationSignal,
  type SecurityAsset,
  type TechnicalObservationInput,
} from "../modules/security-operations/attribution";
import type { Database } from "../persistence";
import {
  securityAttributionClaims,
  securityIncidentCorrelations,
  securityIncidents,
  securityObservations,
} from "../persistence/module-schema";
import { auditLog } from "../persistence/schema";

const INCIDENT_RECORD_CAPABILITY = "security.incident.record";
const ATTRIBUTION_RECORD_CAPABILITY = "security.attribution.record";
const ATTRIBUTION_CORRELATE_CAPABILITY = "security.attribution.correlate";
const SECURITY_OPERATIONS_READ_CAPABILITY = "security.operations.read";

function requireRecentMfa(
  actor: AuthenticatedActor | null,
  capability: string,
  target: string,
  now: Date
): asserts actor is AuthenticatedActor {
  requireAuthorization(actor, {
    domain: "governance",
    capability,
    target,
    requireExactTarget: true,
    minimumAssurance: "recent-mfa",
    now,
  });
}

function evidenceHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export async function createSecurityIncident(
  db: Database,
  actor: AuthenticatedActor | null,
  input: {
    id: string;
    title: string;
    severity: "low" | "moderate" | "high" | "critical";
    affectedAssets: SecurityAsset[];
    requestId: string;
    correlationSecret: string;
    observation: Omit<TechnicalObservationInput, "incidentId" | "correlationScope" | "correlationSecret">;
  }
) {
  const recordedAt = new Date();
  requireRecentMfa(actor, INCIDENT_RECORD_CAPABILITY, "security-operations", recordedAt);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,127}$/.test(input.id)) {
    throw new SecurityAttributionError("invalid_incident_id");
  }
  const title = input.title.trim();
  if (!title || title.length > 200) throw new SecurityAttributionError("invalid_incident_title");
  assertPrivacySafeAttributionText(title);
  const observation = buildTechnicalObservation({
    ...input.observation,
    incidentId: input.id,
    correlationScope: `security-day:${input.observation.observedAt.toISOString().slice(0, 10)}`,
    correlationSecret: input.correlationSecret,
  });
  if (
    [...new Set(input.affectedAssets)].sort().join("\u0000") !==
    [...observation.affectedAssets].sort().join("\u0000")
  ) {
    throw new SecurityAttributionError("affected_assets_mismatch");
  }
  const observationId = createId();

  return db.transaction(async (transaction) => {
    const [incident] = await transaction.insert(securityIncidents).values({
      id: input.id,
      title,
      severity: input.severity,
      status: "open",
      affectedAssets: input.affectedAssets,
      openedByPersonId: actor.personId,
      openedAt: recordedAt,
    }).returning();
    await transaction.insert(securityObservations).values({
      id: observationId,
      ...observation,
      evidenceHash: evidenceHash(observation),
      recordedByPersonId: actor.personId,
      recordedAt,
    });
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: "security.incident-recorded",
      target: `security-incident:${incident.id}`,
      sessionId: actor.sessionId,
      requestId: input.requestId,
      capability: INCIDENT_RECORD_CAPABILITY,
      reasonCode: "security-incident-recording",
      timestamp: recordedAt,
      pseudonymized: false,
    });
    return { ...incident, observationId };
  });
}

export async function createSecurityAttributionClaim(
  db: Database,
  actor: AuthenticatedActor | null,
  input: AttributionClaimInput & { incidentId: string; requestId: string }
) {
  const now = new Date();
  requireRecentMfa(actor, ATTRIBUTION_RECORD_CAPABILITY, input.incidentId, now);
  const claim = validateAttributionClaim(input);

  return db.transaction(async (transaction) => {
    const [incident] = await transaction.select({
      id: securityIncidents.id,
      openedByPersonId: securityIncidents.openedByPersonId,
    }).from(securityIncidents).where(eq(securityIncidents.id, input.incidentId)).limit(1).for("update");
    if (!incident) throw new SecurityAttributionError("incident_not_found");
    if (incident.openedByPersonId === actor.personId) {
      throw new SecurityAttributionError("separation_of_duties_required");
    }
    const evidence = await transaction.select({ id: securityObservations.id })
      .from(securityObservations)
      .where(and(
        eq(securityObservations.incidentId, input.incidentId),
        inArray(securityObservations.id, claim.observedEvidence)
      ));
    if (evidence.length !== new Set(claim.observedEvidence).size) {
      throw new SecurityAttributionError("observed_evidence_not_found");
    }
    const [saved] = await transaction.insert(securityAttributionClaims).values({
      id: createId(),
      incidentId: input.incidentId,
      level: claim.level,
      claim: claim.claim,
      observedEvidence: claim.observedEvidence,
      inferences: claim.inferences,
      contradictoryEvidence: claim.contradictoryEvidence,
      alternativeExplanations: claim.alternativeExplanations,
      confidence: claim.confidence,
      source: claim.source,
      authoredByPersonId: actor.personId,
      timestamp: claim.timestamp,
    }).returning();
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: "security.attribution-claim-recorded",
      target: `security-incident:${input.incidentId}`,
      sessionId: actor.sessionId,
      requestId: input.requestId,
      capability: ATTRIBUTION_RECORD_CAPABILITY,
      reasonCode: "security-attribution-review",
      timestamp: now,
      pseudonymized: false,
    });
    return saved;
  });
}

export async function createSecurityIncidentCorrelation(
  db: Database,
  actor: AuthenticatedActor | null,
  input: {
    leftIncidentId: string;
    rightIncidentId: string;
    matchingSignals: CorrelationSignal[];
    contradictorySignals: string[];
    requestId: string;
    reviewedAt: Date;
  }
) {
  const now = new Date();
  requireRecentMfa(actor, ATTRIBUTION_CORRELATE_CAPABILITY, input.leftIncidentId, now);
  const correlation = correlateIncidentSignals(input);
  const [leftIncidentId, rightIncidentId] = [
    correlation.leftIncidentId,
    correlation.rightIncidentId,
  ].sort();

  return db.transaction(async (transaction) => {
    const incidents = await transaction.select({
      id: securityIncidents.id,
      openedByPersonId: securityIncidents.openedByPersonId,
    }).from(securityIncidents).where(inArray(securityIncidents.id, [leftIncidentId, rightIncidentId])).for("update");
    if (incidents.length !== 2) throw new SecurityAttributionError("incident_not_found");
    if (incidents.some((incident) => incident.openedByPersonId === actor.personId)) {
      throw new SecurityAttributionError("separation_of_duties_required");
    }
    const [saved] = await transaction.insert(securityIncidentCorrelations).values({
      id: createId(),
      leftIncidentId,
      rightIncidentId,
      relation: correlation.relation,
      matchingSignals: correlation.matchingSignals,
      contradictorySignals: correlation.contradictorySignals,
      alternativeExplanations: correlation.alternativeExplanations,
      reviewedByPersonId: actor.personId,
      reviewedAt: correlation.reviewedAt,
    }).returning();
    await transaction.insert(auditLog).values({
      id: createId(),
      actorPersonId: actor.personId,
      action: "security.incident-correlation-recorded",
      target: `security-incidents:${leftIncidentId}:${rightIncidentId}`,
      sessionId: actor.sessionId,
      requestId: input.requestId,
      capability: ATTRIBUTION_CORRELATE_CAPABILITY,
      reasonCode: "security-attribution-review",
      timestamp: now,
      pseudonymized: false,
    });
    return saved;
  });
}

export async function getSecurityOperationsOverview(
  db: Database,
  actor: AuthenticatedActor | null,
  requestedLimit = 50,
  now = new Date()
) {
  requireAuthorization(actor, {
    domain: "governance",
    capability: SECURITY_OPERATIONS_READ_CAPABILITY,
    target: "security-operations",
    requireExactTarget: true,
    minimumAssurance: "mfa",
    now,
  });
  const limit = Math.max(1, Math.min(100, Math.trunc(requestedLimit)));
  const incidents = await db.select({
    id: securityIncidents.id,
    title: securityIncidents.title,
    severity: securityIncidents.severity,
    status: securityIncidents.status,
    affectedAssets: securityIncidents.affectedAssets,
    openedAt: securityIncidents.openedAt,
  }).from(securityIncidents).orderBy(desc(securityIncidents.openedAt)).limit(limit);
  const incidentIds = incidents.map((incident) => incident.id);
  const observations = incidentIds.length
    ? await db.select({
        id: securityObservations.id,
        incidentId: securityObservations.incidentId,
        observedAt: securityObservations.observedAt,
        source: securityObservations.source,
        sourceHandle: securityObservations.sourceHandle,
        sourcePort: securityObservations.sourcePort,
        actorHandle: securityObservations.actorHandle,
        sessionHandle: securityObservations.sessionHandle,
        apiCredentialHandle: securityObservations.apiCredentialHandle,
        routeSequence: securityObservations.routeSequence,
        userAgentFamily: securityObservations.userAgentFamily,
        protocol: securityObservations.protocol,
        tlsVersion: securityObservations.tlsVersion,
        techniques: securityObservations.techniques,
        affectedAssets: securityObservations.affectedAssets,
        evidenceHash: securityObservations.evidenceHash,
      }).from(securityObservations).where(inArray(securityObservations.incidentId, incidentIds))
    : [];
  const claims = incidentIds.length
    ? await db.select({
        id: securityAttributionClaims.id,
        incidentId: securityAttributionClaims.incidentId,
        level: securityAttributionClaims.level,
        claim: securityAttributionClaims.claim,
        observedEvidence: securityAttributionClaims.observedEvidence,
        inferences: securityAttributionClaims.inferences,
        contradictoryEvidence: securityAttributionClaims.contradictoryEvidence,
        alternativeExplanations: securityAttributionClaims.alternativeExplanations,
        confidence: securityAttributionClaims.confidence,
        source: securityAttributionClaims.source,
        timestamp: securityAttributionClaims.timestamp,
      }).from(securityAttributionClaims).where(inArray(securityAttributionClaims.incidentId, incidentIds))
    : [];
  const correlations = incidentIds.length
    ? await db.select({
        id: securityIncidentCorrelations.id,
        leftIncidentId: securityIncidentCorrelations.leftIncidentId,
        rightIncidentId: securityIncidentCorrelations.rightIncidentId,
        relation: securityIncidentCorrelations.relation,
        matchingSignals: securityIncidentCorrelations.matchingSignals,
        contradictorySignals: securityIncidentCorrelations.contradictorySignals,
        alternativeExplanations: securityIncidentCorrelations.alternativeExplanations,
        reviewedAt: securityIncidentCorrelations.reviewedAt,
      }).from(securityIncidentCorrelations).where(or(
        inArray(securityIncidentCorrelations.leftIncidentId, incidentIds),
        inArray(securityIncidentCorrelations.rightIncidentId, incidentIds)
      ))
    : [];

  return { incidents, observations, claims, correlations };
}

export class SecurityAttributionError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "SecurityAttributionError";
  }
}
