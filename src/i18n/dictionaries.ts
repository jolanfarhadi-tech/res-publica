import type { Locale } from "./config";
import type de from "./dictionaries/de.json";

/**
 * The German dictionary is the reference: all other languages must
 * have the same shape. TypeScript enforces this via the type below.
 */
export type Dictionary = typeof de;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  de: () => import("./dictionaries/de.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  fa: () => import("./dictionaries/fa.json").then((module) => module.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
