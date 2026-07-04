import type { Locale } from "@/i18n/config";

/**
 * Partners data — Milestone 2.
 *
 * ⚠️ PLACEHOLDER entries. Replace with the real partners.
 * `logo` (path under /public) is optional — until provided,
 * the grid shows the partner's name in a quiet tile.
 */

export type Partner = {
  id: string;
  name: string;
  url?: string;
  logo?: string;
  description: Record<Locale, string>;
};

export const partners: Partner[] = [
  {
    id: "partner-1",
    name: "Partnerorganisation A",
    url: "https://example.org",
    description: {
      de: "Kooperationspartner im Bereich politische Bildung.",
      en: "Cooperation partner in civic education.",
      fa: "همکار در زمینه آموزش مدنی.",
    },
  },
  {
    id: "partner-2",
    name: "Partnerorganisation B",
    description: {
      de: "Forschungspartner für Demokratie- und Beteiligungsstudien.",
      en: "Research partner for democracy and participation studies.",
      fa: "همکار پژوهشی در مطالعات دموکراسی و مشارکت.",
    },
  },
  {
    id: "partner-3",
    name: "Partnerorganisation C",
    description: {
      de: "Partner für Dialog- und Veranstaltungsformate.",
      en: "Partner for dialogue and event formats.",
      fa: "همکار در قالب‌های گفت‌وگو و رویدادها.",
    },
  },
];
