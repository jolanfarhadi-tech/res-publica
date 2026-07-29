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
      <ul className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface/60 p-1">
        {locales.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <Link
                href={`/${locale}${rest ? `/${rest}` : ""}`}
                lang={locale}
                aria-current={active ? "true" : undefined}
                className={`inline-flex min-h-9 items-center rounded-lg px-2.5 py-1 text-sm transition-colors ${
                  active
                    ? "bg-ink font-semibold text-bg"
                    : "text-muted hover:bg-bg hover:text-accent"
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
