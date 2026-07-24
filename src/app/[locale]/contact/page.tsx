import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { pageAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/site/ContactForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getPublicSiteCopy(locale);
  return {
    title: copy.contact.title,
    description: copy.contact.lede,
    alternates: pageAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const resolvedLocale = locale as Locale;
  const copy = getPublicSiteCopy(resolvedLocale);

  return (
    <>
      <PageHeader title={copy.contact.title} lede={copy.contact.lede} />
      <Container className="py-14 sm:py-20">
        <ContactForm locale={resolvedLocale} />
      </Container>
    </>
  );
}
