import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { pageAlternates } from "@/lib/seo";
import { PublicCategoryPage } from "@/components/site/PublicCategoryPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getPublicSiteCopy(locale).categories.services;
  return {
    title: copy.title,
    description: copy.lede,
    alternates: pageAlternates(locale, "/services"),
  };
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <PublicCategoryPage locale={locale as Locale} category="services" />;
}
