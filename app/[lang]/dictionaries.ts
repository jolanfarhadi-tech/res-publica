import { notFound } from "next/navigation";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
  fa: () => import("./dictionaries/fa.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;

export const locales = Object.keys(dictionaries) as Locale[];

export const defaultLocale: Locale = "en";

export const rtlLocales: Locale[] = ["fa"];

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fa: "فارسی",
};

export const hasLocale = (locale: string): locale is Locale =>
  (locales as string[]).includes(locale);

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

/** For page components: 404s on an invalid locale, otherwise loads its dictionary. */
export async function getPageDictionary(locale: string): Promise<Dictionary> {
  if (!hasLocale(locale)) notFound();
  return getDictionary(locale);
}
