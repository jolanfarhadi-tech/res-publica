import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getEntry, getSlugs } from "@/lib/collections";
import { pageAlternates } from "@/lib/seo";
import { CollectionDetail } from "@/components/site/CollectionDetail";
import { EventRegistration } from "@/components/platform/EventRegistration";
import { todayIso } from "@/lib/dates";

const COLLECTION = "events" as const;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getSlugs(COLLECTION).map((slug) => ({ slug }));
}

/**
 * This is valid only while this route is fully generated from static
 * Markdown via generateStaticParams.
 *
 * If CMS, database-backed content, ISR,
 * user-generated content,
 * or AI-generated dynamic routes
 * are introduced,
 * this must be re-evaluated before deployment.
 */
export const dynamicParams = false;

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
      action={(entry.endDate ?? entry.date) >= todayIso()
        ? <EventRegistration locale={locale as Locale} eventId={entry.slug} dict={getDictionary(locale as Locale)} />
        : undefined}
    />
  );
}
