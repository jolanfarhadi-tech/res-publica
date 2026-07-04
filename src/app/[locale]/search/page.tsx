import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchClient } from "@/components/site/SearchClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.search.title,
    description: dict.search.lede,
    alternates: pageAlternates(locale, "/search"),
    robots: { index: false }, // search results pages should not be indexed
  };
}

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <>
      <PageHeader title={dict.search.title} lede={dict.search.lede} />
      <Container className="py-14 sm:py-20">
        <SearchClient locale={locale as Locale} dict={dict} />
      </Container>
    </>
  );
}
