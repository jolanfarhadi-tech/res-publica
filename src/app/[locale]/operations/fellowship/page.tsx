import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FellowshipOperationsClient } from "@/components/platform/FellowshipOperationsClient";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { fellowshipCopy } from "@/i18n/fellowship";
import { isLocale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = fellowshipCopy[locale];
  return { title: copy.operationsTitle, description: copy.operationsLede, robots: { index: false, follow: false } };
}
export default async function FellowshipOperationsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = fellowshipCopy[locale];
  return <><PageHeader title={copy.operationsTitle} lede={copy.operationsLede} /><Container className="py-14 sm:py-20"><FellowshipOperationsClient locale={locale} /></Container></>;
}
