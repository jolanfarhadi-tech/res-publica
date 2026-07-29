import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/motion/FadeIn";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLocale, type Locale } from "@/i18n/config";
import { getExperienceCopy } from "@/i18n/experience";
import { absoluteUrl, pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getExperienceCopy(locale).lab;
  return {
    title: copy.title,
    description: copy.lede,
    alternates: pageAlternates(locale, "/lab"),
    openGraph: { title: copy.title, description: copy.lede },
  };
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const copy = getExperienceCopy(locale).lab;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: copy.title,
          isPartOf: {
            "@type": "WebSite",
            name: "Res Publica e.V.",
            url: absoluteUrl(`/${locale}`),
          },
          url: absoluteUrl(`/${locale}/lab`),
          description: copy.lede,
        }}
      />

      <section className="institutional-grid relative isolate overflow-hidden text-paper">
        <div className="observatory-orbit" aria-hidden="true" />
        <Container className="relative z-10 grid min-h-[72svh] content-between gap-12 py-12 sm:py-18">
          <p className="civic-label text-signal">Res Publica Lab</p>
          <div>
            <h1 className="display-hero text-paper">{copy.title}</h1>
            <p className="mt-8 max-w-3xl text-xl leading-relaxed text-paper/70">
              {copy.lede}
            </p>
          </div>
          <p className="max-w-3xl border-t border-paper/18 pt-6 text-sm leading-relaxed text-paper/56">
            {copy.notice}
          </p>
        </Container>
      </section>

      <section className="section-shell bg-paper text-night">
        <Container className="grid gap-12 lg:grid-cols-[0.35fr_1fr]">
          <p className="civic-label">{copy.missionTitle}</p>
          <FadeIn>
            <h2 className="max-w-4xl text-4xl sm:text-6xl">{copy.missionText}</h2>
          </FadeIn>
        </Container>
      </section>

      <section className="section-shell border-y border-border bg-bg">
        <Container>
          <p className="civic-label">{copy.areasTitle}</p>
          <div className="mt-8 field-grid md:grid-cols-2">
            {copy.areas.map(([title, text], index) => (
              <FadeIn key={title} delay={(index % 2) * 0.04} className="p-6 sm:p-8">
                <span className="editorial-index text-xs text-verdigris">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-10 text-3xl">{title}</h2>
                <p className="mt-4 max-w-xl leading-relaxed text-muted">{text}</p>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-shell bg-surface">
        <Container>
          <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {[
              [copy.experimentsTitle, copy.experimentsText],
              [copy.methodsTitle, copy.methodsText],
              [copy.governanceTitle, copy.governanceText],
              [copy.ethicsTitle, copy.ethicsText],
              [copy.innovationTitle, copy.innovationText],
              [copy.futureTitle, copy.futureText],
            ].map(([title, text]) => (
              <article key={title} className="bg-surface p-6 sm:p-8">
                <h2 className="text-2xl">{title}</h2>
                <p className="mt-4 leading-relaxed text-muted">{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
