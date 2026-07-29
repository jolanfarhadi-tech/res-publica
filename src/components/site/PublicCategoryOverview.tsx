import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";

export function PublicCategoryOverview({ locale }: { locale: Locale }) {
  const links = getPublicSiteCopy(locale).home.offerings.links;

  return (
    <ul className="grid list-none gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {links.map(([label, href], index) => (
        <li key={href} className="bg-bg">
          <Link
            href={`/${locale}${href}`}
            className="group flex min-h-40 flex-col justify-between p-6 transition-colors hover:bg-surface"
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
