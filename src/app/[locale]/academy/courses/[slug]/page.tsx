import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcademyCatalogClient } from "@/components/platform/AcademyCatalogClient";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { academyCopy } from "@/i18n/academy";
import { isLocale } from "@/i18n/config";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const copy = academyCopy[locale];
  return { title: copy.coursesTitle, description: copy.coursesLede, alternates: pageAlternates(locale, `/academy/courses/${slug}`) };
}
export default async function AcademyCoursePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const copy = academyCopy[locale];
  return <><PageHeader title={copy.coursesTitle} lede={copy.coursesLede} /><Container className="py-14 sm:py-20"><AcademyCatalogClient locale={locale} view="course" slug={slug} enrollmentEnabled={process.env.ACADEMY_ENROLLMENT_ENABLED === "true"} /></Container></>;
}
