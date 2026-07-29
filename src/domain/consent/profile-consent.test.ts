import { describe, expect, it } from "vitest";
import {
  grantProfileConsents,
  type ProfileConsentLocale,
  type ProfileConsentSubmission,
} from "./index";

const expectedPurposes: Record<ProfileConsentLocale, readonly [string, string]> = {
  de: [
    "profile-data-protection-v1-de",
    "profile-programme-participation-v1-de",
  ],
  en: [
    "profile-data-protection-v1-en",
    "profile-programme-participation-v1-en",
  ],
  fa: [
    "profile-data-protection-v1-fa",
    "profile-programme-participation-v1-fa",
  ],
};

describe("profile consent receipts", () => {
  it.each(["de", "en", "fa"] as const)(
    "stores two separate versioned %s receipts with one grant timestamp",
    (locale) => {
      const grantedAt = new Date("2026-07-29T12:00:00.000Z");
      const records = grantProfileConsents(
        "person-profile-consent",
        {
          dataProtection: true,
          programmeParticipation: true,
          locale,
        },
        grantedAt
      );

      expect(records.map((record) => record.purpose)).toEqual(
        expectedPurposes[locale]
      );
      expect(
        records.every(
          (record) => record.grantedAt.getTime() === grantedAt.getTime()
        )
      ).toBe(true);
      expect(records.every((record) => record.revokedAt === null)).toBe(true);
    }
  );

  it.each([
    { dataProtection: false, programmeParticipation: true, locale: "de" },
    { dataProtection: true, programmeParticipation: false, locale: "en" },
  ])("rejects an incomplete consent bundle", (submission) => {
    expect(() =>
      grantProfileConsents(
        "person-profile-consent",
        submission as unknown as ProfileConsentSubmission
      )
    ).toThrow();
  });
});
