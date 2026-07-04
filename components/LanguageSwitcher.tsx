"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { locales, localeNames, type Locale } from "@/app/[lang]/dictionaries";

export function LanguageSwitcher({
  currentLocale,
  label,
}: {
  currentLocale: Locale;
  label: string;
}) {
  const pathname = usePathname() ?? "/";
  const segments = pathname.split("/");
  const rest = segments.slice(2).join("/");

  function hrefFor(locale: Locale) {
    return rest ? `/${locale}/${rest}` : `/${locale}`;
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={hrefFor(locale)}
          onClick={() => {
            document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
          }}
          aria-current={locale === currentLocale ? "true" : undefined}
          className={cn(
            "rounded-md px-2 py-1 text-sm font-medium transition-colors",
            locale === currentLocale
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:bg-surface-hover hover:text-foreground"
          )}
        >
          {localeNames[locale]}
        </Link>
      ))}
    </div>
  );
}
