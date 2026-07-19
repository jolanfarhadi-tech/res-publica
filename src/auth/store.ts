import { and, eq, gt, isNull, lte, or } from "drizzle-orm";
import type { Database } from "../persistence";
import { auditLog, authFlows, authIdentities, authSessions, authorizationGrants } from "../persistence/schema";
import type { AssuranceLevel, AuthenticatedActor, AuthorizationGrant } from "./types";

export async function saveAuthFlow(db: Database, flow: {
  stateHash: string; codeVerifier: string; nonce: string; returnTo: string;
  createdAt: Date; expiresAt: Date;
}) {
  await db.insert(authFlows).values({ ...flow, consumedAt: null });
}

export async function consumeAuthFlow(db: Database, stateHash: string, now = new Date()) {
  return db.transaction(async (transaction) => {
    const [flow] = await transaction
      .update(authFlows)
      .set({ consumedAt: now })
      .where(and(
        eq(authFlows.stateHash, stateHash),
        isNull(authFlows.consumedAt),
        gt(authFlows.expiresAt, now)
      ))
      .returning();
    return flow ?? null;
  });
}

export async function findAuthIdentity(db: Database, issuer: string, subject: string) {
  const [identity] = await db.select().from(authIdentities).where(and(
    eq(authIdentities.issuer, issuer),
    eq(authIdentities.subject, subject),
    isNull(authIdentities.disabledAt)
  )).limit(1);
  return identity ?? null;
}

export async function resolveSession(db: Database, tokenHash: string, now = new Date()): Promise<AuthenticatedActor | null> {
  const [row] = await db
    .select({
      sessionId: authSessions.id,
      personId: authIdentities.personId,
      authenticatedAt: authSessions.authenticatedAt,
      assurance: authSessions.assurance,
    })
    .from(authSessions)
    .innerJoin(authIdentities, eq(authSessions.authIdentityId, authIdentities.id))
    .where(and(
      eq(authSessions.tokenHash, tokenHash),
      isNull(authSessions.revokedAt),
      isNull(authIdentities.disabledAt),
      gt(authSessions.expiresAt, now)
    ))
    .limit(1);
  if (!row) return null;

  const grants = await db.select().from(authorizationGrants).where(and(
    eq(authorizationGrants.personId, row.personId),
    isNull(authorizationGrants.revokedAt),
    lte(authorizationGrants.validFrom, now),
    or(isNull(authorizationGrants.validUntil), gt(authorizationGrants.validUntil, now))
  ));
  return {
    personId: row.personId,
    sessionId: row.sessionId,
    authenticatedAt: row.authenticatedAt,
    assurance: row.assurance as AssuranceLevel,
    grants: grants.map((grant): AuthorizationGrant => ({
      id: grant.id,
      personId: grant.personId,
      domain: grant.domain,
      capability: grant.capability,
      target: grant.target,
      assuranceRequired: grant.assuranceRequired,
      validFrom: grant.validFrom,
      validUntil: grant.validUntil,
      revokedAt: grant.revokedAt,
    })),
  };
}

export async function createAuthenticatedSession(db: Database, input: {
  id: string; authIdentityId: string; tokenHash: string; assurance: AssuranceLevel;
  authenticatedAt: Date; expiresAt: Date; personId: string; auditId: string;
}) {
  await db.transaction(async (transaction) => {
    await transaction.insert(authSessions).values({
      id: input.id,
      authIdentityId: input.authIdentityId,
      tokenHash: input.tokenHash,
      assurance: input.assurance,
      authenticatedAt: input.authenticatedAt,
      expiresAt: input.expiresAt,
      revokedAt: null,
    });
    await transaction.insert(auditLog).values({
      id: input.auditId,
      actorPersonId: input.personId,
      action: "auth.session-created",
      target: input.id,
      timestamp: new Date(),
      pseudonymized: false,
    });
  });
}

export async function revokeAuthenticatedSession(db: Database, actor: AuthenticatedActor, auditId: string) {
  await db.transaction(async (transaction) => {
    await transaction.update(authSessions).set({ revokedAt: new Date() }).where(eq(authSessions.id, actor.sessionId));
    await transaction.insert(auditLog).values({
      id: auditId,
      actorPersonId: actor.personId,
      action: "auth.session-revoked",
      target: actor.sessionId,
      timestamp: new Date(),
      pseudonymized: false,
    });
  });
}
