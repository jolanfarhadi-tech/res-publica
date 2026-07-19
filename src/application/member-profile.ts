import { desc, eq } from "drizzle-orm";
import type { AuthenticatedActor } from "../auth/types";
import { toMembershipJourneyView } from "../modules/membership/view";
import type { Member, StatusChange } from "../modules/membership/types";
import type { Database } from "../persistence";
import { members, membershipStatusChanges } from "../persistence/module-schema";

export type SelfMemberProfile =
  | { enrolled: false }
  | {
      enrolled: true;
      membership: {
        memberId: string;
        tier: Member["tier"];
        currentStatus: Member["status"];
        registeredAt: Date;
        previousStatus: Member["status"] | null;
        statusChangeDate: Date | null;
        triggeringActivity: string | null;
        nextAvailableStatuses: Member["status"][];
      };
    };

export async function getSelfMemberProfile(
  db: Database,
  actor: AuthenticatedActor | null
): Promise<SelfMemberProfile> {
  if (!actor) throw new MemberProfileAuthenticationError();

  // ADR-034: ownership is constrained in the database query itself. There is
  // no arbitrary member/person identifier accepted by this application service.
  const [member] = await db
    .select({
      id: members.id,
      personId: members.personId,
      tier: members.tier,
      status: members.status,
      createdAt: members.createdAt,
    })
    .from(members)
    .where(eq(members.personId, actor.personId))
    .limit(1);

  if (!member) return { enrolled: false };

  const [latestChange] = await db
    .select({
      id: membershipStatusChanges.id,
      memberId: membershipStatusChanges.memberId,
      previousStatus: membershipStatusChanges.previousStatus,
      currentStatus: membershipStatusChanges.currentStatus,
      triggeringActivity: membershipStatusChanges.triggeringActivity,
      timestamp: membershipStatusChanges.timestamp,
    })
    .from(membershipStatusChanges)
    .where(eq(membershipStatusChanges.memberId, member.id))
    .orderBy(desc(membershipStatusChanges.timestamp))
    .limit(1);

  const journey = toMembershipJourneyView(
    member as Member,
    latestChange ? [latestChange as StatusChange] : []
  );

  // Explicit allowlist projection: raw Person, grants, sessions, audit,
  // Evidence, and Governance records never enter this response object.
  return {
    enrolled: true,
    membership: {
      memberId: journey.memberId,
      tier: member.tier,
      currentStatus: journey.currentStatus,
      registeredAt: member.createdAt,
      previousStatus: journey.previousStatus,
      statusChangeDate: journey.statusChangeDate,
      triggeringActivity: journey.triggeringActivity,
      nextAvailableStatuses: journey.nextAvailableStatuses,
    },
  };
}

export class MemberProfileAuthenticationError extends Error {
  constructor() {
    super("A verified member session is required");
    this.name = "MemberProfileAuthenticationError";
  }
}
