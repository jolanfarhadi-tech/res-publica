import { requireAuthorization } from "../../auth/authorize";
import type { AuthenticatedActor } from "../../auth/types";

export const GOVERNANCE_ROLES = [
  "institution-admin", "intake-moderator", "validation-officer", "evidence-reviewer",
  "hearing-moderator", "quality-reviewer", "scientific-reviewer", "repair-coordinator",
] as const;
export type GovernanceRole = (typeof GOVERNANCE_ROLES)[number];
export type OperationalGovernanceRole = Exclude<GovernanceRole, "institution-admin">;

export function governanceCapability(role: GovernanceRole): string {
  return `governance.role.${role}`;
}

export function requireInstitutionAdmin(
  actor: AuthenticatedActor | null,
  institutionId: string,
): asserts actor is AuthenticatedActor {
  requireAuthorization(actor, {
    domain: "governance",
    capability: governanceCapability("institution-admin"),
    target: institutionId,
    minimumAssurance: "mfa",
  });
}

export function requireGovernanceRole(
  actor: AuthenticatedActor | null,
  role: OperationalGovernanceRole,
  institutionId: string,
): asserts actor is AuthenticatedActor {
  requireAuthorization(actor, {
    domain: "governance",
    capability: governanceCapability(role),
    target: institutionId,
    minimumAssurance: "mfa",
  });
}

export function assertOperationalDelegation(input: {
  actorPersonId: string;
  granteePersonId: string;
  role: GovernanceRole;
  institutionId: string;
}) {
  if (!input.institutionId) throw new GovernanceDelegationError("institution_scope_required");
  if (input.actorPersonId === input.granteePersonId) throw new GovernanceDelegationError("self_grant_forbidden");
  if (input.role === "institution-admin") throw new GovernanceDelegationError("admin_grant_founder_only");
}

export class GovernanceDelegationError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "GovernanceDelegationError";
  }
}
