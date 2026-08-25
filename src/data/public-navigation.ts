import type { Locale } from "../i18n/config";
import { getPublicSiteCopy } from "../i18n/public-site";

export function publicNavigation(locale: Locale) {
  const labels = getPublicSiteCopy(locale).nav;
  return [
    { href: `/${locale}/about`, label: labels.about },
    { href: `/${locale}/method`, label: labels.method },
    { href: `/${locale}/projects`, label: labels.projects },
    { href: `/${locale}/programs`, label: labels.programs },
    { href: `/${locale}/research`, label: labels.research },
    { href: `/${locale}/publications`, label: labels.publications },
    { href: `/${locale}/membership`, label: labels.membership },
  ] as const;
}
