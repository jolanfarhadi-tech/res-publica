import { eq } from "drizzle-orm";
import { createId } from "../domain/shared";
import {
  grantProfileConsents,
  type ProfileConsentSubmission,
} from "../domain/consent";
import { requireAuthorization } from "../auth/authorize";
import type { AuthenticatedActor } from "../auth/types";
import { createMember } from "../modules/membership/lifecycle";
import type { MembershipTier } from "../modules/membership/types";
import type { Database } from "../persistence";
import { auditLog, consentRecords } from "../persistence/schema";
import { members } from "../persistence/module-schema";

export async function createMembership(
  db: Database,
  actor: AuthenticatedActor | null,
  tier: MembershipTier,
  profileConsents: ProfileConsentSubmission
) {
  requireAuthorization(actor, { domain: "civic", capability: "membership.create" });
  const [existing] = await db.select({ id: members.id }).from(members)
    .where(eq(members.personId, actor.personId)).limit(1);
  if (existing) throw new DuplicateMembershipError(actor.personId);
  const member = createMember(actor.personId, tier);
  const consentTimestamp = new Date();
  const consentReceipts = grantProfileConsents(
    actor.personId,
    profileConsents,
    consentTimestamp
  );
  await db.transaction(async (transaction) => {
    await transaction.insert(members).values(member);
    await transaction.insert(consentRecords).values([...consentReceipts]);
    await transaction.insert(auditLog).values({
      id: createId(), actorPersonId: actor.personId, action: "membership.created",
      target: member.id, timestamp: new Date(), pseudonymized: false,
    });
  });
  return member;
}

export class DuplicateMembershipError extends Error {
  constructor(personId: string) {
    super(`Membership already exists for person ${personId}`);
    this.name = "DuplicateMembershipError";
  }
}
