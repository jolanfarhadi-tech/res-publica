import type {
  AssuranceLevel,
  AuthenticatedActor,
  AuthorizationDomain,
  AuthorizationGrant,
} from "./types";

const assuranceRank: Record<AssuranceLevel, number> = {
  verified: 1,
  mfa: 2,
  "recent-mfa": 3,
};

export type AuthorizationRequest = {
  domain: AuthorizationDomain;
  capability: string;
  target?: string;
  minimumAssurance?: AssuranceLevel;
  now?: Date;
};

function isGrantActive(grant: AuthorizationGrant, now: Date): boolean {
  return grant.revokedAt === null && grant.validFrom <= now &&
    (grant.validUntil === null || grant.validUntil > now);
}

export function isAuthorized(
  actor: AuthenticatedActor | null,
  request: AuthorizationRequest
): actor is AuthenticatedActor {
  if (!actor) return false;
  const now = request.now ?? new Date();
  const minimumAssurance = request.minimumAssurance ?? "verified";
  if (assuranceRank[actor.assurance] < assuranceRank[minimumAssurance]) return false;

  return actor.grants.some((grant) =>
    grant.personId === actor.personId &&
    grant.domain === request.domain &&
    grant.capability === request.capability &&
    (grant.target === null || grant.target === request.target) &&
    assuranceRank[actor.assurance] >= assuranceRank[grant.assuranceRequired] &&
    isGrantActive(grant, now)
  );
}

export function requireAuthorization(
  actor: AuthenticatedActor | null,
  request: AuthorizationRequest
): asserts actor is AuthenticatedActor {
  if (!isAuthorized(actor, request)) {
    throw new AuthorizationDeniedError(request.domain, request.capability);
  }
}

export class AuthorizationDeniedError extends Error {
  constructor(domain: AuthorizationDomain, capability: string) {
    super(`Authorization denied for ${domain}:${capability}`);
    this.name = "AuthorizationDeniedError";
  }
}
