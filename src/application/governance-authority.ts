import { and, eq, isNull } from "drizzle-orm";
import { createId } from "../domain/shared";
import type { AuthenticatedActor } from "../auth/types";
import { authorizationGrants, auditLog, people } from "../persistence/schema";
import type { Database } from "../persistence";
import {
  assertOperationalDelegation,
  governanceCapability,
  requireInstitutionAdmin,
  type OperationalGovernanceRole,
} from "../modules/harm-governance/authority";

export async function grantGovernanceRole(db: Database, actor: AuthenticatedActor | null, input: {
  granteePersonId: string;
  institutionId: string;
  role: OperationalGovernanceRole;
  validUntil: Date | null;
}) {
  requireInstitutionAdmin(actor, input.institutionId);
  assertOperationalDelegation({ actorPersonId: actor.personId, ...input });
  const [person] = await db.select({ id: people.id }).from(people).where(eq(people.id, input.granteePersonId)).limit(1);
  if (!person) throw new GovernanceGrantError("grantee_not_found");
  const now = new Date();
  const grant = {
    id: createId(), personId: input.granteePersonId, domain: "governance" as const,
    capability: governanceCapability(input.role), target: input.institutionId,
    assuranceRequired: "mfa" as const, validFrom: now, validUntil: input.validUntil,
    grantedByPersonId: actor.personId, revokedAt: null,
  };
  await db.transaction(async (transaction) => {
    await transaction.insert(authorizationGrants).values(grant);
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: "governance.role-granted",
      target: `authorization-grant:${grant.id}`, timestamp: now, pseudonymized: false,
    });
  });
  return grant;
}

export async function revokeGovernanceRole(db: Database, actor: AuthenticatedActor | null, input: {
  grantId: string;
  institutionId: string;
}) {
  requireInstitutionAdmin(actor, input.institutionId);
  const [grant] = await db.select().from(authorizationGrants).where(and(
    eq(authorizationGrants.id, input.grantId), eq(authorizationGrants.domain, "governance"),
    eq(authorizationGrants.target, input.institutionId), isNull(authorizationGrants.revokedAt),
  )).limit(1);
  if (!grant) throw new GovernanceGrantError("grant_not_found");
  if (grant.personId === actor.personId) throw new GovernanceGrantError("self_revocation_forbidden");
  if (grant.capability === governanceCapability("institution-admin")) {
    throw new GovernanceGrantError("admin_revocation_founder_only");
  }
  const revokedAt = new Date();
  await db.transaction(async (transaction) => {
    await transaction.update(authorizationGrants).set({ revokedAt }).where(eq(authorizationGrants.id, grant.id));
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: "governance.role-revoked",
      target: `authorization-grant:${grant.id}`, timestamp: revokedAt, pseudonymized: false,
    });
  });
  return { ...grant, revokedAt };
}

export class GovernanceGrantError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "GovernanceGrantError";
  }
}
