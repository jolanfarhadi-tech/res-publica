import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getEntry, getSlugs } from "@/lib/collections";
import { pageAlternates } from "@/lib/seo";
import { CollectionDetail } from "@/components/site/CollectionDetail";

const COLLECTION = "research" as const;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getSlugs(COLLECTION).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const entry = getEntry(locale, COLLECTION, slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.description,
    alternates: pageAlternates(locale, `/${COLLECTION}/${slug}`),
  };
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const entry = getEntry(locale as Locale, COLLECTION, slug);
  if (!entry) notFound();

  return (
    <CollectionDetail
      locale={locale as Locale}
      entry={entry}
      dict={getDictionary(locale as Locale)}
    />
  );
}
