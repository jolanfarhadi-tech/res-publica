"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";

type Theme = "system" | "light" | "dark";

function apply(theme: Theme) {
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  document.documentElement.setAttribute("data-theme", resolved);
}

/**
 * ThemeToggle — cycles System → Light → Dark.
 * The choice is saved in localStorage; a small inline script in
 * the layout applies it before paint, so there is no flash.
 */
export function ThemeToggle({ dict }: { dict: Dictionary }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  function cycle() {
    const order: Theme[] = ["system", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    apply(next);
  }

  const labels: Record<Theme, string> = {
    system: dict.theme.system,
    light: dict.theme.light,
    dark: dict.theme.dark,
  };

  /* Simple inline icons — no icon library needed for one control. */
  const icons: Record<Theme, string> = {
    system: "◐",
    light: "○",
    dark: "●",
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${dict.theme.label}: ${labels[theme]}`}
      title={`${dict.theme.label}: ${labels[theme]}`}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-3 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <span aria-hidden="true">{mounted ? icons[theme] : "◐"}</span>
      <span className="hidden sm:inline">{mounted ? labels[theme] : dict.theme.system}</span>
    </button>
  );
}
