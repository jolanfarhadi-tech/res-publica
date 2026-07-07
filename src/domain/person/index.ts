import { z } from "zod";
import { createId, type EntityId } from "../shared";

/**
 * Person — the aggregate root every other canonical entity references by id,
 * never the reverse (`CORE_DOMAIN_MODEL.md` §5). Fields limited to exactly
 * what the governing documents name: "name/contact/locale/RTL preference
 * only — nothing role-specific" (`foundation-architecture.md` §2). Module-
 * specific profiles (membership tier, community standing, attendance
 * history, etc.) reference a Person by id rather than duplicating this data
 * — that duplication is the exact problem `ADR-002` exists to prevent.
 *
 * Governing documents: `ADR-002` (Domain Model); `CORE_DOMAIN_MODEL.md` §3a
 * (LOCKED, referenced only — not modified by this implementation).
 *
 * Privacy: High (PII) per `CORE_DOMAIN_MODEL.md` §3a. This module defines
 * shape and invariants only — access control / visibility enforcement is
 * Authentication/Authorization's responsibility (`ADR-027`, not yet
 * resolved, intentionally out of scope here).
 */

export const LOCALES = ["de", "en", "fa"] as const;
export type Locale = (typeof LOCALES)[number];

const personSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  contact: z.object({
    email: z.string().email(),
  }),
  locale: z.enum(LOCALES),
  /**
   * Stored, not purely derived: defaults from locale (Farsi is RTL) but may
   * be independently overridden — a bilingual person may read Farsi content
   * while preferring an LTR layout, or vice versa. Personalization is
   * opt-in (Constitution Principle 3); this default is a convenience, not
   * a constraint.
   */
  rtlPreference: z.boolean(),
  createdAt: z.date(),
});

export type Person = z.infer<typeof personSchema>;

export type CreatePersonInput = {
  name: string;
  contact: { email: string };
  locale: Locale;
  rtlPreference?: boolean;
};

const DEFAULT_RTL_LOCALES: readonly Locale[] = ["fa"];

export function createPerson(input: CreatePersonInput): Person {
  const person: Person = {
    id: createId(),
    name: input.name,
    contact: input.contact,
    locale: input.locale,
    rtlPreference: input.rtlPreference ?? DEFAULT_RTL_LOCALES.includes(input.locale),
    createdAt: new Date(),
  };
  return personSchema.parse(person);
}

export function referencesPerson(personId: EntityId, subject: { personId: EntityId }): boolean {
  return subject.personId === personId;
}
