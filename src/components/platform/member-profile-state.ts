import type { MembershipStatus, MembershipTier } from "@/modules/membership/types";

export type ProfilePayload =
  | { enrolled: false }
  | {
      enrolled: true;
      membership: {
        memberId: string;
        tier: MembershipTier;
        currentStatus: MembershipStatus;
        registeredAt: string;
        previousStatus: MembershipStatus | null;
        statusChangeDate: string | null;
        triggeringActivity: string | null;
        nextAvailableStatuses: MembershipStatus[];
      };
    };

export type MemberProfileViewState =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "unavailable" }
  | { kind: "error" }
  | { kind: "ready"; profile: ProfilePayload };

export async function memberProfileStateFromResponse(response: Response): Promise<MemberProfileViewState> {
  if (response.status === 401) return { kind: "anonymous" };
  if (response.status === 503) return { kind: "unavailable" };
  if (!response.ok) return { kind: "error" };
  return { kind: "ready", profile: (await response.json()) as ProfilePayload };
}
