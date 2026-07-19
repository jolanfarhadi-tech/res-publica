import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getEntries, type Entry } from "@/lib/collections";
import { formatDate, todayIso } from "@/lib/dates";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/motion/FadeIn";
import { pageAlternates, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function SectionIntro({ index, title, link, linkLabel }: { index: string; title: string; link?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 grid gap-5 border-t border-current/25 pt-5 sm:grid-cols-[5rem_1fr_auto] sm:items-start">
      <span className="editorial-index text-xs tracking-[0.16em] text-gold">{index}</span>
      <h2 className="max-w-3xl text-3xl leading-tight sm:text-5xl">{title}</h2>
      {link && linkLabel && (
        <Link href={link} className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline hover:underline-offset-4">
          {linkLabel} <Arrow />
        </Link>
      )}
    </div>
  );
}

function EditorialEntry({ entry, locale, large = false }: { entry: Entry; locale: Locale; large?: boolean }) {
  return (
    <Link
      href={`/${locale}/${entry.collection}/${entry.slug}`}
      className={`group grid h-full border-t border-current/25 py-6 transition-colors hover:text-accent ${large ? "gap-8 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)] md:py-9" : "gap-4"}`}
    >
      <div>
        <p className="editorial-index text-xs uppercase tracking-[0.15em] text-gold">{formatDate(locale, entry.date)}</p>
        <h3 className={`${large ? "mt-5 text-4xl sm:text-5xl" : "mt-3 text-2xl"} leading-tight`}>{entry.title}</h3>
      </div>
      <div className={large ? "md:pt-7" : ""}>
        {entry.collection === "events" && entry.location && <p className="mb-2 text-sm font-medium text-ink/70 dark:text-paper/70">{entry.location}</p>}
        <p className="leading-relaxed text-muted group-hover:text-current">{entry.description}</p>
        {entry.tags?.length ? <p className="mt-5 text-xs uppercase tracking-[0.12em] text-muted">{entry.tags.join(" · ")}</p> : null}
      </div>
    </Link>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.meta.title, description: dict.meta.description, alternates: pageAlternates(locale, "") };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
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
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "Res Publica", url: absoluteUrl(`/${locale}`), logo: absoluteUrl("/icon.svg"), description: dict.meta.description }} />

      <section className="institutional-grid relative isolate min-h-[calc(100svh-8rem)] overflow-hidden bg-night text-paper">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 end-[7%] z-0 hidden w-[28vw] border-x border-paper/10 lg:block">
          <span className="absolute end-[-0.08em] top-1/2 -translate-y-1/2 font-serif text-[30vw] leading-none text-paper/[0.025]">R</span>
        </div>
        <Container className="relative z-10 flex min-h-[calc(100svh-8rem)] flex-col justify-between py-10 sm:py-14 lg:py-16">
          <FadeIn className="flex items-center justify-between gap-6 border-b border-paper/20 pb-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-signal">{dict.hero.eyebrow}</p>
            <p aria-hidden="true" className="editorial-index text-xs tracking-[0.18em] text-paper/45">FRANKFURT · DE / EN / FA</p>
          </FadeIn>
          <FadeIn delay={0.08} className="py-12 sm:py-16">
            <h1 className="display-hero max-w-[12ch] text-paper">{dict.hero.title}</h1>
          </FadeIn>
          <FadeIn delay={0.16} className="grid gap-8 border-t border-paper/20 pt-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <p className="max-w-2xl text-lg leading-relaxed text-paper/72 sm:text-xl">{dict.hero.lede}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/mission-vision`} className="inline-flex min-h-12 items-center gap-4 bg-paper px-6 text-sm font-semibold text-night transition-colors hover:bg-signal">
                {dict.hero.ctaPrimary} <Arrow />
              </Link>
              <Link href={`/${locale}/contact`} className="inline-flex min-h-12 items-center gap-4 border border-paper/35 px-6 text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper/10">
                {dict.hero.ctaSecondary}
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-paper text-night">
        <Container className="py-20 sm:py-28 lg:py-36">
          <FadeIn>
            <SectionIntro index="01" title={dict.pillars.heading} />
          </FadeIn>
          <div className="grid border-y border-night/20 lg:grid-cols-3">
            {dict.pillars.items.map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.06} className="border-b border-night/20 p-7 last:border-b-0 lg:border-b-0 lg:border-e lg:last:border-e-0 sm:p-9">
                <p className="editorial-index text-xs text-signal">0{index + 1}</p>
                <h3 className="mt-10 text-3xl">{item.title}</h3>
                <p className="mt-5 leading-relaxed text-night/65">{item.text}</p>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-bg">
        <Container className="py-20 sm:py-28">
          <FadeIn>
            <SectionIntro index="02" title={dict.platformFoundation.heading} />
            <div className="mb-12 grid gap-6 md:grid-cols-[1fr_2fr]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">{dict.platformFoundation.eyebrow} · {dict.platformFoundation.badge}</p>
              <p className="max-w-3xl text-lg leading-relaxed text-muted">{dict.platformFoundation.intro}</p>
            </div>
          </FadeIn>
          <div className="grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {dict.platformFoundation.items.map((item, index) => (
              <FadeIn key={item.title} delay={(index % 3) * 0.05} className="border-b border-border px-0 py-7 sm:px-7 sm:[&:nth-child(odd)]:border-e lg:[&:nth-child(odd)]:border-e-0 lg:[&:not(:nth-child(3n))]:border-e">
                <p className="editorial-index text-xs text-gold">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-5 text-2xl">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{item.text}</p>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {projects.length > 0 && (
        <section className="bg-night text-paper">
          <Container className="py-20 sm:py-28">
            <FadeIn><SectionIntro index="03" title={dict.home.featuredProjects} link={`/${locale}/projects`} linkLabel={dict.home.viewAll} /></FadeIn>
            <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
              <FadeIn><EditorialEntry entry={projects[0]} locale={locale} large /></FadeIn>
              <div>{projects.slice(1).map((entry, index) => <FadeIn key={entry.slug} delay={index * 0.06}><EditorialEntry entry={entry} locale={locale} /></FadeIn>)}</div>
            </div>
          </Container>
        </section>
      )}

      <section className="bg-paper text-night">
        <Container className="py-20 sm:py-28">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
            {research.length > 0 && (
              <div>
                <FadeIn><SectionIntro index="04" title={dict.home.latestResearch} link={`/${locale}/research`} linkLabel={dict.home.viewAll} /></FadeIn>
                {research.map((entry, index) => <FadeIn key={entry.slug} delay={index * 0.05}><EditorialEntry entry={entry} locale={locale} /></FadeIn>)}
              </div>
            )}
            {publications.length > 0 && (
              <div>
                <FadeIn><SectionIntro index="05" title={dict.home.latestPublications} link={`/${locale}/publications`} linkLabel={dict.home.viewAll} /></FadeIn>
                {publications.map((entry, index) => <FadeIn key={entry.slug} delay={index * 0.05}><EditorialEntry entry={entry} locale={locale} /></FadeIn>)}
              </div>
            )}
          </div>
        </Container>
      </section>

      {upcomingEvents.length > 0 && (
        <section className="border-y border-border bg-bg">
          <Container className="py-20 sm:py-28">
            <FadeIn><SectionIntro index="06" title={dict.home.upcomingEvents} link={`/${locale}/events`} linkLabel={dict.home.viewAll} /></FadeIn>
            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
              <FadeIn><EditorialEntry entry={upcomingEvents[0]} locale={locale} large /></FadeIn>
              <div>{upcomingEvents.slice(1).map((entry, index) => <FadeIn key={entry.slug} delay={index * 0.05}><EditorialEntry entry={entry} locale={locale} /></FadeIn>)}</div>
            </div>
          </Container>
        </section>
      )}

      <section className="bg-deep-blue text-paper">
        <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-signal">{dict.nav.membership}</p>
            <h2 className="mt-5 text-4xl leading-tight sm:text-6xl">{dict.platform.membership.title}</h2>
          </FadeIn>
          <FadeIn delay={0.08}>
            <p className="max-w-2xl text-lg leading-relaxed text-paper/75">{dict.platform.membership.lede}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-paper/55">{dict.platform.membership.accountableNotice}</p>
            <Link href={`/${locale}/membership`} className="mt-8 inline-flex min-h-12 items-center gap-4 bg-paper px-6 text-sm font-semibold text-night transition-colors hover:bg-signal">
              {dict.platform.membership.submit} <Arrow />
            </Link>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-night text-paper">
        <Container className="py-20 sm:py-28">
          <FadeIn className="grid gap-10 border-t border-paper/20 pt-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-signal">Res Publica</p>
              <h2 className="mt-6 max-w-4xl text-5xl leading-[0.95] sm:text-7xl">{dict.cta.title}</h2>
              <p className="mt-6 text-lg text-paper/65">{dict.cta.text}</p>
            </div>
            <Link href={`/${locale}/contact`} className="inline-flex min-h-14 items-center justify-center gap-5 border border-paper/40 px-8 text-sm font-semibold transition-colors hover:bg-paper hover:text-night">
              {dict.cta.button} <Arrow />
            </Link>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
