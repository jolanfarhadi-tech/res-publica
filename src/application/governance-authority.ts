import { and, eq, isNull } from "drizzle-orm";
import { createId } from "../domain/shared";
import type { AuthenticatedActor } from "../auth/types";
import { authorizationGrants, auditLog, people } from "../persistence/schema";
import type { Database } from "../persistence";
import {
  assertPrivilegedActionContext,
  type PrivilegedActionContext,
} from "../platform/privileged-access";
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
  reasonCode: PrivilegedActionContext["reasonCode"];
  requestId: string;
}) {
  requireInstitutionAdmin(actor, input.institutionId, "recent-mfa");
  assertPrivilegedActionContext(input, [
    "operational-role-assignment",
    "duty-reassignment",
  ]);
  assertOperationalDelegation({ actorPersonId: actor.personId, ...input });
  const [person] = await db.select({ id: people.id }).from(people).where(eq(people.id, input.granteePersonId)).limit(1);
  if (!person) throw new GovernanceGrantError("grantee_not_found");
  const now = new Date();
  if (input.validUntil !== null) {
    if (!Number.isFinite(input.validUntil.getTime())) throw new GovernanceGrantError("grant_expiry_invalid");
    if (input.validUntil <= now) throw new GovernanceGrantError("grant_expiry_must_be_future");
  }
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
      sessionId: actor.sessionId, requestId: input.requestId,
      capability: grant.capability, reasonCode: input.reasonCode,
    });
  });
  return grant;
}

export async function revokeGovernanceRole(db: Database, actor: AuthenticatedActor | null, input: {
  grantId: string;
  institutionId: string;
  reasonCode: PrivilegedActionContext["reasonCode"];
  requestId: string;
}) {
  requireInstitutionAdmin(actor, input.institutionId, "recent-mfa");
  assertPrivilegedActionContext(input, [
    "scheduled-access-review",
    "duty-reassignment",
  ]);
  return db.transaction(async (transaction) => {
    const [grant] = await transaction.select().from(authorizationGrants).where(and(
      eq(authorizationGrants.id, input.grantId), eq(authorizationGrants.domain, "governance"),
      eq(authorizationGrants.target, input.institutionId), isNull(authorizationGrants.revokedAt),
    )).limit(1).for("update");
    if (!grant) throw new GovernanceGrantError("grant_not_found");
    if (grant.personId === actor.personId) throw new GovernanceGrantError("self_revocation_forbidden");
    if (grant.capability === governanceCapability("institution-admin")) {
      throw new GovernanceGrantError("admin_revocation_founder_only");
    }
    const revokedAt = new Date();
    const [revoked] = await transaction.update(authorizationGrants).set({ revokedAt }).where(and(
      eq(authorizationGrants.id, grant.id), isNull(authorizationGrants.revokedAt),
    )).returning({ id: authorizationGrants.id });
    if (!revoked) throw new GovernanceGrantError("grant_not_found");
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: "governance.role-revoked",
      target: `authorization-grant:${grant.id}`, timestamp: revokedAt, pseudonymized: false,
      sessionId: actor.sessionId, requestId: input.requestId,
      capability: grant.capability, reasonCode: input.reasonCode,
    });
    return { ...grant, revokedAt };
  });
}

export class GovernanceGrantError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "GovernanceGrantError";
  }
}
