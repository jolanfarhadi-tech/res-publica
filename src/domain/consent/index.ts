import { z } from "zod";
import { createId, type EntityId } from "../shared";

/**
 * ConsentRecord — purpose-scoped, revocable, timestamped; every module that
 * needs consent reads from here, none defines its own (`ADR-002`).
 *
 * Invariant (`CORE_DOMAIN_MODEL.md` §9): "A ConsentRecord is purpose-scoped;
 * consent for one purpose never implies consent for another." Enforced here
 * by never exposing a bulk/aggregate grant — every grant is one purpose, one
 * record; `hasActiveConsent` only ever checks a single named purpose.
 *
 * Purposes named directly in `ADR-002`'s Decision section: tracking,
 * invitations, payment processing, event PII. This list is additive
 * (a new purpose is a non-breaking addition, consistent with the Category
 * Registry extension pattern used elsewhere in this repository) — extend
 * it, never repurpose an existing value's meaning.
 *
 * Governing documents: `ADR-002`; `CORE_DOMAIN_MODEL.md` §3a (LOCKED,
 * referenced only).
 */

export const CONSENT_PURPOSES = [
  "tracking",
  "invitations",
  "payment-processing",
  "event-pii",
  "profile-data-protection-v1-de",
  "profile-data-protection-v1-en",
  "profile-data-protection-v1-fa",
  "profile-programme-participation-v1-de",
  "profile-programme-participation-v1-en",
  "profile-programme-participation-v1-fa",
] as const;

export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];

export const PROFILE_CONSENT_TEXT_VERSION = "v1" as const;
export const PROFILE_CONSENT_LOCALES = ["de", "en", "fa"] as const;
export type ProfileConsentLocale = (typeof PROFILE_CONSENT_LOCALES)[number];

export const profileConsentSubmissionSchema = z.object({
  dataProtection: z.literal(true),
  programmeParticipation: z.literal(true),
  locale: z.enum(PROFILE_CONSENT_LOCALES),
});

export type ProfileConsentSubmission = z.infer<
  typeof profileConsentSubmissionSchema
>;

const profileConsentPurposes: Record<
  ProfileConsentLocale,
  { dataProtection: ConsentPurpose; programmeParticipation: ConsentPurpose }
> = {
  de: {
    dataProtection: "profile-data-protection-v1-de",
    programmeParticipation: "profile-programme-participation-v1-de",
  },
  en: {
    dataProtection: "profile-data-protection-v1-en",
    programmeParticipation: "profile-programme-participation-v1-en",
  },
  fa: {
    dataProtection: "profile-data-protection-v1-fa",
    programmeParticipation: "profile-programme-participation-v1-fa",
  },
};

const consentRecordSchema = z.object({
  id: z.string(),
  personId: z.string(),
  purpose: z.enum(CONSENT_PURPOSES),
  grantedAt: z.date(),
  revokedAt: z.date().nullable(),
});

export type ConsentRecord = z.infer<typeof consentRecordSchema>;

export function grantConsent(
  personId: EntityId,
  purpose: ConsentPurpose,
  grantedAt = new Date()
): ConsentRecord {
  const record: ConsentRecord = {
    id: createId(),
    personId,
    purpose,
    grantedAt,
    revokedAt: null,
  };
  return consentRecordSchema.parse(record);
}

export function grantProfileConsents(
  personId: EntityId,
  submission: ProfileConsentSubmission,
  grantedAt = new Date()
): readonly [ConsentRecord, ConsentRecord] {
  const verified = profileConsentSubmissionSchema.parse(submission);
  const purposes = profileConsentPurposes[verified.locale];
  return [
    grantConsent(personId, purposes.dataProtection, grantedAt),
    grantConsent(personId, purposes.programmeParticipation, grantedAt),
  ];
}

export function revokeConsent(record: ConsentRecord): ConsentRecord {
  if (record.revokedAt !== null) {
    throw new Error(`ConsentRecord ${record.id} is already revoked`);
  }
  return { ...record, revokedAt: new Date() };
}

export function isConsentActive(record: ConsentRecord): boolean {
  return record.revokedAt === null;
}

/**
 * Purpose-scoped lookup only — deliberately takes one purpose, never an
 * array or "any purpose" mode, so a caller cannot accidentally treat one
 * purpose's grant as implying another's.
 */
export function hasActiveConsent(
  records: readonly ConsentRecord[],
  personId: EntityId,
  purpose: ConsentPurpose
): boolean {
  return records.some(
    (r) => r.personId === personId && r.purpose === purpose && isConsentActive(r)
  );
}
