"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * LanguageSwitcher — links to the same page in each language by
 * swapping the first path segment (/de/team → /fa/team).
 */
export function LanguageSwitcher({
  current,
  dict,
}: {
  current: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname() ?? `/${current}`;
  const rest = pathname.split("/").slice(2).join("/"); // path after the locale

  return (
    <nav aria-label={dict.a11y.languageSwitcher}>
      <ul className="flex items-center gap-1">
        {locales.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <Link
                href={`/${locale}${rest ? `/${rest}` : ""}`}
                lang={locale}
                aria-current={active ? "true" : undefined}
                className={`rounded-full px-2.5 py-1 text-sm transition-colors ${
                  active
                    ? "font-semibold text-ink"
                    : "text-muted hover:text-accent"
                }`}
              >
                {localeNames[locale]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
