import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { NewsletterSignup } from "./NewsletterSignup";
import { getPublicSiteCopy } from "@/i18n/public-site";

/**
 * Footer — full sitemap in two grouped columns (Organization /
 * Our work), plus tagline and copyright. Grid + logical text
 * alignment, so it mirrors correctly on RTL pages.
 */
export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  const t = getPublicSiteCopy(locale);

  const organization = [
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/mission-vision`, label: t.nav.mission },
    { href: `/${locale}/team`, label: t.nav.team },
    { href: `/${locale}/partners`, label: t.nav.partners },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];
  const work = [
    { href: `/${locale}/method`, label: t.nav.method },
    { href: `/${locale}/programs`, label: t.nav.programs },
    { href: `/${locale}/products`, label: t.nav.products },
    { href: `/${locale}/services`, label: t.nav.services },
    { href: `/${locale}/projects`, label: t.nav.projects },
    { href: `/${locale}/research`, label: t.nav.research },
    { href: `/${locale}/publications`, label: t.nav.publications },
    { href: `/${locale}/events`, label: t.nav.events },
    { href: `/${locale}/membership`, label: t.nav.membership },
  ];
  const legal = [
    { href: `/${locale}/impressum`, label: "Impressum" },
    { href: `/${locale}/datenschutz`, label: "Datenschutz" },
  ];

  const groupHeading =
    "mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gold";
  const link =
    "text-sm text-muted transition-colors hover:text-accent";

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
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

          {/* The approved legal texts are intentionally German in every locale. */}
          <nav aria-label="Rechtliches">
            <p className={groupHeading}>Rechtliches</p>
            <ul className="space-y-2.5">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter is offered only when a provider is operationally configured. */}
          {isNewsletterConfigured() ? (
            <NewsletterSignup dict={dict} />
          ) : (
            <div>
              <p className={groupHeading}>{dict.newsletter.title}</p>
              <p className="max-w-xs text-sm leading-relaxed text-muted">
                {t.newsletterUnavailable}
              </p>
            </div>
          )}
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

function isNewsletterConfigured(): boolean {
  if (process.env.NEWSLETTER_PROVIDER === "buttondown") {
    return Boolean(process.env.BUTTONDOWN_API_KEY);
  }
  if (process.env.NEWSLETTER_PROVIDER === "mailchimp") {
    return Boolean(process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_AUDIENCE_ID);
  }
  return false;
}
