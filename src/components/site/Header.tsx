"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { PreferenceTrigger } from "@/components/privacy/PreferenceProvider";
import { getExperienceCopy } from "@/i18n/experience";
import { publicNavigation } from "@/data/public-navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { AccountControl } from "./AccountControl";

export function navItems(locale: Locale) {
  return publicNavigation(locale);
}

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const items = navItems(locale);
  const privacy = getExperienceCopy(locale).privacy;

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

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const dialog = menuDialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeAtDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeAtDesktop);
    return () => desktop.removeEventListener("change", closeAtDesktop);
  }, []);

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

        <nav aria-label={dict.a11y.mainNavigation} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-muted hover:bg-surface/70 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="hidden 2xl:block">
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
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button inline-grid lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? dict.nav.menuClose : dict.nav.menuOpen}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {open ? "×" : "≡"}
            </span>
          </button>
        </div>
      </Container>

      <dialog
        ref={menuDialogRef}
        className="mobile-menu-dialog fixed inset-0 m-0 h-svh max-h-none w-full max-w-none border-0 bg-surface p-0 text-ink"
        aria-labelledby="mobile-menu-title"
        onClose={() => {
          setOpen(false);
          menuButtonRef.current?.focus();
        }}
      >
        <div className="flex min-h-18 items-center justify-between border-b border-border px-4 sm:px-6">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 font-serif font-semibold tracking-[0.12em]"
            onClick={() => setOpen(false)}
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-night text-sm text-paper">
              RP
            </span>
            <span>RES·PUBLICA</span>
          </Link>
          <button
            type="button"
            className="icon-button inline-grid"
            aria-label={dict.nav.menuClose}
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </div>
        <nav
          id="mobile-menu"
          aria-label={dict.a11y.mainNavigation}
          className="h-[calc(100svh-4.5rem)] overflow-y-auto"
        >
          <Container className="flex min-h-full flex-col py-8">
            <p id="mobile-menu-title" className="civic-label">{dict.a11y.mainNavigation}</p>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {items.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="group flex min-h-16 items-center justify-between py-4 text-start text-xl font-semibold text-ink transition-colors hover:text-accent"
                  >
                    <span>{item.label}</span>
                    <span
                      aria-hidden="true"
                      className="editorial-index text-xs text-muted"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AccountControl locale={locale} dict={dict} />
              <PreferenceTrigger className="button-secondary">
                {privacy.preferences}
              </PreferenceTrigger>
            </div>
            <div className="mt-auto border-t border-border pt-6">
              <LanguageSwitcher current={locale} dict={dict} />
            </div>
          </Container>
        </nav>
      </dialog>
    </header>
  );
}
