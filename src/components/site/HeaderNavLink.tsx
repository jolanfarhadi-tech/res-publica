"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function HeaderNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition-colors ${
        active
          ? "bg-accent/10 text-accent"
          : "text-muted hover:bg-surface/70 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
