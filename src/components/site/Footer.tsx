import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { getExperienceCopy } from "@/i18n/experience";
import { PreferenceTrigger } from "@/components/privacy/PreferenceProvider";
import { NewsletterSignup } from "./NewsletterSignup";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  const site = getPublicSiteCopy(locale);
  const experience = getExperienceCopy(locale);

  const institution = [
    { href: `/${locale}/mission-vision`, label: site.nav.mission },
    { href: `/${locale}/about`, label: site.nav.about },
    { href: `/${locale}/team`, label: site.nav.team },
    { href: `/${locale}/partners`, label: site.nav.partners },
    { href: `/${locale}/contact`, label: site.nav.contact },
  ];
  const work = [
    { href: `/${locale}/method`, label: site.nav.method },
    { href: `/${locale}/programs`, label: site.nav.programs },
    { href: `/${locale}/projects`, label: site.nav.projects },
    { href: `/${locale}/lab`, label: experience.home.lab.label },
    { href: `/${locale}/research`, label: site.nav.research },
    { href: `/${locale}/publications`, label: site.nav.publications },
    { href: `/${locale}/events`, label: site.nav.events },
  ];
  const participation = [
    { href: `/${locale}/membership`, label: site.nav.membership },
    { href: `/${locale}/contact`, label: site.nav.contact },
    { href: `/${locale}/events`, label: site.nav.events },
    { href: `/${locale}/search`, label: dict.search.label },
  ];

  return (
    <footer className="border-t border-border bg-night text-paper">
      <Container className="py-14 sm:py-18">
        <div className="grid gap-12 border-b border-paper/15 pb-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-3 text-paper"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-paper font-serif text-sm text-night">
                RP
              </span>
              <span className="font-serif text-xl font-semibold tracking-[0.12em]">
                RES<span className="text-signal">·</span>PUBLICA
              </span>
            </Link>
            <p className="mt-5 max-w-sm leading-relaxed text-paper/65">
              {dict.footer.tagline}
            </p>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-paper/52">
              {experience.home.mission.text}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <FooterGroup
              title={dict.footer.groups.organization}
              links={institution}
            />
            <FooterGroup title={dict.footer.groups.work} links={work} />
            <FooterGroup
              title={experience.home.close.label}
              links={participation}
            />
          </div>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[1fr_auto] lg:items-start">
          {isNewsletterConfigured() ? (
            <NewsletterSignup locale={locale} dict={dict} />
          ) : (
            <div>
              <p className="civic-label inverse-label">{dict.newsletter.title}</p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/58">
                {site.newsletterUnavailable}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              href={`/${locale}/impressum`}
              className="button-secondary border-paper/20 bg-paper/5 text-paper hover:text-signal"
            >
              {dict.footer.imprint}
            </Link>
            <Link
              href={`/${locale}/datenschutz`}
              className="button-secondary border-paper/20 bg-paper/5 text-paper hover:text-signal"
            >
              {dict.footer.privacy}
            </Link>
            <Link
              href={`/${locale}/privacy`}
              className="button-secondary border-paper/20 bg-paper/5 text-paper hover:text-signal"
            >
              {experience.privacy.preferences}
            </Link>
            <PreferenceTrigger className="button-secondary border-paper/20 bg-paper/5 text-paper hover:text-signal">
              {experience.privacy.accessibilityTitle}
            </PreferenceTrigger>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-paper/15 pt-6 text-sm text-paper/48 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Res Publica e.V.</p>
          <p>{dict.footer.rights}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <nav aria-label={title}>
      <p className="text-sm font-semibold text-paper">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-paper/58 transition-colors hover:text-signal"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function isNewsletterConfigured(): boolean {
  if (process.env.NEWSLETTER_ENABLED !== "true") return false;
  if (process.env.NEWSLETTER_PROVIDER === "buttondown") {
    return Boolean(process.env.BUTTONDOWN_API_KEY);
  }
  if (process.env.NEWSLETTER_PROVIDER === "mailchimp") {
    return Boolean(
      process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_AUDIENCE_ID
    );
  }
  return false;
}
