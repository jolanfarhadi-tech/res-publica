import type { Locale } from "@/i18n/config";

/** Only relationships explicitly approved for public display belong here. */

export type Partner = {
  id: string;
  name: string;
  url?: string;
  logo?: string;
  description: Record<Locale, string>;
};

export const partners: Partner[] = [];
