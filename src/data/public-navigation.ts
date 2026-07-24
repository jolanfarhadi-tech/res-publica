import type { Locale } from "../i18n/config";
import { getPublicSiteCopy } from "../i18n/public-site";

export function publicNavigation(locale: Locale) {
  const labels = getPublicSiteCopy(locale).nav;
  return [
    { href: `/${locale}/mission-vision`, label: labels.mission },
    { href: `/${locale}/method`, label: labels.method },
    { href: `/${locale}/offerings`, label: labels.offerings },
    { href: `/${locale}/projects`, label: labels.projects },
    { href: `/${locale}/events`, label: labels.events },
    { href: `/${locale}/membership`, label: labels.membership },
    { href: `/${locale}/contact`, label: labels.contact },
  ] as const;
}
