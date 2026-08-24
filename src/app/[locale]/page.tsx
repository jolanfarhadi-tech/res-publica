import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ConstellationNarrative } from "@/components/site/ConstellationNarrative";
import { OfferingMatrix } from "@/components/site/OfferingMatrix";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { absoluteUrl, pageAlternates } from "@/lib/seo";

/** The primary narrative stays complete without hydration or collection data. */
function NarrativeBlock({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function SectionHeading({
  index,
  eyebrow,
  title,
  dark = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  dark?: boolean;
}) {
  return (
    <div className={`grid gap-5 border-t pt-5 sm:grid-cols-[5rem_1fr] ${dark ? "border-paper/25" : "border-current/20"}`}>
      <span className="editorial-index text-xs tracking-[0.16em] text-signal">{index}</span>
      <div>
        <p className={`civic-label ${dark ? "inverse-label" : "text-accent"}`}>{eyebrow}</p>
        <h2 className="mt-4 max-w-4xl text-4xl leading-tight sm:text-6xl">{title}</h2>
      </div>
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
  const copy = getPublicSiteCopy(locale).home;

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

      <section className="institutional-grid relative isolate overflow-hidden bg-night text-paper">
        <div className="observatory-orbit" aria-hidden="true" />
        <Container className="relative z-10 flex min-h-[calc(100svh-4.5rem)] flex-col justify-between py-10 sm:py-14 lg:py-16">
          <NarrativeBlock className="flex items-center justify-between gap-6 border-b border-paper/20 pb-5">
            <p className="civic-label inverse-label">{copy.hero.eyebrow}</p>
            <p aria-hidden="true" className="editorial-index hidden text-xs tracking-[0.18em] text-paper/45 sm:block">DE · EN · FA</p>
          </NarrativeBlock>
          <NarrativeBlock className="py-12 sm:py-16">
            <h1 className="display-hero max-w-[13ch] text-paper">{copy.hero.title}</h1>
          </NarrativeBlock>
          <NarrativeBlock className="grid gap-8 border-t border-paper/20 pt-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <p className="max-w-3xl text-lg leading-relaxed text-paper/75 sm:text-xl">{copy.hero.lede}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/method`} className="button-primary border-paper bg-paper text-night hover:bg-signal">
                {copy.hero.primary} <Arrow />
              </Link>
              <Link href={`/${locale}/mission-vision`} className="button-secondary border-paper/35 bg-transparent text-paper hover:border-paper hover:bg-paper/10">
                {copy.hero.secondary}
              </Link>
            </div>
          </NarrativeBlock>
        </Container>
      </section>

      <section className="section-shell bg-paper text-night">
        <Container>
          <SectionHeading index={copy.experience.index} eyebrow={copy.experience.eyebrow} title={copy.experience.title} />
          <div className="mt-10 grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
            <div aria-hidden="true" className="flex min-h-56 items-center justify-center rounded-2xl border border-night/15">
              <span className="text-6xl text-signal">✦</span>
            </div>
            <p className="max-w-3xl text-xl leading-relaxed text-night/70 sm:text-2xl">{copy.experience.text}</p>
          </div>
        </Container>
      </section>

      <section className="section-shell border-y border-border bg-bg">
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading index={copy.human.index} eyebrow={copy.human.eyebrow} title={copy.human.title} />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">{copy.human.text}</p>
          </div>
          <div>
            <SectionHeading index={copy.institutional.index} eyebrow={copy.institutional.eyebrow} title={copy.institutional.title} />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">{copy.institutional.text}</p>
          </div>
        </Container>
      </section>

      <section className="section-shell bg-night text-paper">
        <Container>
          <SectionHeading index={copy.constellation.index} eyebrow={copy.constellation.eyebrow} title={copy.constellation.title} dark />
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-paper/70">{copy.constellation.text}</p>
          <div className="mt-10"><ConstellationNarrative locale={locale} /></div>
        </Container>
      </section>

      <section className="section-shell bg-paper text-night">
        <Container>
          <SectionHeading index={copy.trust.index} eyebrow={copy.trust.eyebrow} title={copy.trust.title} />
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-night/65">{copy.trust.intro}</p>
          <ol className="mt-12 grid list-none gap-px border border-night/15 bg-night/15 md:grid-cols-5">
            {copy.trust.items.map(([title, text], index) => (
              <li key={title} className="bg-paper p-6">
                <span className="editorial-index text-xs text-signal">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 text-2xl">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-night/65">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="section-shell bg-deep-blue text-paper">
        <Container>
          <SectionHeading index={copy.fellowship.index} eyebrow={copy.fellowship.eyebrow} title={copy.fellowship.title} dark />
          <p className="mt-10 ms-auto max-w-3xl border-s border-paper/25 ps-7 text-xl leading-relaxed text-paper/75">{copy.fellowship.text}</p>
        </Container>
      </section>

      <section className="section-shell bg-bg">
        <Container>
          <SectionHeading index={copy.offerings.index} eyebrow={copy.offerings.eyebrow} title={copy.offerings.title} />
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted">{copy.offerings.text}</p>
          <ul className="mt-10 grid list-none gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {copy.offerings.links.map(([label, href]) => (
              <li key={href} className="bg-bg">
                <Link href={`/${locale}${href}`} className="flex min-h-20 items-center justify-between gap-4 p-5 font-medium hover:text-accent">
                  {label} <Arrow />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-12"><OfferingMatrix locale={locale} category="programs" limit={3} /></div>
        </Container>
      </section>

      <section className="section-shell border-y border-border bg-paper text-night">
        <Container>
          <SectionHeading index={copy.work.index} eyebrow={copy.work.eyebrow} title={copy.work.title} />
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-night/65">{copy.work.text}</p>
          <ul className="mt-10 grid list-none gap-px border border-night/15 bg-night/15 sm:grid-cols-2 lg:grid-cols-4">
            {copy.work.links.map(([label, href]) => (
              <li key={href} className="bg-paper">
                <Link href={`/${locale}${href}`} className="flex min-h-20 items-center justify-between gap-4 p-5 font-medium hover:text-accent">
                  {label} <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="section-shell bg-bg">
        <Container>
          <SectionHeading index={copy.audiences.index} eyebrow={copy.audiences.eyebrow} title={copy.audiences.title} />
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {copy.audiences.items.map(([title, text]) => (
              <article key={title} className="border-t border-border pt-6">
                <h3 className="text-3xl">{title}</h3>
                <p className="mt-4 max-w-xl leading-relaxed text-muted">{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-shell bg-night text-paper">
        <Container>
          <SectionHeading index={copy.close.index} eyebrow={copy.close.eyebrow} title={copy.close.title} dark />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-3xl text-lg leading-relaxed text-paper/70">{copy.close.text}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/membership`} className="button-primary border-paper bg-paper text-night hover:bg-signal">
                {copy.close.primary} <Arrow />
              </Link>
              <Link href={`/${locale}/about`} className="button-secondary border-paper/35 bg-transparent text-paper hover:border-paper">
                {copy.close.secondary}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
