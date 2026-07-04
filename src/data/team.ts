import type { Locale } from "@/i18n/config";

/**
 * Team data — Milestone 2.
 *
 * ⚠️ These are PLACEHOLDER members. Replace name, role, and bio
 * with the real team. Photos can be added later via `image`
 * (path under /public), the card shows initials until then.
 */

export type TeamMember = {
  id: string;
  name: string;
  image?: string;
  role: Record<Locale, string>;
  bio: Record<Locale, string>;
};

export const team: TeamMember[] = [
  {
    id: "chair",
    name: "Vorname Nachname",
    role: {
      de: "Vorsitz",
      en: "Chair",
      fa: "رئیس",
    },
    bio: {
      de: "Kurzbiografie folgt. Zwei bis drei Sätze zu Hintergrund und Schwerpunkt.",
      en: "Short biography to follow. Two or three sentences on background and focus.",
      fa: "زندگی‌نامه کوتاه به‌زودی. دو تا سه جمله درباره پیشینه و تمرکز کاری.",
    },
  },
  {
    id: "research-lead",
    name: "Vorname Nachname",
    role: {
      de: "Leitung Forschung",
      en: "Head of Research",
      fa: "سرپرست پژوهش",
    },
    bio: {
      de: "Kurzbiografie folgt. Zwei bis drei Sätze zu Hintergrund und Schwerpunkt.",
      en: "Short biography to follow. Two or three sentences on background and focus.",
      fa: "زندگی‌نامه کوتاه به‌زودی. دو تا سه جمله درباره پیشینه و تمرکز کاری.",
    },
  },
  {
    id: "dialogue-lead",
    name: "Vorname Nachname",
    role: {
      de: "Leitung Dialogformate",
      en: "Head of Dialogue Programs",
      fa: "سرپرست برنامه‌های گفت‌وگو",
    },
    bio: {
      de: "Kurzbiografie folgt. Zwei bis drei Sätze zu Hintergrund und Schwerpunkt.",
      en: "Short biography to follow. Two or three sentences on background and focus.",
      fa: "زندگی‌نامه کوتاه به‌زودی. دو تا سه جمله درباره پیشینه و تمرکز کاری.",
    },
  },
];
