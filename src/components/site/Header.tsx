"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

/** The one place the main navigation is defined (header + footer). */
export function navItems(locale: Locale, dict: Dictionary) {
  const t = dict.nav;
  return [
    { href: `/${locale}/news`, label: t.news },
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/mission-vision`, label: t.missionVision },
    { href: `/${locale}/projects`, label: t.projects },
    { href: `/${locale}/research`, label: t.research },
    { href: `/${locale}/publications`, label: t.publications },
    { href: `/${locale}/events`, label: t.events },
    { href: `/${locale}/membership`, label: t.membership },
    { href: `/${locale}/team`, label: t.team },
    { href: `/${locale}/partners`, label: t.partners },
    { href: `/${locale}/contact`, label: t.contact },
  ];
}

/**
 * Header — sticky, with the RES·PUBLICA wordmark and the FULL
 * main navigation on desktop (≥ lg). Only logical flow properties
 * are used, so the layout mirrors correctly on RTL (Persian) pages.
 */
export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Allow closing the menu with the Escape key.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        // Return focus to the button that opened the menu (WCAG 2.4.3).
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = navItems(locale, dict);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Wordmark — serif, letterspaced, gold interpunct. */}
        <Link
          href={`/${locale}`}
          className="shrink-0 font-serif text-lg tracking-[0.18em] text-ink"
        >
          RES<span className="text-gold">·</span>PUBLICA
        </Link>

        {/* Full navigation on desktop, including Events and Team. */}
        <nav aria-label={dict.a11y.mainNavigation} className="hidden lg:block">
          <ul className="flex items-center gap-4 xl:gap-5">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`whitespace-nowrap text-sm transition-colors hover:text-accent ${
                    pathname === item.href
                      ? "font-medium text-accent"
                      : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Search */}
          <Link
            href={`/${locale}/search`}
            aria-label={dict.search.label}
            title={dict.search.label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
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
          <div className="hidden xl:block">
            <LanguageSwitcher current={locale} dict={dict} />
          </div>
          <ThemeToggle dict={dict} />
          {/* Mobile menu button */}
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? dict.nav.menuClose : dict.nav.menuOpen}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </Container>

      {/* Mobile menu — full nav list plus the language switcher. */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label={dict.a11y.mainNavigation}
          className="border-t border-border bg-surface lg:hidden"
        >
          <Container className="py-4">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="block rounded-lg px-2 py-3 text-start text-ink hover:bg-bg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-border pt-4 xl:hidden">
              <LanguageSwitcher current={locale} dict={dict} />
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}
