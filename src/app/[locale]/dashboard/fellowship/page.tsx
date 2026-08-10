import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FellowshipDashboardClient } from "@/components/platform/FellowshipDashboardClient";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { fellowshipCopy } from "@/i18n/fellowship";
import { isLocale } from "@/i18n/config";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = fellowshipCopy[locale];
  return { title: copy.dashboardTitle, description: copy.dashboardLede, alternates: pageAlternates(locale, "/dashboard/fellowship"), robots: { index: false, follow: false } };
}
export default async function FellowshipDashboardPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = fellowshipCopy[locale];
  return <><PageHeader title={copy.dashboardTitle} lede={copy.dashboardLede} /><Container className="py-14 sm:py-20"><FellowshipDashboardClient locale={locale} /></Container></>;
}
