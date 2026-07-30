import type { Locale } from "./config";
import { getDictionary } from "./dictionaries";

export type OpenGraphPresentation = {
  title: string;
  description: string;
  imagePath: `/${Locale}/opengraph-image`;
  imageVariant: "localized" | "neutral";
};

export async function getOpenGraphPresentation(
  locale: Locale
): Promise<OpenGraphPresentation> {
  const dictionary = await getDictionary(locale);
  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    imagePath: `/${locale}/opengraph-image`,
    imageVariant: locale === "fa" ? "neutral" : "localized",
  };
}
