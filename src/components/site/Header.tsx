"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

/** One place to define the main navigation for all languages. */
function navItems(locale: Locale, dict: Dictionary) {
  const t = dict.nav;
  return [
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/mission`, label: t.mission },
    { href: `/${locale}/projects`, label: t.projects },
    { href: `/${locale}/research`, label: t.research },
    { href: `/${locale}/publications`, label: t.publications },
    { href: `/${locale}/events`, label: t.events },
    { href: `/${locale}/team`, label: t.team },
    { href: `/${locale}/partners`, label: t.partners },
    { href: `/${locale}/contact`, label: t.contact },
  ];
}

/**
 * Header — sticky, translucent, with the RES·PUBLICA wordmark.
 * Desktop shows a condensed nav; the full list lives in the
 * mobile menu (and will move into grouped menus in Milestone 2).
 */
export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Allow closing the menu with the Escape key.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = navItems(locale, dict);
  // Keep the desktop bar calm: first five sections + contact.
  const desktopItems = [...items.slice(0, 5), items[items.length - 1]];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Wordmark — serif, letterspaced, gold interpunct. */}
        <Link
          href={`/${locale}`}
          className="font-serif text-lg tracking-[0.18em] text-ink"
        >
          RES<span className="text-gold">·</span>PUBLICA
        </Link>

        <nav
          aria-label={dict.a11y.mainNavigation}
          className="hidden lg:block"
        >
          <ul className="flex items-center gap-6">
            {desktopItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`text-sm transition-colors hover:text-accent ${
                    pathname === item.href ? "text-accent" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher current={locale} dict={dict} />
          </div>
          <ThemeToggle dict={dict} />
          {/* Mobile menu button */}
          <button
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
                    className="block rounded-lg px-2 py-3 text-ink hover:bg-bg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-border pt-4 sm:hidden">
              <LanguageSwitcher current={locale} dict={dict} />
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}
