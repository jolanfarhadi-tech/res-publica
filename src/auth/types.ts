export type AssuranceLevel = "verified" | "mfa" | "recent-mfa";
export type AuthorizationDomain = "civic" | "governance";

export type AuthorizationGrant = {
  id: string;
  personId: string;
  domain: AuthorizationDomain;
  capability: string;
  target: string | null;
  assuranceRequired: AssuranceLevel;
  validFrom: Date;
  validUntil: Date | null;
  revokedAt: Date | null;
};

export type AuthenticatedActor = {
  personId: string;
  sessionId: string;
  authenticatedAt: Date;
  assurance: AssuranceLevel;
  grants: readonly AuthorizationGrant[];
};

export type ActorResolver = {
  resolve(request: Request): Promise<AuthenticatedActor | null>;
};
