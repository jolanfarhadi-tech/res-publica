import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";

export function PublicCategoryOverview({ locale }: { locale: Locale }) {
  const links = getPublicSiteCopy(locale).home.offerings.links;

  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {links.map(([label, href], index) => (
        <li key={href}>
          <Link
            href={`/${locale}${href}`}
            className="glass-panel group flex min-h-44 flex-col justify-between rounded-2xl p-6 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-accent"
          >
            <span className="editorial-index text-xs text-gold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex items-end justify-between gap-4 text-2xl">
              {label}
              <span aria-hidden="true" className="text-accent">↗</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
