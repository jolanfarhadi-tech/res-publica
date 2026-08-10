import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcademyOperationsClient } from "@/components/platform/AcademyOperationsClient";
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
  return { title: copy.operationsTitle, description: copy.operationsLede, alternates: pageAlternates(locale, "/operations/academy"), robots: { index: false, follow: false } };
}
export default async function AcademyOperationsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = academyCopy[locale];
  return <><PageHeader title={copy.operationsTitle} lede={copy.operationsLede} /><Container className="py-14 sm:py-20"><AcademyOperationsClient locale={locale} /></Container></>;
}
