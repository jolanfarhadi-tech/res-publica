import type { Locale } from "@/i18n/config";

/** Only identities explicitly approved for public display belong here. */

export type TeamMember = {
  id: string;
  name: string;
  image?: string;
  role: Record<Locale, string>;
  bio: Record<Locale, string>;
};

export const team: TeamMember[] = [];
