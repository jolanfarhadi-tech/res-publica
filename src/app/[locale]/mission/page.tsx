import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getPage } from "@/lib/content";
import { MdxPage } from "@/components/site/MdxPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { frontmatter } = getPage(locale as Locale, "mission");
  return { title: frontmatter.title, description: frontmatter.description };
}

export default async function MissionPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <MdxPage locale={locale as Locale} slug="mission" />;
}
