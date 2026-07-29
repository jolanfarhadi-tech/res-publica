import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PreferenceControls } from "@/components/privacy/PreferenceProvider";
import { isLocale, type Locale } from "@/i18n/config";
import { getExperienceCopy } from "@/i18n/experience";
import { pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getExperienceCopy(locale).privacy;
  return {
    title: copy.title,
    description: copy.lede,
    alternates: pageAlternates(locale, "/privacy"),
    robots: { index: false, follow: true },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const copy = getExperienceCopy(locale).privacy;

  return (
    <>
      <section className="border-b border-border bg-paper text-night">
        <Container className="py-16 sm:py-24">
          <p className="civic-label">{copy.localTitle}</p>
          <h1 className="mt-5 max-w-4xl text-5xl sm:text-6xl">{copy.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-night/68">
            {copy.lede}
          </p>
        </Container>
      </section>
      <Container className="section-shell">
        <div className="glass-panel rounded-2xl p-5 sm:p-8">
          <PreferenceControls locale={locale} />
        </div>
        <p className="mt-8 text-sm text-muted">
          <Link
            href={`/${locale}/datenschutz`}
            className="font-semibold text-accent underline decoration-accent/30 underline-offset-4"
          >
            {copy.legalLink}
          </Link>
        </p>
      </Container>
    </>
  );
}
