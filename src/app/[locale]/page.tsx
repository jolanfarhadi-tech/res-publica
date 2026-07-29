import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/motion/FadeIn";
import { pageAlternates, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ConstellationNarrative } from "@/components/site/ConstellationNarrative";
import { PublicCategoryOverview } from "@/components/site/PublicCategoryOverview";

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
      <span className="editorial-index text-xs tracking-[0.16em] text-gold">{index}</span>
      <div>
        <p className={`text-xs font-medium uppercase tracking-[0.18em] ${dark ? "text-signal" : "text-accent"}`}>
          {eyebrow}
        </p>
        <h2 className="mt-4 max-w-4xl text-4xl leading-tight sm:text-6xl">{title}</h2>
      </div>
    </div>
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
  const copy = getPublicSiteCopy(locale).home;

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "Res Publica", url: absoluteUrl(`/${locale}`), logo: absoluteUrl("/icon.svg"), description: dict.meta.description }} />

      <section className="institutional-grid relative isolate min-h-[calc(100svh-8rem)] overflow-hidden bg-night text-paper">
        <Container className="relative z-10 flex min-h-[calc(100svh-8rem)] flex-col justify-between py-10 sm:py-14 lg:py-16">
          <FadeIn className="flex items-center justify-between gap-6 border-b border-paper/20 pb-5">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-signal">{copy.hero.eyebrow}</p>
            <p aria-hidden="true" className="editorial-index hidden text-xs tracking-[0.18em] text-paper/45 sm:block">DE · EN · FA</p>
          </FadeIn>
          <FadeIn delay={0.08} className="py-12 sm:py-16">
            <h1 className="display-hero max-w-[13ch] text-paper">{copy.hero.title}</h1>
          </FadeIn>
          <FadeIn delay={0.16} className="grid gap-8 border-t border-paper/20 pt-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <p className="max-w-3xl text-lg leading-relaxed text-paper/75 sm:text-xl">{copy.hero.lede}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/method`} className="inline-flex min-h-12 items-center gap-4 bg-paper px-6 text-sm font-semibold text-night hover:bg-signal">
                {copy.hero.primary} <Arrow />
              </Link>
              <Link href={`/${locale}/mission-vision`} className="inline-flex min-h-12 items-center gap-4 border border-paper/35 px-6 text-sm font-semibold text-paper hover:border-paper hover:bg-paper/10">
                {copy.hero.secondary}
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-paper text-night">
        <Container className="py-20 sm:py-28">
          <FadeIn><SectionHeading index={copy.experience.index} eyebrow={copy.experience.eyebrow} title={copy.experience.title} /></FadeIn>
          <FadeIn delay={0.08} className="mt-10 grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
            <div aria-hidden="true" className="flex min-h-56 items-center justify-center border border-night/15">
              <span className="relative text-6xl text-gold">✦</span>
            </div>
            <p className="max-w-3xl text-xl leading-relaxed text-night/70 sm:text-2xl">{copy.experience.text}</p>
          </FadeIn>
        </Container>
      </section>

      <section className="border-y border-border bg-bg">
        <Container className="grid gap-14 py-20 sm:py-28 lg:grid-cols-2">
          <FadeIn>
            <SectionHeading index={copy.human.index} eyebrow={copy.human.eyebrow} title={copy.human.title} />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">{copy.human.text}</p>
          </FadeIn>
          <FadeIn delay={0.08}>
            <SectionHeading index={copy.institutional.index} eyebrow={copy.institutional.eyebrow} title={copy.institutional.title} />
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">{copy.institutional.text}</p>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-night text-paper">
        <Container className="py-20 sm:py-28">
          <FadeIn><SectionHeading index={copy.constellation.index} eyebrow={copy.constellation.eyebrow} title={copy.constellation.title} dark /></FadeIn>
          <FadeIn delay={0.08} className="mt-10">
            <p className="mb-10 max-w-3xl text-lg leading-relaxed text-paper/70">{copy.constellation.text}</p>
            <ConstellationNarrative locale={locale} />
          </FadeIn>
        </Container>
      </section>

      <section className="bg-paper text-night">
        <Container className="py-20 sm:py-28">
          <FadeIn><SectionHeading index={copy.trust.index} eyebrow={copy.trust.eyebrow} title={copy.trust.title} /></FadeIn>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-night/65">{copy.trust.intro}</p>
          <ol className="mt-12 grid list-none gap-px border border-night/15 bg-night/15 md:grid-cols-5">
            {copy.trust.items.map(([title, text], index) => (
              <li key={title} className="bg-paper p-6">
                <span className="editorial-index text-xs text-gold">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 text-2xl">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-night/65">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-deep-blue text-paper">
        <Container className="py-20 sm:py-28">
          <FadeIn><SectionHeading index={copy.fellowship.index} eyebrow={copy.fellowship.eyebrow} title={copy.fellowship.title} dark /></FadeIn>
          <FadeIn delay={0.08} className="mt-10 ms-auto max-w-3xl border-s border-paper/25 ps-7">
            <p className="text-xl leading-relaxed text-paper/75">{copy.fellowship.text}</p>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-bg">
        <Container className="py-20 sm:py-28">
          <FadeIn><SectionHeading index={copy.offerings.index} eyebrow={copy.offerings.eyebrow} title={copy.offerings.title} /></FadeIn>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted">{copy.offerings.text}</p>
          <div className="mt-12"><PublicCategoryOverview locale={locale} /></div>
        </Container>
      </section>

      <section className="border-y border-border bg-paper text-night">
        <Container className="py-20 sm:py-28">
          <FadeIn><SectionHeading index={copy.work.index} eyebrow={copy.work.eyebrow} title={copy.work.title} /></FadeIn>
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

      <section className="bg-bg">
        <Container className="py-20 sm:py-28">
          <FadeIn><SectionHeading index={copy.audiences.index} eyebrow={copy.audiences.eyebrow} title={copy.audiences.title} /></FadeIn>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {copy.audiences.items.map(([title, text], index) => (
              <FadeIn key={title} delay={(index % 2) * 0.05} className="border-t border-border pt-6">
                <h3 className="text-3xl">{title}</h3>
                <p className="mt-4 max-w-xl leading-relaxed text-muted">{text}</p>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-night text-paper">
        <Container className="py-20 sm:py-28">
          <FadeIn><SectionHeading index={copy.close.index} eyebrow={copy.close.eyebrow} title={copy.close.title} dark /></FadeIn>
          <FadeIn delay={0.08} className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-3xl text-lg leading-relaxed text-paper/70">{copy.close.text}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/membership`} className="inline-flex min-h-12 items-center gap-4 bg-paper px-6 text-sm font-semibold text-night hover:bg-signal">
                {copy.close.primary} <Arrow />
              </Link>
              <Link href={`/${locale}/about`} className="inline-flex min-h-12 items-center border border-paper/35 px-6 text-sm font-semibold text-paper hover:border-paper">
                {copy.close.secondary}
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
