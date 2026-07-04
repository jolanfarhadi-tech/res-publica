import Link from "next/link";
import { headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";

/**
 * Localized 404. not-found.tsx receives no route params, so the
 * middleware passes the locale via the `x-locale` request header.
 */
export default async function NotFound() {
  const headerList = await headers();
  const raw = headerList.get("x-locale") ?? defaultLocale;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <Container className="py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">{dict.home.notFoundTitle}</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        {dict.home.notFoundText}
      </p>
      <p className="mt-8">
        <Link
          href={`/${locale}`}
          className="text-accent underline underline-offset-4"
        >
          {dict.home.notFoundLink}
        </Link>
      </p>
    </Container>
  );
}
