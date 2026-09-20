import type { Metadata } from "next";
import { ArchitecturalGlyph } from "@/components/site/ArchitecturalGlyph";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { EcosystemAtlas } from "@/components/site/EcosystemAtlas";
import { CinematicReadingSurface } from "@/components/site/CinematicReadingSurface";
import { Container } from "@/components/ui/Container";
import { PersonCard } from "@/components/ui/PersonCard";
import { team } from "@/data/team";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { getEntries, type Entry } from "@/lib/collections";
import { absoluteUrl, pageAlternates } from "@/lib/seo";

function Arrow() {
  return <span className="action-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></span>;
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
    return <p className="collection-empty">{empty}</p>;
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
  const number = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale);
  const snapshotKinds = ["lab", "projects", "communities", "knowledge", "events", "projects", "programs", "events", "communities"];
  const invitation = {
    de: { title: "Gestalten wir den öffentlichen Raum. Gemeinsam.", text: "Bringen Sie Ihre Perspektive ein. Entdecken Sie unsere Programme, lernen Sie das Team kennen oder informieren Sie sich über eine Mitgliedschaft.", action: "Wege zur Beteiligung", paths: ["Zuhören", "Mitgestalten", "Verantwortung teilen"] },
    en: { title: "Shape our shared public space. Together.", text: "Bring your perspective. Explore our programmes, meet the team or find out what membership involves.", action: "Explore participation", paths: ["Listen", "Contribute", "Share responsibility"] },
    fa: { title: "این فضای مشترک، با حضور شما شکل می‌گیرد.", text: "دیدگاه شما بخشی از گفت‌وگوست. برنامه‌ها را بشناسید، با تیم آشنا شوید و مسیر عضویت و مشارکت را بررسی کنید.", action: "شناخت مسیر مشارکت", paths: ["شنیدن", "هم‌فکری", "مسئولیت مشترک"] },
  }[locale];
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

      <div className="home-stage home-editorial text-night">
        <section className="home-hero overflow-hidden" aria-labelledby="home-title">
          <Container className="home-hero__container max-w-[96rem] pb-6 pt-10 sm:pt-14 lg:pb-8">
            <div className="grid items-center gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-3">
              <CinematicReadingSurface className="home-hero__copy relative z-10 py-7 sm:p-8 lg:p-10">
                <p className="civic-label text-brand-gold">{copy.hero.eyebrow}</p>
                <h1 id="home-title" className="display-hero mt-5 text-deep-blue">{copy.hero.title}</h1>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-night/72">{copy.hero.lede}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/${locale}/projects`} className="button-primary rounded-full bg-brand-red px-6">{copy.hero.primary} <Arrow /></Link>
                  <Link href={`/${locale}/about`} className="button-secondary rounded-full px-6">{copy.hero.secondary}</Link>
                </div>
              </CinematicReadingSurface>

              <div className="home-hero__opening" aria-hidden="true" />
            </div>

            <aside className="institutional-snapshot" aria-label={copy.snapshot.label}>
              <ul className="snapshot-grid">
                {copy.snapshot.items.map(([value, label, detail], index) => (
                  <li key={label} className="snapshot-item" data-tone={index % 3}>
                    <span className="snapshot-icon"><PortalIcon kind={snapshotKinds[index]} /></span>
                    <strong className="editorial-index block font-serif text-3xl font-medium text-deep-blue">{value}</strong>
                    <span className="mt-1 block text-xs font-semibold leading-tight text-night/72">{label}</span>
                    {detail && <span className="mt-1 block text-[0.68rem] text-muted">{detail}</span>}
                  </li>
                ))}
              </ul>
              <p className="snapshot-note">{copy.snapshot.note}</p>
            </aside>
          </Container>
        </section>

        <section className="home-section home-section--gateways py-10 sm:py-16" aria-labelledby="gateways-title">
          <Container className="max-w-[96rem]">
            <h2 id="gateways-title" className="sr-only">{copy.gateways.title}</h2>
            <ul className="portal-grid">
              {copy.gateways.items.map(([title, text, href, kind], index) => (
                <li key={href} data-tone={index % 3}>
                  <Link href={`/${locale}${href}`} className="portal-card group">
                    <div className="portal-card__drawing"><span className="editorial-number">{number.format(index + 1).padStart(2, locale === "fa" ? "۰" : "0")}</span><ArchitecturalGlyph kind={kind} /></div>
                    <div className="portal-card__content"><h3>{title}</h3><p>{text}</p></div>
                    <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <section className="home-section home-section--journey relative border-y border-border py-14 sm:py-20" aria-labelledby="journey-title">
          <Container className="max-w-[96rem]">
            <div className="section-introduction">
              <h2 id="journey-title">{copy.journey.eyebrow}</h2>
              <p>{copy.journey.title}</p>
            </div>
            <div className="journey-grid">
              {journeyTracks.map((track, trackIndex) => (
                <article key={track.label} className={`journey-track rounded-3xl p-6 sm:p-8 ${trackIndex === 1 ? "journey-track--institutional" : ""}`}>
                  <header><PortalIcon kind={trackIndex ? "knowledge" : "communities"} /><h3>{track.label}</h3></header>
                  <ol className="journey-stations">
                    {track.steps.map((step, index) => <li key={step}><span className="journey-station-number">{number.format(index + 1)}</span><span>{step}</span></li>)}
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
            <EcosystemAtlas locale={locale} />
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
            <h2 id="latest-title" className="sr-only">{copy.featured.latestTitle}</h2>
            <div className="editorial-collections">
              <article className="editorial-collection" data-tone="2"><ArchitecturalGlyph kind="publications" /><h3>{copy.featured.publications}</h3><CollectionPreview entries={publications} locale={locale} empty={copy.featured.empty} /><Link href={`/${locale}/publications`} className="button-secondary">{copy.featured.allPublications} <Arrow /></Link></article>
              <article className="editorial-collection" data-tone="1"><ArchitecturalGlyph kind="news" /><h3>{copy.featured.news}</h3><CollectionPreview entries={news} locale={locale} empty={copy.featured.empty} /><Link href={`/${locale}/news`} className="button-secondary">{copy.featured.allNews} <Arrow /></Link></article>
            </div>
          </Container>
        </section>

        <section className="home-close relative isolate overflow-hidden py-16 text-paper sm:py-24">
          <Container className="relative z-10 max-w-[96rem]">
            <div className="home-close__panel">
              <div className="invitation-drawing"><ArchitecturalGlyph kind="join" /><ul>{invitation.paths.map(path => <li key={path}>{path}</li>)}</ul></div>
              <div className="invitation-copy"><p className="civic-label">{copy.close.eyebrow}</p><h2>{invitation.title}</h2><p>{invitation.text}</p>
              <div className="invitation-actions"><Link href={`/${locale}/membership`} className="button-primary">{invitation.action} <Arrow /></Link><Link href={`/${locale}/team`} className="button-secondary">{copy.featured.teamAction} <Arrow /></Link></div></div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
