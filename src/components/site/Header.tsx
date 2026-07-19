"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { AccountControl } from "./AccountControl";

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

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const items = navItems(locale, dict);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur-xl">
      <Container className="flex min-h-20 items-center justify-between gap-5 py-3 xl:min-h-0 xl:py-0">
        <Link href={`/${locale}`} className="group flex shrink-0 items-center gap-3 text-ink">
          <span aria-hidden="true" className="grid h-10 w-10 place-items-center border border-ink/30 font-serif text-sm transition-colors group-hover:border-accent group-hover:text-accent">RP</span>
          <span className="font-serif text-base tracking-[0.22em] sm:text-lg">
            RES<span className="text-gold">·</span>PUBLICA
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <AccountControl locale={locale} dict={dict} />
          <Link
            href={`/${locale}/search`}
            aria-label={dict.search.label}
            title={dict.search.label}
            className="inline-flex h-10 w-10 items-center justify-center border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Link>
          <div className="hidden 2xl:block">
            <LanguageSwitcher current={locale} dict={dict} />
          </div>
          <ThemeToggle dict={dict} />
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border border-border text-ink xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? dict.nav.menuClose : dict.nav.menuOpen}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" className="text-lg">{open ? "×" : "≡"}</span>
          </button>
        </div>
      </Container>

      <div className="hidden border-t border-border xl:block">
        <Container>
          <nav aria-label={dict.a11y.mainNavigation}>
            <ul className="flex min-h-12 items-center justify-between gap-4">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={`whitespace-nowrap text-xs font-medium uppercase tracking-[0.08em] transition-colors hover:text-accent ${pathname === item.href ? "text-accent" : "text-muted"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label={dict.a11y.mainNavigation} className="border-t border-border bg-night text-paper xl:hidden">
          <Container className="py-8 sm:py-10">
            <ul className="grid gap-px border border-paper/15 sm:grid-cols-2">
              {items.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="group flex min-h-16 items-center justify-between border-paper/15 px-5 py-4 text-start text-paper transition-colors hover:bg-paper hover:text-night sm:border-e"
                  >
                    <span>{item.label}</span>
                    <span aria-hidden="true" className="editorial-index text-xs text-signal group-hover:text-deep-blue">{String(index + 1).padStart(2, "0")}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-paper/20 pt-5 text-paper [&_a]:text-paper/70 [&_a:hover]:text-paper">
              <LanguageSwitcher current={locale} dict={dict} />
            </div>
          </Container>
        </nav>
      )}
    </header>
  );
}
