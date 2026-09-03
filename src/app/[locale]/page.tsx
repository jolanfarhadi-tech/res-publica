import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { PersonCard } from "@/components/ui/PersonCard";
import { team } from "@/data/team";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { getEntries, type Entry } from "@/lib/collections";
import { absoluteUrl, pageAlternates } from "@/lib/seo";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function ForumCrystal() {
  return (
    <Image
      src="/brand/res-publica-amber-polyhedron-v1.webp"
      alt=""
      width={640}
      height={640}
      sizes="(min-width: 1024px) 128px, 96px"
      className="forum-signal__crystal"
    />
  );
}

function EcosystemNetwork() {
  return (
    <svg className="ecosystem-map__network" viewBox="0 0 800 480" aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ecosystem-route-blue" x1="150" y1="90" x2="400" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#007f9f" stopOpacity="0.2" />
          <stop offset="1" stopColor="#005e83" stopOpacity="0.76" />
        </linearGradient>
        <linearGradient id="ecosystem-route-red" x1="650" y1="390" x2="400" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c61d2d" stopOpacity="0.2" />
          <stop offset="1" stopColor="#9f1723" stopOpacity="0.72" />
        </linearGradient>
      </defs>
      <ellipse className="ecosystem-map__orbit ecosystem-map__orbit--outer" cx="400" cy="240" rx="286" ry="174" />
      <ellipse className="ecosystem-map__orbit ecosystem-map__orbit--inner" cx="400" cy="240" rx="205" ry="112" />
      <path className="ecosystem-map__route" d="M400 240C322 205 271 125 150 92" stroke="url(#ecosystem-route-blue)" />
      <path className="ecosystem-map__route ecosystem-map__route--reverse" d="M400 240C478 205 529 125 650 92" stroke="url(#ecosystem-route-red)" />
      <path className="ecosystem-map__route ecosystem-map__route--reverse" d="M400 240C322 275 271 355 150 388" stroke="url(#ecosystem-route-red)" />
      <path className="ecosystem-map__route" d="M400 240C478 275 529 355 650 388" stroke="url(#ecosystem-route-blue)" />
      <g className="ecosystem-map__junctions">
        <circle cx="150" cy="92" r="5" />
        <circle cx="650" cy="92" r="5" />
        <circle cx="150" cy="388" r="5" />
        <circle cx="650" cy="388" r="5" />
        <circle cx="400" cy="240" r="8" />
      </g>
    </svg>
  );
}

function PortalIcon({ kind }: { kind: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-12 w-12" {...common}>
      {kind === "lab" && <><path d="M18 7h12M21 7v11L11 37a3 3 0 0 0 2.7 4h20.6a3 3 0 0 0 2.7-4L27 18V7"/><path d="M16 31h16M20 25h8"/></>}
      {kind === "projects" && <><circle cx="12" cy="24" r="4"/><circle cx="24" cy="12" r="4"/><circle cx="36" cy="25" r="4"/><circle cx="23" cy="37" r="4"/><path d="m15 21 6-6m6 0 6 7m0 6-7 6m-7 0-5-7"/></>}
      {kind === "programs" && <><path d="m10 15 14-7 14 7-14 7-14-7Z"/><path d="m10 24 14 7 14-7M10 33l14 7 14-7"/></>}
      {kind === "events" && <><rect x="8" y="11" width="32" height="29" rx="3"/><path d="M15 7v8M33 7v8M8 20h32M15 27h4M24 27h4M33 27h1M15 34h4M24 34h4"/></>}
      {kind === "knowledge" && <><circle cx="24" cy="24" r="6"/><circle cx="24" cy="7" r="3"/><circle cx="39" cy="16" r="3"/><circle cx="38" cy="34" r="3"/><circle cx="10" cy="34" r="3"/><circle cx="9" cy="16" r="3"/><path d="m24 10v8m12-1-7 4m7 11-7-4m-10 0-7 4m7-11-7-4"/></>}
      {kind === "communities" && <><circle cx="24" cy="15" r="6"/><circle cx="11" cy="22" r="5"/><circle cx="37" cy="22" r="5"/><path d="M14 41v-5a10 10 0 0 1 20 0v5M4 40v-4a7 7 0 0 1 8-7M44 40v-4a7 7 0 0 0-8-7"/></>}
    </svg>
  );
}

function CollectionPreview({ entries, locale, empty }: { entries: Entry[]; locale: Locale; empty: string }) {
  if (entries.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border p-6 text-sm leading-relaxed text-muted">{empty}</p>;
  }

  const languageTag = locale === "fa" ? "fa-IR" : locale === "de" ? "de-DE" : "en-GB";
  return (
    <ul className="grid list-none gap-3">
      {entries.slice(0, 3).map((entry) => (
        <li key={entry.slug}>
          <Link href={`/${locale}/${entry.collection}/${entry.slug}`} className="group grid gap-2 rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-accent/40">
            <time className="editorial-index text-xs font-semibold text-accent" dateTime={entry.date}>
              {new Intl.DateTimeFormat(languageTag).format(new Date(`${entry.date}T00:00:00Z`))}
            </time>
            <strong className="font-serif text-xl font-medium text-ink group-hover:text-accent">{entry.title}</strong>
            <span className="text-sm leading-relaxed text-muted">{entry.description}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.meta.title, description: dict.meta.description, alternates: pageAlternates(locale, "") };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const copy = getPublicSiteCopy(locale).home;
  const publications = getEntries(locale, "publications");
  const news = getEntries(locale, "news");
  const journeyTracks = [
    { label: copy.journey.humanLabel, steps: copy.journey.human },
    { label: copy.journey.institutionalLabel, steps: copy.journey.institutional },
  ] as const;

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Res Publica e.V.",
        url: absoluteUrl(`/${locale}`),
        logo: absoluteUrl("/brand/res-publica-mark.png"),
        description: dict.meta.description,
        address: { "@type": "PostalAddress", addressLocality: "Frankfurt am Main", addressCountry: "DE" },
      }} />

      <main className="home-stage bg-paper text-night">
        <section className="home-hero overflow-hidden" aria-labelledby="home-title">
          <Container className="home-hero__container max-w-[96rem] pb-6 pt-10 sm:pt-14 lg:pb-8">
            <div className="grid items-center gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-3">
              <div className="relative z-10 py-4 lg:py-12">
                <p className="civic-label text-brand-gold">{copy.hero.eyebrow}</p>
                <h1 id="home-title" className="display-hero mt-5 text-deep-blue">{copy.hero.title}</h1>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-night/72">{copy.hero.lede}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/${locale}/projects`} className="button-primary rounded-full bg-brand-red px-6">{copy.hero.primary} <Arrow /></Link>
                  <Link href={`/${locale}/about`} className="button-secondary rounded-full px-6">{copy.hero.secondary}</Link>
                </div>
              </div>

              <figure className="forum-hero relative isolate min-w-0">
                <ul className="forum-people absolute inset-x-[8%] top-0 z-10 grid list-none grid-cols-3 items-start" aria-label={copy.featured.teamTitle}>
                  {team.map((member, index) => (
                    <li key={member.id} className={index === 1 ? "justify-self-center" : index === 2 ? "justify-self-end" : "justify-self-start"}>
                      <div className="forum-person relative h-16 w-16 overflow-hidden rounded-full bg-white sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                        <Image src={member.image ?? ""} alt="" fill sizes="96px" className="object-cover scale-[1.035]" />
                        <span className="sr-only">{member.name}, {member.role[locale]}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Image src="/brand/res-publica-civic-forum-logo-3d-v3.webp" alt={copy.hero.forumAlt} width={1536} height={1024} priority sizes="(min-width: 1024px) 64vw, 100vw" className="forum-hero__image h-auto w-full" />
                <span className="forum-signal" aria-hidden="true">
                  <span className="forum-signal__orbit" />
                  <ForumCrystal />
                </span>
                <figcaption className="mx-auto -mt-4 w-fit rounded-full border border-night/10 bg-white/88 px-4 py-2 text-center text-xs font-semibold text-deep-blue shadow-sm backdrop-blur sm:-mt-8">{copy.hero.forumCaption}</figcaption>
              </figure>
            </div>

            <aside className="institutional-snapshot relative z-20 mt-7 overflow-hidden border border-night/10 bg-white/94" aria-label={copy.snapshot.label}>
              <ul className="grid list-none grid-cols-2 sm:grid-cols-3 lg:grid-cols-9">
                {copy.snapshot.items.map(([value, label, detail]) => (
                  <li key={label} className="snapshot-item min-w-0 px-4 py-5 text-center">
                    <strong className="editorial-index block font-serif text-3xl font-medium text-deep-blue">{value}</strong>
                    <span className="mt-1 block text-xs font-semibold leading-tight text-night/72">{label}</span>
                    {detail && <span className="mt-1 block text-[0.68rem] text-muted">{detail}</span>}
                  </li>
                ))}
              </ul>
              <p className="border-t border-night/8 px-4 py-2 text-center text-[0.68rem] leading-relaxed text-muted">{copy.snapshot.note}</p>
            </aside>
          </Container>
        </section>

        <section className="home-section home-section--gateways py-10 sm:py-16" aria-labelledby="gateways-title">
          <Container className="max-w-[96rem]">
            <p className="civic-label">{copy.gateways.eyebrow}</p>
            <h2 id="gateways-title" className="mt-3 max-w-3xl text-3xl text-deep-blue sm:text-4xl">{copy.gateways.title}</h2>
            <ul className="portal-grid mt-8 grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {copy.gateways.items.map(([title, text, href, kind]) => (
                <li key={href}>
                  <Link href={`/${locale}${href}`} className="portal-card group flex h-full min-h-64 flex-col overflow-hidden border border-border bg-white p-5">
                    <span className="portal-card__icon text-accent transition-transform duration-300 motion-safe:group-hover:-translate-y-1"><PortalIcon kind={kind} /></span>
                    <h3 className="mt-7 text-2xl text-deep-blue">{title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{text}</p>
                    <span className="mt-6 self-end text-accent"><Arrow /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className="home-section home-section--journey relative border-y border-border py-14 sm:py-20" aria-labelledby="journey-title">
          <Container className="max-w-[96rem]">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div><p className="civic-label">{copy.journey.eyebrow}</p><h2 id="journey-title" className="mt-4 text-4xl leading-tight text-deep-blue sm:text-5xl">{copy.journey.title}</h2></div>
              <p className="max-w-2xl text-lg leading-relaxed text-muted">{copy.journey.intro}</p>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {journeyTracks.map((track, trackIndex) => (
                <article key={track.label} className={`journey-track rounded-3xl p-6 sm:p-8 ${trackIndex === 1 ? "journey-track--institutional" : ""}`}>
                  <p className="civic-label">{track.label}</p>
                  <ol className="mt-7 grid list-none gap-3 sm:grid-cols-4">
                    {track.steps.map((step, index) => <li key={step} className="rounded-xl border border-current/15 bg-white/55 px-4 py-4 text-sm font-semibold"><span className="editorial-index me-2 text-brand-red">{index + 1}</span>{step}</li>)}
                  </ol>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="ecosystem-field home-section relative overflow-hidden py-14 sm:py-24" aria-labelledby="ecosystem-title">
          <Container className="grid max-w-[96rem] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div>
              <p className="civic-label text-brand-gold">{copy.featured.ecosystemEyebrow}</p>
              <h2 id="ecosystem-title" className="mt-4 text-4xl leading-tight text-deep-blue sm:text-5xl">{copy.featured.ecosystemTitle}</h2>
              <p className="mt-5 max-w-xl leading-relaxed text-muted">{copy.featured.ecosystemText}</p>
              <Link href={`/${locale}/about`} className="button-secondary mt-7 rounded-full">{copy.ecosystem.open} <Arrow /></Link>
            </div>
            <div className="ecosystem-map relative min-h-[32rem] overflow-hidden border border-border bg-white" role="img" aria-label={copy.ecosystem.graphicCaption}>
              <div className="ecosystem-map__grid" aria-hidden="true" />
              <EcosystemNetwork />
              <div className="ecosystem-map__core" aria-hidden="true">
                <span className="ecosystem-map__core-halo" />
                <Image src="/brand/res-publica-logo.png" alt="" width={1200} height={216} className="ecosystem-map__logo" />
              </div>
              <ul className="absolute inset-0 list-none">
                {copy.ecosystem.platforms.map((platform, index) => (
                  <li key={platform.name} className={`ecosystem-map__node ecosystem-map__node--${index + 1}`}>
                    <span className="ecosystem-map__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <span className="ecosystem-map__node-copy">
                      <span className="block text-xs font-bold text-deep-blue">{platform.name}</span>
                      <span className="mt-1 block text-[0.65rem] text-muted">{platform.scope}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        <section className="home-section home-section--team border-y border-border py-14 sm:py-20" aria-labelledby="team-title">
          <Container className="grid max-w-[96rem] gap-7 lg:grid-cols-[0.55fr_1.45fr] lg:items-end">
            <div>
              <p className="civic-label">{copy.featured.teamEyebrow}</p>
              <h2 id="team-title" className="mt-4 text-4xl text-deep-blue sm:text-5xl">{copy.featured.teamTitle}</h2>
              <p className="mt-4 leading-relaxed text-muted">{copy.featured.teamText}</p>
              <Link href={`/${locale}/team`} className="button-secondary mt-6 rounded-full">{copy.featured.teamAction} <Arrow /></Link>
            </div>
            <ul className="grid list-none gap-4 sm:grid-cols-3">
              {team.map((member) => <li key={member.id}><PersonCard name={member.name} role={member.role[locale]} image={member.image} /></li>)}
            </ul>
          </Container>
        </section>

        <section className="home-section home-section--latest py-14 sm:py-20" aria-labelledby="latest-title">
          <Container className="max-w-[96rem]">
            <p className="civic-label">{copy.featured.latestEyebrow}</p>
            <h2 id="latest-title" className="mt-4 text-4xl text-deep-blue sm:text-5xl">{copy.featured.latestTitle}</h2>
            <div className="mt-9 grid gap-8 lg:grid-cols-2">
              <div><div className="mb-4 flex items-center justify-between gap-4"><h3 className="text-2xl text-deep-blue">{copy.featured.publications}</h3><Link href={`/${locale}/publications`} className="text-sm font-semibold text-accent">{copy.featured.allPublications} <Arrow /></Link></div><CollectionPreview entries={publications} locale={locale} empty={copy.featured.empty} /></div>
              <div><div className="mb-4 flex items-center justify-between gap-4"><h3 className="text-2xl text-deep-blue">{copy.featured.news}</h3><Link href={`/${locale}/news`} className="text-sm font-semibold text-accent">{copy.featured.allNews} <Arrow /></Link></div><CollectionPreview entries={news} locale={locale} empty={copy.featured.empty} /></div>
            </div>
          </Container>
        </section>

        <section className="bg-night py-14 text-paper sm:py-18">
          <Container className="grid max-w-[96rem] gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><p className="civic-label inverse-label">{copy.close.eyebrow}</p><h2 className="mt-4 max-w-4xl text-4xl leading-tight sm:text-6xl">{copy.close.title}</h2><p className="mt-6 max-w-3xl text-lg leading-relaxed text-paper/70">{copy.close.text}</p></div>
            <div className="flex flex-wrap gap-3"><Link href={`/${locale}/membership`} className="button-primary border-paper bg-paper text-night hover:bg-signal">{copy.close.primary} <Arrow /></Link><Link href={`/${locale}/about`} className="button-secondary border-paper/30 bg-transparent text-paper hover:border-paper">{copy.close.secondary}</Link></div>
          </Container>
        </section>
      </main>
    </>
  );
}
