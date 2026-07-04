import type { Locale } from "@/i18n/config";

/**
 * Locale-aware dates. The browser/Node `Intl` API does the work:
 *  - de → "4. Juli 2026"
 *  - en → "4 July 2026"
 *  - fa → "۱۳ تیر ۱۴۰۵" (Persian Solar Hijri calendar, Persian digits)
 */
const intlLocale: Record<Locale, string> = {
  de: "de-DE",
  en: "en-GB",
  fa: "fa-IR",
};

export function formatDate(locale: Locale, isoDate: string): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    dateStyle: "long",
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

/** "2026-07-04" for comparisons — today's date in ISO form. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
