import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getExperienceCopy } from "@/i18n/experience";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { offeringsForCategory } from "@/data/public-offerings";
import { getEntries, type Collection, type Entry } from "@/lib/collections";
import { formatDate } from "@/lib/dates";
import { absoluteUrl, pageAlternates } from "@/lib/seo";

/**
 * The long homepage remains a server-rendered reading experience. Motion is
 * reserved for the dedicated Lab route so the primary narrative does not pay
 * a large hydration cost for decorative entrance effects.
 */
function FadeIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function ActionLink({
  href,
  children,
  inverse = false,
}: {
  href: string;
  children: React.ReactNode;
  inverse?: boolean;
}) {
  return (
    <Link
      href={href}
      className={inverse ? "button-secondary border-paper/25 bg-paper/8 text-paper hover:text-signal" : "button-secondary"}
    >
      {children} <Arrow />
    </Link>
  );
}

function SectionLead({
  label,
  title,
  text,
  dark = false,
}: {
  label: string;
  title: string;
  text: string;
  dark?: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.32fr_1fr]">
      <p className={`civic-label ${dark ? "inverse-label" : ""}`}>{label}</p>
      <div>
        <h2 className="max-w-4xl text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <p
          className={`mt-6 max-w-3xl text-lg leading-relaxed ${
            dark ? "text-paper/68" : "text-muted"
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function CollectionPreview({
  locale,
  collection,
  entries,
  empty,
}: {
  locale: Locale;
  collection: Collection;
  entries: Entry[];
  empty: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface/55 p-7">
        <p className="max-w-2xl leading-relaxed text-muted">{empty}</p>
      </div>
    );
  }

  return (
    <ol className="mt-10 divide-y divide-border border-y border-border">
      {entries.slice(0, 3).map((entry, index) => (
        <li key={entry.slug}>
          <Link
            href={`/${locale}/${collection}/${entry.slug}`}
            className="group grid gap-3 py-6 transition-colors hover:text-accent sm:grid-cols-[3rem_1fr_auto] sm:items-center"
          >
            <span className="editorial-index text-xs text-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="block font-serif text-2xl font-semibold">
                {entry.title}
              </span>
              <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-muted">
                {entry.description}
              </span>
            </span>
            <span className="text-sm text-muted group-hover:text-accent">
              {formatDate(locale, entry.date)}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: pageAlternates(locale, ""),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const copy = getExperienceCopy(locale).home;
  const siteCopy = getPublicSiteCopy(locale);
  const projects = getEntries(locale, "projects");
  const research = getEntries(locale, "research");
  const publications = getEntries(locale, "publications");
  const events = getEntries(locale, "events");
  const news = getEntries(locale, "news");
  const programmes = offeringsForCategory(locale, "programs");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Res Publica e.V.",
          url: absoluteUrl(`/${locale}`),
          logo: absoluteUrl("/icon.svg"),
          description: dict.meta.description,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Frankfurt am Main",
            addressCountry: "DE",
          },
        }}
      />

      <section className="institutional-grid relative isolate overflow-hidden text-paper">
        <div className="observatory-orbit" aria-hidden="true" />
        <Container className="relative z-10 grid min-h-[calc(100svh-4.5rem)] content-between gap-12 py-10 sm:py-14">
          <FadeIn className="flex flex-wrap items-center justify-between gap-4 border-b border-paper/16 pb-5">
            <p className="civic-label inverse-label">{copy.hero.kicker}</p>
            <p className="text-xs font-medium text-paper/48">DE · EN · FA</p>
          </FadeIn>

          <div className="max-w-5xl py-8">
            <h1 className="display-hero text-paper">{copy.hero.title}</h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-paper/72 sm:text-xl">
              {copy.hero.text}
            </p>
          </div>

          <FadeIn
            delay={0.12}
            className="glass-panel inverse-panel grid gap-7 rounded-2xl p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end"
          >
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {copy.hero.proof.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm font-semibold text-paper/82"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-signal"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}${copy.hero.primary.href}`}
                className="button-primary border-paper bg-paper text-night hover:bg-signal"
              >
                {copy.hero.primary.label} <Arrow />
              </Link>
              <ActionLink
                href={`/${locale}${copy.hero.secondary.href}`}
                inverse
              >
                {copy.hero.secondary.label}
              </ActionLink>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="section-shell bg-paper text-night">
        <Container>
          <FadeIn>
            <SectionLead {...copy.mission} />
          </FadeIn>
          <FadeIn
            delay={0.08}
            className="mt-14 grid gap-px border border-night/12 bg-night/12 md:grid-cols-3"
          >
            {copy.hero.proof.map((item, index) => (
              <div key={item} className="bg-paper p-6 sm:p-8">
                <span className="editorial-index text-xs text-verdigris">
                  0{index + 1}
                </span>
                <p className="mt-12 font-serif text-2xl font-semibold">{item}</p>
              </div>
            ))}
          </FadeIn>
        </Container>
      </section>

      <section className="section-shell border-y border-border bg-bg">
        <Container>
          <FadeIn>
            <SectionLead {...copy.research} />
          </FadeIn>
          <CollectionPreview
            locale={locale}
            collection="research"
            entries={research}
            empty={siteCopy.empty}
          />
          <div className="mt-8">
            <ActionLink href={`/${locale}/research`}>
              {copy.research.action}
            </ActionLink>
          </div>
        </Container>
      </section>

      <section className="section-shell bg-surface">
        <Container>
          <FadeIn>
            <SectionLead {...copy.projects} />
          </FadeIn>
          <CollectionPreview
            locale={locale}
            collection="projects"
            entries={projects}
            empty={siteCopy.empty}
          />
          <div className="mt-8">
            <ActionLink href={`/${locale}/projects`}>
              {copy.projects.action}
            </ActionLink>
          </div>
        </Container>
      </section>

      <section className="section-shell overflow-hidden bg-deep-blue text-paper">
        <Container>
          <FadeIn>
            <SectionLead {...copy.programmes} dark />
          </FadeIn>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {programmes.map((programme) => (
              <article
                key={programme.id}
                className="glass-panel inverse-panel rounded-2xl p-6 sm:p-8"
              >
                <p className="civic-label inverse-label">
                  {siteCopy.offerings.labels[programme.maturity]}
                </p>
                <h3 className="mt-4 text-3xl text-paper">{programme.title}</h3>
                <p className="mt-4 max-w-xl leading-relaxed text-paper/68">
                  {programme.description}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <ActionLink href={`/${locale}/programs`} inverse>
              {copy.programmes.action}
            </ActionLink>
          </div>
        </Container>
      </section>

      <section className="section-shell bg-bg">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <FadeIn>
            <SectionLead {...copy.lab} />
            <div className="mt-8">
              <ActionLink href={`/${locale}/lab`}>{copy.lab.action}</ActionLink>
            </div>
          </FadeIn>
          <FadeIn
            delay={0.08}
            className="relative min-h-96 overflow-hidden rounded-2xl bg-night p-7 text-paper shadow-[0_28px_70px_-42px_rgb(5_26_43_/_0.75)]"
          >
            <div className="observatory-orbit !inset-block-start-[8%] !inset-inline-end-[-16rem] !w-[34rem]" aria-hidden="true" />
            <p className="civic-label inverse-label relative z-10">{copy.lab.label}</p>
            <ol className="relative z-10 mt-24 max-w-md divide-y divide-paper/15 border-y border-paper/15">
              {[
                copy.research.label,
                getExperienceCopy(locale).lab.governanceTitle,
                getExperienceCopy(locale).lab.ethicsTitle,
                getExperienceCopy(locale).lab.innovationTitle,
              ].map((item, index) => (
                <li key={item} className="flex items-center justify-between gap-5 py-4">
                  <span>{item}</span>
                  <span className="editorial-index text-xs text-paper/68">
                    0{index + 1}
                  </span>
                </li>
              ))}
            </ol>
          </FadeIn>
        </Container>
      </section>

      <section className="section-shell border-y border-border bg-paper text-night">
        <Container>
          <FadeIn>
            <SectionLead {...copy.publications} />
          </FadeIn>
          <CollectionPreview
            locale={locale}
            collection="publications"
            entries={publications}
            empty={siteCopy.empty}
          />
          <div className="mt-8">
            <ActionLink href={`/${locale}/publications`}>
              {copy.publications.action}
            </ActionLink>
          </div>
        </Container>
      </section>

      <section className="section-shell bg-surface">
        <Container className="grid gap-14 lg:grid-cols-2">
          <FadeIn>
            <SectionLead {...copy.events} />
            <CollectionPreview
              locale={locale}
              collection="events"
              entries={events}
              empty={siteCopy.empty}
            />
            <div className="mt-8">
              <ActionLink href={`/${locale}/events`}>
                {copy.events.action}
              </ActionLink>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <SectionLead {...copy.news} />
            <CollectionPreview
              locale={locale}
              collection="news"
              entries={news}
              empty={siteCopy.empty}
            />
            <div className="mt-8">
              <ActionLink href={`/${locale}/news`}>
                {copy.news.action}
              </ActionLink>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="section-shell bg-bg">
        <Container className="grid gap-14 lg:grid-cols-2">
          <FadeIn className="rounded-2xl bg-night p-7 text-paper sm:p-10">
            <SectionLead {...copy.membership} dark />
            <div className="mt-8">
              <ActionLink href={`/${locale}/membership`} inverse>
                {copy.membership.action}
              </ActionLink>
            </div>
          </FadeIn>
          <FadeIn delay={0.08} className="rounded-2xl border border-border bg-surface p-7 sm:p-10">
            <SectionLead {...copy.partners} />
            <div className="mt-8">
              <ActionLink href={`/${locale}/partners`}>
                {copy.partners.action}
              </ActionLink>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="section-shell bg-night text-paper">
        <Container>
          <FadeIn className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <SectionLead
              label={copy.close.label}
              title={copy.close.title}
              text={copy.close.text}
              dark
            />
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}${copy.close.primary.href}`}
                className="button-primary border-paper bg-paper text-night hover:bg-signal"
              >
                {copy.close.primary.label} <Arrow />
              </Link>
              <ActionLink
                href={`/${locale}${copy.close.secondary.href}`}
                inverse
              >
                {copy.close.secondary.label}
              </ActionLink>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
