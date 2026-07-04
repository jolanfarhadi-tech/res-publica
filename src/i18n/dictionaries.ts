import type { Locale } from "./config";
import de from "./dictionaries/de.json";
import en from "./dictionaries/en.json";
import fa from "./dictionaries/fa.json";

/**
 * The German dictionary is the reference: all other languages must
 * have the same shape. TypeScript enforces this via the type below.
 */
export type Dictionary = typeof de;

const dictionaries: Record<Locale, Dictionary> = { de, en, fa };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
