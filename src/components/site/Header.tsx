import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { PreferenceTrigger } from "@/components/privacy/PreferenceProvider";
import { getExperienceCopy } from "@/i18n/experience";
import { publicNavigation } from "@/data/public-navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { AccountControl } from "./AccountControl";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { HeaderNavLink } from "./HeaderNavLink";

export function navItems(locale: Locale) {
  return publicNavigation(locale);
}

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = navItems(locale);
  const privacy = getExperienceCopy(locale).privacy;

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-[var(--glass)] shadow-[0_12px_34px_-28px_rgb(5_26_43_/_0.42)] backdrop-blur-2xl">
      <Container className="flex min-h-18 items-center justify-between gap-4 py-2">
        <Link
          href={`/${locale}`}
          className="group flex min-w-0 shrink-0 items-center gap-3 text-ink"
          aria-label="RP Res Publica"
        >
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-xl bg-night font-serif text-sm text-paper shadow-[0_10px_24px_-16px_rgb(5_26_43_/_0.8)] transition-transform group-hover:-translate-y-0.5"
          >
            RP
          </span>
          <span className="hidden truncate font-serif text-base font-semibold tracking-[0.12em] min-[28rem]:inline sm:text-lg">
            RES<span className="text-accent">·</span>PUBLICA
          </span>
        </Link>

        <nav aria-label={dict.a11y.mainNavigation} className="hidden min-[90rem]:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <HeaderNavLink href={item.href} label={item.label} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="hidden min-[90rem]:block">
            <AccountControl locale={locale} dict={dict} />
          </div>
          <Link
            href={`/${locale}/search`}
            aria-label={dict.search.label}
            title={dict.search.label}
            className="icon-button inline-grid"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Link>
          <PreferenceTrigger className="icon-button hidden sm:inline-grid">
            <span className="sr-only">{privacy.preferences}</span>
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M7 14v6" />
            </svg>
          </PreferenceTrigger>
          <div className="hidden min-[90rem]:block">
            <LanguageSwitcher current={locale} dict={dict} />
          </div>
          <ThemeToggle dict={dict} />
          <HeaderMobileMenu locale={locale} dict={dict} items={items} />
        </div>
      </Container>
    </header>
  );
}
