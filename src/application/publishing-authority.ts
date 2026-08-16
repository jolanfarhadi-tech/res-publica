import { and, eq, isNull } from "drizzle-orm";
import type { AuthenticatedActor } from "../auth/types";
import { appendEntry } from "../domain/audit-log";
import { createId } from "../domain/shared";
import { createRepositories, type Database } from "../persistence";
import { authorizationGrants, people } from "../persistence/schema";
import {
  assertPrivilegedActionContext,
  type PrivilegedActionContext,
} from "../platform/privileged-access";
import {
  assertEditorialDelegation,
  editorialCapability,
  requireEditorialRole,
  type OperationalEditorialRole,
} from "../modules/publishing/authority";

export async function grantEditorialRole(db: Database, actor: AuthenticatedActor | null, input: {
  granteePersonId: string; publicationScope: string; role: OperationalEditorialRole; validUntil: Date | null;
  reasonCode: PrivilegedActionContext["reasonCode"]; requestId: string;
}) {
  requireEditorialRole(actor, "publisher", input.publicationScope, "recent-mfa");
  assertPrivilegedActionContext(input, [
    "operational-role-assignment",
    "duty-reassignment",
  ]);
  assertEditorialDelegation({ actorPersonId: actor.personId, ...input });
  const now = new Date();
  if (input.validUntil !== null) {
    if (!Number.isFinite(input.validUntil.getTime())) {
      throw new EditorialGrantError("grant_expiry_invalid");
    }
    if (input.validUntil <= now) {
      throw new EditorialGrantError("grant_expiry_must_be_future");
    }
  }
  const grant = { id: createId(), personId: input.granteePersonId, domain: "civic" as const,
    capability: editorialCapability(input.role), target: input.publicationScope, assuranceRequired: "mfa" as const,
    validFrom: now, validUntil: input.validUntil, grantedByPersonId: actor.personId, revokedAt: null };
  await db.transaction(async (tx) => {
    const [person] = await tx.select({ id: people.id }).from(people)
      .where(eq(people.id, input.granteePersonId)).limit(1);
    if (!person) throw new EditorialGrantError("grantee_not_found");
    await tx.insert(authorizationGrants).values(grant);
    await createRepositories(tx).auditLog.append(appendEntry({
      actorPersonId: actor.personId,
      action: "publishing.role-granted",
      target: `authorization-grant:${grant.id}`,
      sessionId: actor.sessionId,
      requestId: input.requestId,
      capability: grant.capability,
      reasonCode: input.reasonCode,
    }));
  });
  return grant;
}

export async function revokeEditorialRole(db: Database, actor: AuthenticatedActor | null, input: {
  grantId: string; publicationScope: string;
  reasonCode: PrivilegedActionContext["reasonCode"]; requestId: string;
}) {
  requireEditorialRole(actor, "publisher", input.publicationScope, "recent-mfa");
  assertPrivilegedActionContext(input, [
    "scheduled-access-review",
    "duty-reassignment",
  ]);
  return db.transaction(async (tx) => {
    const [grant] = await tx.select().from(authorizationGrants).where(and(
      eq(authorizationGrants.id, input.grantId), eq(authorizationGrants.domain, "civic"),
      eq(authorizationGrants.target, input.publicationScope), isNull(authorizationGrants.revokedAt),
    )).limit(1).for("update");
    if (!grant) throw new EditorialGrantError("grant_not_found");
    if (grant.personId === actor.personId) throw new EditorialGrantError("self_revocation_forbidden");
    if (grant.capability === editorialCapability("publisher")) throw new EditorialGrantError("publisher_revocation_founder_only");
    const revokedAt = new Date();
    await tx.update(authorizationGrants).set({ revokedAt }).where(and(
      eq(authorizationGrants.id, grant.id),
      isNull(authorizationGrants.revokedAt),
    ));
    await createRepositories(tx).auditLog.append(appendEntry({
      actorPersonId: actor.personId,
      action: "publishing.role-revoked",
      target: `authorization-grant:${grant.id}`,
      sessionId: actor.sessionId,
      requestId: input.requestId,
      capability: grant.capability,
      reasonCode: input.reasonCode,
    }));
    return { ...grant, revokedAt };
  });
}

export class EditorialGrantError extends Error {
  constructor(public readonly code: string) { super(code); this.name = "EditorialGrantError"; }
}
