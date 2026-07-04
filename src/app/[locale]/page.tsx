import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { getEntries, type Entry } from "@/lib/collections";
import { formatDate, todayIso } from "@/lib/dates";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EntryCard } from "@/components/ui/EntryCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/motion/FadeIn";
import { pageAlternates, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * Home — Milestone 4.
 * The page is now driven by real content: featured projects,
 * the latest research/publications, and upcoming events are
 * read from the collections at build time.
 */

/** Section heading with a quiet "view all" link on the same line. */
function SectionRow({
  title,
  href,
  viewAll,
}: {
  title: string;
  href: string;
  viewAll: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      <Link
        href={href}
        className="text-sm text-accent underline underline-offset-4"
      >
        {viewAll}
      </Link>
    </div>
  );
}

function EntryGrid({
  entries,
  locale,
  dict,
}: {
  entries: Entry[];
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry, index) => (
        <FadeIn key={`${entry.collection}-${entry.slug}`} delay={index * 0.08}>
          <EntryCard
            href={`/${locale}/${entry.collection}/${entry.slug}`}
            title={entry.title}
            description={entry.description}
            date={formatDate(locale, entry.date)}
            tags={entry.tags}
            meta={
              entry.collection === "events" ? entry.location : undefined
            }
          />
        </FadeIn>
      ))}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
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
  const dict = getDictionary(locale);

  const projects = getEntries(locale, "projects").slice(0, 3);
  const research = getEntries(locale, "research").slice(0, 3);
  const publications = getEntries(locale, "publications").slice(0, 3);
  const today = todayIso();
  const upcomingEvents = getEntries(locale, "events")
    .filter((entry) => (entry.endDate ?? entry.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Res Publica",
          url: absoluteUrl(`/${locale}`),
          logo: absoluteUrl("/icon.svg"),
          description: dict.meta.description,
        }}
      />
      {/* Hero */}
      <section className="border-b border-border">
        <Container className="py-24 sm:py-32">
          <FadeIn>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gold">
              {dict.hero.eyebrow}
            </p>
            <h1 className="max-w-3xl text-4xl leading-tight sm:text-6xl">
              {dict.hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {dict.hero.lede}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href={`/${locale}/mission-vision`}>
                {dict.hero.ctaPrimary}
              </Button>
              <Button href={`/${locale}/contact`} variant="secondary">
                {dict.hero.ctaSecondary}
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Pillars */}
      <section>
        <Container className="py-16 sm:py-24">
          <FadeIn>
            <SectionHeading eyebrow="Res Publica">
              {dict.pillars.heading}
            </SectionHeading>
          </FadeIn>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dict.pillars.items.map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.08}>
                <Card title={item.title}>{item.text}</Card>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured projects */}
      {projects.length > 0 && (
        <section className="border-t border-border bg-surface">
          <Container className="py-16 sm:py-24">
            <FadeIn>
              <SectionRow
                title={dict.home.featuredProjects}
                href={`/${locale}/projects`}
                viewAll={dict.home.viewAll}
              />
            </FadeIn>
            <EntryGrid entries={projects} locale={locale} dict={dict} />
          </Container>
        </section>
      )}

      {/* Latest research */}
      {research.length > 0 && (
        <section className="border-t border-border">
          <Container className="py-16 sm:py-24">
            <FadeIn>
              <SectionRow
                title={dict.home.latestResearch}
                href={`/${locale}/research`}
                viewAll={dict.home.viewAll}
              />
            </FadeIn>
            <EntryGrid entries={research} locale={locale} dict={dict} />
          </Container>
        </section>
      )}

      {/* Latest publications */}
      {publications.length > 0 && (
        <section className="border-t border-border bg-surface">
          <Container className="py-16 sm:py-24">
            <FadeIn>
              <SectionRow
                title={dict.home.latestPublications}
                href={`/${locale}/publications`}
                viewAll={dict.home.viewAll}
              />
            </FadeIn>
            <EntryGrid entries={publications} locale={locale} dict={dict} />
          </Container>
        </section>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <section className="border-t border-border">
          <Container className="py-16 sm:py-24">
            <FadeIn>
              <SectionRow
                title={dict.home.upcomingEvents}
                href={`/${locale}/events`}
                viewAll={dict.home.viewAll}
              />
            </FadeIn>
            <EntryGrid entries={upcomingEvents} locale={locale} dict={dict} />
          </Container>
        </section>
      )}

      {/* Call to action */}
      <section className="border-t border-border">
        <Container className="py-16 sm:py-20">
          <FadeIn className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl">{dict.cta.title}</h2>
              <p className="mt-2 text-muted">{dict.cta.text}</p>
            </div>
            <Button href={`/${locale}/contact`}>{dict.cta.button}</Button>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
