import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageAlternates } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeamSection } from "@/components/site/TeamSection";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.pages.team.title,
    description: dict.pages.team.lede,
    alternates: pageAlternates(locale, "/team"),
  };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <PageHeader title={dict.pages.team.title} lede={dict.pages.team.lede} />
      <TeamSection locale={locale as Locale} />
    </>
  );
}
