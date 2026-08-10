import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcademyDashboardClient } from "@/components/platform/AcademyDashboardClient";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { academyCopy } from "@/i18n/academy";
import { isLocale } from "@/i18n/config";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = academyCopy[locale];
  return { title: copy.dashboardTitle, description: copy.dashboardLede, alternates: pageAlternates(locale, "/dashboard/academy"), robots: { index: false, follow: false } };
}
export default async function AcademyDashboardPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = academyCopy[locale];
  return <><PageHeader title={copy.dashboardTitle} lede={copy.dashboardLede} /><Container className="py-14 sm:py-20"><AcademyDashboardClient locale={locale} /></Container></>;
}
