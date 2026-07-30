"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Container } from "@/components/ui/Container";
import { PreferenceTrigger } from "@/components/privacy/PreferenceProvider";
import { getExperienceCopy } from "@/i18n/experience";
import { AccountControl } from "./AccountControl";
import { LanguageSwitcher } from "./LanguageSwitcher";

type NavigationItem = {
  href: string;
  label: string;
};

export function HeaderMobileMenu({
  locale,
  dict,
  items,
}: {
  locale: Locale;
  dict: Dictionary;
  items: readonly NavigationItem[];
}) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
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
    <>
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
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>
        <nav
          id="mobile-menu"
          aria-label={dict.a11y.mainNavigation}
          className="h-[calc(100svh-4.5rem)] overflow-y-auto"
        >
          <Container className="flex min-h-full flex-col py-8">
            <p id="mobile-menu-title" className="civic-label">
              {dict.a11y.mainNavigation}
            </p>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {items.map((item, index) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                        ? "page"
                        : undefined
                    }
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
    </>
  );
}
