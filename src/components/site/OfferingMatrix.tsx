import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";
import {
  hasOperationalCallToAction,
  offeringsForCategory,
  type PublicCategory,
} from "@/data/public-offerings";

export function OfferingMatrix({
  locale,
  category,
  limit,
}: {
  locale: Locale;
  category: PublicCategory;
  limit?: number;
}) {
  const copy = getPublicSiteCopy(locale).offerings;
  const offerings = offeringsForCategory(locale, category).slice(0, limit);

  return (
    <ul className="grid list-none gap-4 md:grid-cols-2">
      {offerings.map((offering) => {
        const operational = hasOperationalCallToAction(offering);
        return (
          <li key={offering.id} className="glass-panel flex min-h-72 flex-col rounded-2xl p-7 sm:p-9">
            <p className="civic-label">
              {copy.labels[offering.maturity]}
            </p>
            <h3 className="mt-8 text-3xl leading-tight">{offering.title}</h3>
            <p className="mt-4 flex-1 leading-relaxed text-muted">
              {offering.description}
            </p>
            {offering.href ? (
              <Link
                href={`/${locale}${offering.href === "/" ? "" : offering.href}`}
                className="button-secondary mt-8 w-fit"
              >
                {operational ? copy.open : copy.learn}
                <span aria-hidden="true" className="ms-2">↗</span>
              </Link>
            ) : (
              <p className="mt-8 text-sm text-muted">
                {copy.noOperationalCta}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
