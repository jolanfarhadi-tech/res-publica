import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { NewsletterSignup } from "./NewsletterSignup";

/**
 * Footer — full sitemap in two grouped columns (Organization /
 * Our work), plus tagline and copyright. Grid + logical text
 * alignment, so it mirrors correctly on RTL pages.
 */
export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  const t = dict.nav;

  const organization = [
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/mission-vision`, label: t.missionVision },
    { href: `/${locale}/team`, label: t.team },
    { href: `/${locale}/partners`, label: t.partners },
    { href: `/${locale}/contact`, label: t.contact },
  ];
  const work = [
    { href: `/${locale}/news`, label: t.news },
    { href: `/${locale}/projects`, label: t.projects },
    { href: `/${locale}/research`, label: t.research },
    { href: `/${locale}/publications`, label: t.publications },
    { href: `/${locale}/events`, label: t.events },
    { href: `/${locale}/membership`, label: t.membership },
  ];

  const groupHeading =
    "mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gold";
  const link =
    "text-sm text-muted transition-colors hover:text-accent";

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="font-serif text-lg tracking-[0.18em]">
              RES<span className="text-gold">·</span>PUBLICA
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {dict.footer.tagline}
            </p>
          </div>

          {/* Sitemap: organization */}
          <nav aria-label={dict.footer.groups.organization}>
            <p className={groupHeading}>{dict.footer.groups.organization}</p>
            <ul className="space-y-2.5">
              {organization.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sitemap: our work */}
          <nav aria-label={dict.footer.groups.work}>
            <p className={groupHeading}>{dict.footer.groups.work}</p>
            <ul className="space-y-2.5">
              {work.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <NewsletterSignup dict={dict} />
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-sm text-muted">
            © {year} Res Publica. {dict.footer.rights}
          </p>
        </div>
      </Container>
    </footer>
  );
}
