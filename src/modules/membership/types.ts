/**
 * Membership — Foundation Build Order Step 5, MVP module #5.
 *
 * Lifecycle and tier taxonomy match `docs/source/projects/MEMBER_PROFILE.md`
 * exactly — that document explicitly flagged both as gaps for "the future
 * Membership System specification" to define; this module is that
 * specification, reusing its exact vocabulary rather than inventing new
 * terms. "Deleted" is never used as a status, per that document's explicit
 * instruction — documented civic contributions are permanent institutional
 * memory, independent of Membership state.
 */

export type MembershipTier = "basic" | "supporter" | "volunteer" | "research" | "institutional";

export type MembershipStatus =
  | "registered"
  | "verified"
  | "active"
  | "inactive"
  | "paused"
  | "self-isolated"
  | "withdrawn"
  | "retired"
  | "suspended"
  | "terminated";

export type Member = {
  id: string;
  personId: string;
  tier: MembershipTier;
  status: MembershipStatus;
  createdAt: Date;
};

export type StatusChange = {
  id: string;
  memberId: string;
  previousStatus: MembershipStatus;
  currentStatus: MembershipStatus;
  triggeringActivity: string;
  timestamp: Date;
};

export type RecurringPledge = {
  id: string;
  memberId: string;
  amount: number;
  currency: string;
  intervalMonths: number;
  active: boolean;
};

export type InstitutionalSupporterProfile = {
  id: string;
  memberId: string;
  organizationId: string;
};

export type MembershipBenefitGrant = {
  id: string;
  memberId: string;
  benefitName: string;
  grantedAt: Date;
};
