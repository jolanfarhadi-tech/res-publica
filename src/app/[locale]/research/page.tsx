import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageAlternates } from "@/lib/seo";
import { CollectionIndex } from "@/components/site/CollectionIndex";

const COLLECTION = "research" as const;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const section = getDictionary(locale).collections[COLLECTION];
  return {
    title: section.title,
    description: section.lede,
    alternates: pageAlternates(locale, `/${COLLECTION}`),
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { tag, page } = await searchParams;

  return (
    <CollectionIndex
      locale={locale as Locale}
      collection={COLLECTION}
      dict={getDictionary(locale as Locale)}
      tag={tag}
      page={Number(page) || 1}
    />
  );
}
