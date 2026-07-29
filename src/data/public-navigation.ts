import type { Locale } from "../i18n/config";
import { getPublicSiteCopy } from "../i18n/public-site";

export function publicNavigation(locale: Locale) {
  const labels = getPublicSiteCopy(locale).nav;
  return [
    { href: `/${locale}/programs`, label: labels.programs },
    { href: `/${locale}/products`, label: labels.products },
    { href: `/${locale}/services`, label: labels.services },
    { href: `/${locale}/projects`, label: labels.projects },
    { href: `/${locale}/research`, label: labels.research },
    { href: `/${locale}/membership`, label: labels.membership },
    { href: `/${locale}/contact`, label: labels.contact },
  ] as const;
}
