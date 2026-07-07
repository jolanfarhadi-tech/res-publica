import { hasActiveConsent, type ConsentRecord } from "../../domain/consent";
import type { UserPreference } from "./types";

/**
 * Update Follow Preferences — real integration with `domain/consent`:
 * personalization requires active opt-in tracking consent (Constitution
 * Principle 3), enforced here rather than assumed.
 */
export function createUserPreference(personId: string): UserPreference {
  return { personId, followedTopics: [] };
}

export function followTopic(
  preference: UserPreference,
  consentRecords: readonly ConsentRecord[],
  entityId: string
): UserPreference {
  if (!hasActiveConsent(consentRecords, preference.personId, "tracking")) {
    throw new Error("Cannot personalize without active tracking consent");
  }
  if (preference.followedTopics.includes(entityId)) {
    return preference;
  }
  return { ...preference, followedTopics: [...preference.followedTopics, entityId] };
}
