/**
 * i18n configuration — the single source of truth for languages.
 *
 * To add a language later: add it here, create a dictionary JSON file,
 * and register it in `dictionaries.ts`. Nothing else needs to change.
 */

export const locales = ["de", "en", "fa"] as const;

export type Locale = (typeof locales)[number];

/** German is the organization's primary language. */
export const defaultLocale: Locale = "de";

/** Persian (Farsi) is written right-to-left. */
export const rtlLocales: Locale[] = ["fa"];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

/** Native-language names, used by the language switcher. */
export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  fa: "فارسی",
};
