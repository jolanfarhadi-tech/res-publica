import { createId } from "../../domain/shared";
import type { Locale } from "../../domain/person";
import type { CommunityMember, EvangelismInvitation, EvangelismMechanic, LanguageMechanicConfig } from "./types";

/**
 * Generate Invitation — three distinct per-language evangelism mechanics
 * (Constitution Principle 7: "German: institutionally fluent; English:
 * comparative/outside-observer; Farsi: trust-and-independence-first").
 * Deterministic lookup only — no AI-generated invitation text, consistent
 * with this module's explicit "no AI" scope.
 */
export const LANGUAGE_MECHANICS: readonly LanguageMechanicConfig[] = [
  { locale: "de", mechanic: "co-signed-institutional-invitation" },
  { locale: "en", mechanic: "comparative-outside-observer-invitation" },
  { locale: "fa", mechanic: "trust-and-independence-first-invitation" },
];

export function mechanicForLocale(locale: Locale): EvangelismMechanic {
  const config = LANGUAGE_MECHANICS.find((c) => c.locale === locale);
  if (!config) throw new Error(`No evangelism mechanic configured for locale "${locale}"`);
  return config.mechanic;
}

export function generateInvitation(member: CommunityMember, locale: Locale): EvangelismInvitation {
  return { id: createId(), communityMemberId: member.id, mechanic: mechanicForLocale(locale), createdAt: new Date() };
}

/** Create Private Referral Link — deterministic, no external URL-shortener dependency. */
export function createReferralLink(member: CommunityMember): string {
  return `https://respublica.example/join?ref=${member.id}`;
}
