import type { Locale } from "../i18n/config";
import { getPublicSiteCopy } from "../i18n/public-site";
import { getExperienceCopy } from "../i18n/experience";
import { academyCopy } from "../i18n/academy";

export function publicNavigation(locale: Locale) {
  const labels = getPublicSiteCopy(locale).nav;
  const experience = getExperienceCopy(locale);
  return [
    { href: `/${locale}/programs`, label: labels.programs },
    { href: `/${locale}/academy`, label: academyCopy[locale].title },
    { href: `/${locale}/projects`, label: labels.projects },
    { href: `/${locale}/lab`, label: experience.home.lab.label },
    { href: `/${locale}/research`, label: labels.research },
    { href: `/${locale}/publications`, label: labels.publications },
    { href: `/${locale}/membership`, label: labels.membership },
    { href: `/${locale}/contact`, label: labels.contact },
  ] as const;
}
