import { and, desc, eq, gt, inArray, isNull, lte, or } from "drizzle-orm";
import { isAuthorized } from "../auth/authorize";
import type {
  AssuranceLevel,
  AuthenticatedActor,
  AuthorizationGrant,
} from "../auth/types";
import {
  EDITORIAL_ROLES,
  editorialCapability,
  type EditorialRole,
  type OperationalEditorialRole,
} from "../modules/publishing/authority";
import {
  GOVERNANCE_ROLES,
  governanceCapability,
  type OperationalGovernanceRole,
} from "../modules/harm-governance/authority";
import type { Database } from "../persistence";
import { auditLog, authorizationGrants } from "../persistence/schema";
import {
  documentAcknowledgements,
  membershipApplications,
} from "../persistence/module-schema";

const MEMBERSHIP_DECISION_CAPABILITY = "membership.application.decide";
const INTEGRATED_OPERATIONAL_CAPABILITIES = {
  academy: { capability: "academy.operations.read", target: "academy" },
  fellowship: { capability: "fellowship.operations.read", target: "fellowship" },
  "knowledge-graph": {
    capability: "knowledge-graph.operations.read",
    target: "civic",
  },
  security: {
    capability: "security.operations.read",
    target: "security-operations",
  },
} as const;
export type OperationalArea =
  | "membership"
  | "publishing"
  | keyof typeof INTEGRATED_OPERATIONAL_CAPABILITIES;
const DECISION_ACTIONS = [
  "membership.application.approved",
  "membership.application.rejected",
] as const;

const assuranceRank: Record<AssuranceLevel, number> = {
  verified: 1,
  mfa: 2,
  "recent-mfa": 3,
};

function isActive(grant: AuthorizationGrant, now: Date) {
  return (
    grant.revokedAt === null &&
    grant.validFrom <= now &&
    (grant.validUntil === null || grant.validUntil > now)
  );
}

function operationalGrants(actor: AuthenticatedActor, now: Date) {
  const editorialCapabilities = new Set(
    EDITORIAL_ROLES.map((role) => editorialCapability(role))
  );
  return actor.grants.filter(
    (grant) =>
      grant.target !== null &&
      isActive(grant, now) &&
      ((grant.domain === "civic" &&
        (grant.capability === MEMBERSHIP_DECISION_CAPABILITY ||
          editorialCapabilities.has(grant.capability) ||
          Object.values(INTEGRATED_OPERATIONAL_CAPABILITIES).some(
            (requirement) =>
              grant.capability === requirement.capability &&
              grant.target === requirement.target
          ))) ||
        (grant.domain === "governance" &&
          grant.capability === governanceCapability("institution-admin")))
  );
}

function isGrantAuthorized(
  actor: AuthenticatedActor,
  grant: AuthorizationGrant,
  now: Date
) {
  if (grant.target === null) return false;
  return isAuthorized(
    { ...actor, grants: [grant] },
    {
      domain: grant.domain,
      capability: grant.capability,
      target: grant.target,
      requireExactTarget: true,
      minimumAssurance: "mfa",
      now,
    }
  );
}

function requireOperationalActor(
  actor: AuthenticatedActor | null,
  now: Date
): AuthenticatedActor {
  if (!actor) throw new OperationsAuthenticationError();
  const grants = operationalGrants(actor, now);
  if (!grants.length) throw new OperationsAuthorizationError();
  if (assuranceRank[actor.assurance] < assuranceRank.mfa) {
    throw new OperationsMfaRequiredError();
  }
  return actor;
}

export function canAccessOperations(
  actor: AuthenticatedActor | null,
  now = new Date()
) {
  if (!actor) return false;
  return operationalGrants(actor, now).some((grant) =>
    isGrantAuthorized(actor, grant, now)
  );
}

function authorizedMembershipGrant(
  actor: AuthenticatedActor,
  applicationId: string,
  now: Date
) {
  const grant = operationalGrants(actor, now)
    .filter(
      (candidate) =>
        candidate.capability === MEMBERSHIP_DECISION_CAPABILITY &&
        candidate.target === applicationId
    )
    .sort((left, right) => right.validFrom.getTime() - left.validFrom.getTime())
    .find((candidate) => isGrantAuthorized(actor, candidate, now));
  if (!grant) {
    const hasExactGrant = operationalGrants(actor, now).some(
      (candidate) =>
        candidate.capability === MEMBERSHIP_DECISION_CAPABILITY &&
        candidate.target === applicationId
    );
    if (hasExactGrant) throw new OperationsMfaRequiredError();
    throw new OperationsAuthorizationError();
  }
  return grant;
}

export async function getOperationsOverview(
  db: Database,
  actor: AuthenticatedActor | null,
  now = new Date(),
  requestedLimit = 100
) {
  const resolvedActor = requireOperationalActor(actor, now);
  const limit = Math.max(1, Math.min(100, Math.trunc(requestedLimit)));
  const grants = operationalGrants(resolvedActor, now);

  const membershipGrantByTarget = new Map<string, AuthorizationGrant>();
  for (const grant of grants) {
    if (
      grant.capability !== MEMBERSHIP_DECISION_CAPABILITY ||
      grant.target === null ||
      !isGrantAuthorized(resolvedActor, grant, now)
    ) {
      continue;
    }
    const current = membershipGrantByTarget.get(grant.target);
    if (!current || current.validFrom < grant.validFrom) {
      membershipGrantByTarget.set(grant.target, grant);
    }
  }

  const publishingByScope = new Map<string, Set<EditorialRole>>();
  for (const role of EDITORIAL_ROLES) {
    const capability = editorialCapability(role);
    for (const grant of grants) {
      if (
        grant.capability !== capability ||
        grant.target === null ||
        !isGrantAuthorized(resolvedActor, grant, now)
      ) {
        continue;
      }
      const roles = publishingByScope.get(grant.target) ?? new Set<EditorialRole>();
      roles.add(role);
      publishingByScope.set(grant.target, roles);
    }
  }

  const governanceInstitutions = grants
    .filter(
      (grant) =>
        grant.domain === "governance" &&
        grant.capability === governanceCapability("institution-admin") &&
        grant.target !== null &&
        isGrantAuthorized(resolvedActor, grant, now)
    )
    .map((grant) => grant.target as string)
    .filter((target, index, targets) => targets.indexOf(target) === index)
    .sort();
  const publishingAdministrationScopes = grants
    .filter(
      (grant) =>
        grant.domain === "civic" &&
        grant.capability === editorialCapability("publisher") &&
        grant.target !== null &&
        isGrantAuthorized(resolvedActor, grant, now)
    )
    .map((grant) => grant.target as string)
    .filter((target, index, targets) => targets.indexOf(target) === index)
    .sort();

  const managedTargets = [
    ...governanceInstitutions,
    ...publishingAdministrationScopes,
  ];
  const managedRows = managedTargets.length
    ? await db
        .select({
          grantId: authorizationGrants.id,
          personId: authorizationGrants.personId,
          domain: authorizationGrants.domain,
          capability: authorizationGrants.capability,
          target: authorizationGrants.target,
          validFrom: authorizationGrants.validFrom,
          validUntil: authorizationGrants.validUntil,
        })
        .from(authorizationGrants)
        .where(and(
          inArray(authorizationGrants.target, managedTargets),
          isNull(authorizationGrants.revokedAt),
          lte(authorizationGrants.validFrom, now),
          or(
            isNull(authorizationGrants.validUntil),
            gt(authorizationGrants.validUntil, now)
          )
        ))
    : [];
  const governanceOperationalCapabilities = new Map(
    GOVERNANCE_ROLES
      .filter((role): role is OperationalGovernanceRole => role !== "institution-admin")
      .map((role) => [governanceCapability(role), role])
  );
  const publishingOperationalCapabilities = new Map(
    EDITORIAL_ROLES
      .filter((role) => role !== "publisher")
      .map((role) => [editorialCapability(role), role])
  );
  type ActiveDelegation = {
    grantId: string;
    personId: string;
    domain: "governance" | "publishing";
    role: OperationalGovernanceRole | OperationalEditorialRole;
    target: string;
    validFrom: Date;
    validUntil: Date | null;
  };
  const activeDelegations: ActiveDelegation[] = [];
  for (const grant of managedRows) {
    if (
      grant.domain === "governance" &&
      grant.target !== null &&
      governanceInstitutions.includes(grant.target)
    ) {
      const role = governanceOperationalCapabilities.get(grant.capability);
      if (role) activeDelegations.push({
        grantId: grant.grantId,
        personId: grant.personId,
        domain: "governance",
        role,
        target: grant.target,
        validFrom: grant.validFrom,
        validUntil: grant.validUntil,
      });
      continue;
    }
    if (
      grant.domain === "civic" &&
      grant.target !== null &&
      publishingAdministrationScopes.includes(grant.target)
    ) {
      const role = publishingOperationalCapabilities.get(grant.capability);
      if (role) activeDelegations.push({
        grantId: grant.grantId,
        personId: grant.personId,
        domain: "publishing",
        role,
        target: grant.target,
        validFrom: grant.validFrom,
        validUntil: grant.validUntil,
      });
    }
  }
  activeDelegations.sort((left, right) =>
      left.domain.localeCompare(right.domain) ||
      left.target.localeCompare(right.target) ||
      left.role.localeCompare(right.role) ||
      left.personId.localeCompare(right.personId)
    );

  const operationalAreas = new Set<OperationalArea>();
  if (membershipGrantByTarget.size) operationalAreas.add("membership");
  if (publishingByScope.size) operationalAreas.add("publishing");
  for (const [area, requirement] of Object.entries(
    INTEGRATED_OPERATIONAL_CAPABILITIES
  ) as Array<
    [keyof typeof INTEGRATED_OPERATIONAL_CAPABILITIES, {
      capability: string;
      target: string;
    }]
  >) {
    if (
      grants.some(
        (grant) =>
          grant.capability === requirement.capability &&
          grant.target === requirement.target &&
          isGrantAuthorized(resolvedActor, grant, now)
      )
    ) {
      operationalAreas.add(area);
    }
  }

  const applicationIds = [...membershipGrantByTarget.keys()];
  const applications = applicationIds.length
    ? await db
        .select({
          id: membershipApplications.id,
          personId: membershipApplications.personId,
          givenName: membershipApplications.givenName,
          familyName: membershipApplications.familyName,
          requestedTier: membershipApplications.requestedTier,
          status: membershipApplications.status,
          submittedAt: membershipApplications.submittedAt,
          decidedAt: membershipApplications.decidedAt,
        })
        .from(membershipApplications)
        .where(inArray(membershipApplications.id, applicationIds))
        .orderBy(desc(membershipApplications.submittedAt))
        .limit(limit)
    : [];

  return {
    account: {
      assurance: resolvedActor.assurance,
      authenticatedAt: resolvedActor.authenticatedAt,
    },
    operationalAreas: [
      "membership",
      "publishing",
      "academy",
      "fellowship",
      "knowledge-graph",
      "security",
    ].filter((area): area is OperationalArea =>
      operationalAreas.has(area as OperationalArea)
    ),
    membershipApplications: applications
      .filter((application) => application.personId !== resolvedActor.personId)
      .map((application) => {
      const grant = membershipGrantByTarget.get(application.id)!;
      return {
        id: application.id,
        givenName: application.givenName,
        familyName: application.familyName,
        requestedTier: application.requestedTier,
        status: application.status,
        submittedAt: application.submittedAt,
        decidedAt: application.decidedAt,
        authority: {
          capability: MEMBERSHIP_DECISION_CAPABILITY,
          assuranceRequired: grant.assuranceRequired,
          assignedAt: grant.validFrom,
          validUntil: grant.validUntil,
        },
      };
    }),
    publishingScopes: [...publishingByScope.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([scope, roles]) => ({
        scope,
        roles: EDITORIAL_ROLES.filter((role) => roles.has(role)),
      })),
    authorityAdministration: {
      governanceInstitutions,
      publishingScopes: publishingAdministrationScopes,
      activeDelegations,
    },
  };
}

export async function getMembershipApplicationForOperations(
  db: Database,
  actor: AuthenticatedActor | null,
  applicationId: string,
  now = new Date()
) {
  const resolvedActor = requireOperationalActor(actor, now);
  const grant = authorizedMembershipGrant(resolvedActor, applicationId, now);

  const [application] = await db
    .select()
    .from(membershipApplications)
    .where(eq(membershipApplications.id, applicationId))
    .limit(1);
  if (!application) throw new OperationsApplicationNotFoundError();
  if (application.personId === resolvedActor.personId) {
    throw new OperationsSeparationOfDutiesError();
  }

  const [acknowledgements, decisionHistory] = await Promise.all([
    db
      .select({
        documentType: documentAcknowledgements.documentType,
        documentVersion: documentAcknowledgements.documentVersion,
        acknowledgedAt: documentAcknowledgements.acknowledgedAt,
      })
      .from(documentAcknowledgements)
      .where(
        and(
          eq(documentAcknowledgements.contextType, "membership-application"),
          eq(documentAcknowledgements.contextId, applicationId)
        )
      )
      .orderBy(
        documentAcknowledgements.acknowledgedAt,
        documentAcknowledgements.documentType
      ),
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        actorPersonId: auditLog.actorPersonId,
        timestamp: auditLog.timestamp,
      })
      .from(auditLog)
      .where(
        and(
          eq(auditLog.target, applicationId),
          inArray(auditLog.action, [...DECISION_ACTIONS])
        )
      )
      .orderBy(desc(auditLog.timestamp)),
  ]);

  return {
    application: {
      id: application.id,
      givenName: application.givenName,
      familyName: application.familyName,
      email: application.email,
      address: application.address,
      requestedTier: application.requestedTier,
      status: application.status,
      submittedAt: application.submittedAt,
      decidedAt: application.decidedAt,
      decidedByPersonId: application.decidedByPersonId,
      decisionAuditId: application.decisionAuditId,
      decisionAuditTimestamp: application.decisionAuditTimestamp,
    },
    acknowledgements,
    decisionHistory,
    authority: {
      capability: MEMBERSHIP_DECISION_CAPABILITY,
      assuranceRequired: grant.assuranceRequired,
      assignedAt: grant.validFrom,
      validUntil: grant.validUntil,
      exactTarget: applicationId,
    },
    canDecide: application.status === "application_pending",
  };
}

export class OperationsAuthenticationError extends Error {}
export class OperationsAuthorizationError extends Error {}
export class OperationsMfaRequiredError extends Error {}
export class OperationsApplicationNotFoundError extends Error {}
export class OperationsSeparationOfDutiesError extends Error {}
