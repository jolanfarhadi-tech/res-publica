import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { pageAlternates } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { EcosystemOverview } from "@/components/site/EcosystemOverview";
import { OfferingMatrix } from "@/components/site/OfferingMatrix";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getPublicSiteCopy(locale).offerings;
  return {
    title: copy.title,
    description: copy.lede,
    alternates: pageAlternates(locale, "/offerings"),
  };
}

export default async function OfferingsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const resolvedLocale = locale as Locale;
  const copy = getPublicSiteCopy(resolvedLocale).offerings;

  return (
    <>
      <PageHeader title={copy.title} lede={copy.lede} />
      <Container className="py-14 sm:py-20">
        <EcosystemOverview locale={resolvedLocale} />
        <section aria-labelledby="offering-maturity" className="pt-16 sm:pt-20">
          <h2 id="offering-maturity" className="mb-10 text-4xl sm:text-5xl">{copy.maturityTitle}</h2>
          <OfferingMatrix locale={resolvedLocale} />
        </section>
      </Container>
    </>
  );
}
